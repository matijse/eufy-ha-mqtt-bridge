const winston = require('winston')
const config = require('../config')
const { MqttClient } = require('../mqtt')
const { EufyHttp, EufyPush, EufyDevices } = require('../eufy')
const Scheduler = require('../sheduler')

class EufyClient {

  async init() {
    winston.debug('---- EUFY INITIALIZE START ----')
    this.mqttClient = new MqttClient()
    this.eufyHttpClient = new EufyHttp(config.eufyUsername, config.eufyPassword)
    this.eufyPush = new EufyPush(this.mqttClient)
    this.eufyDevices = new EufyDevices(this.eufyHttpClient, this.mqttClient)
    winston.debug('----  Created classes...')

    await this.eufyHttpClient.refreshStoredDevices()
    winston.debug('----  Refreshed devices')

    this.mqttClient.onMqttMessage = this.onMqttMessage.bind(this)
    winston.debug('----  Set up MQTT handler')

    await this.mqttClient.connect()
    winston.debug('----  Connected to MQTT')

    await this.mqttClient.setupAutoDiscovery(this.eufyHttpClient.deviceObjects)
    winston.debug('----  Set up auto discovery')

    await this.eufyPush.retrievePushCredentials()
    winston.debug('----  Retrieved push credentials')

    await this.eufyPush.startPushClient()
    winston.debug('----  Started push client')

    const fcmToken = this.eufyPush.getFcmToken()
    await this.eufyHttpClient.registerPushToken(fcmToken)
    winston.debug('----  Registered push token')

    await this.eufyDevices.retrieveDeviceThumbnails()
    winston.debug('----  Retrieved device thumbnails')

    Scheduler.runEveryHour(async () => {
      await this.eufyDevices.processDeviceProperties()
    }, true)
    winston.debug('---- EUFY INITIALIZE DONE! ----')
  }

  async onMqttMessage (topic, message) {
    message = message.toString()
    winston.debug(`MQTT message: [${topic}]: ${message}`)

    if (topic === 'homeassistant/status') {
      if (message === 'online') {
        winston.debug('HomeAssistant: started')
        await this.onHomeAssistantStartup()
      }
    }
  }

  async onHomeAssistantStartup () {
    await this.eufyHttpClient.refreshStoredDevices()
    await this.mqttClient.setupAutoDiscovery(this.eufyHttpClient.deviceObjects)
    await this.eufyDevices.processDeviceProperties()
    await this.eufyDevices.retrieveDeviceThumbnails()
  }
}

module.exports = EufyClient
