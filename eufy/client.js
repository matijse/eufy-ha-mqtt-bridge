const winston = require('winston')
const config = require('../config')
const { MqttClient } = require('../mqtt')
const { EufyHttp, EufyPush, EufyDevices } = require('../eufy')
const Scheduler = require('../sheduler')

class EufyClient {

  async init() {
    this.mqttClient = new MqttClient()
    this.eufyHttpClient = new EufyHttp(config.eufyUsername, config.eufyPassword)
    this.eufyPush = new EufyPush(this.mqttClient)
    this.eufyDevices = new EufyDevices(this.eufyHttpClient, this.mqttClient)

    this.mqttClient.onMqttMessage = this.onMqttMessage.bind(this)

    await this.mqttClient.connect()
    await this.eufyHttpClient.refreshStoredDevices()
    await this.mqttClient.setupAutoDiscovery()
    await this.eufyPush.retrievePushCredentials()
    await this.eufyPush.startPushClient()
    const fcmToken = this.eufyPush.getFcmToken()
    await this.eufyHttpClient.registerPushToken(fcmToken)
    await this.eufyDevices.retrieveDeviceThumbnails()

    Scheduler.runEveryHour(async () => {
      await this.eufyDevices.processDeviceProperties()
    }, true)
  }

  async onMqttMessage (topic, message) {
    message = message.toString()
    winston.debug(`MQTT message: [${topic}]: ${message}`)

    if (topic === 'homeassistant/status') {
      if (message === 'online') {
        await this.onHomeAssistantStartup()
      }
    }
  }

  async onHomeAssistantStartup () {
    await this.eufyHttpClient.refreshStoredDevices()
    await this.mqttClient.setupAutoDiscovery()
    await this.eufyDevices.retrieveDeviceThumbnails()
  }
}

exports.EufyClient = EufyClient
