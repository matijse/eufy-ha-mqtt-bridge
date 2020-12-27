const inquirer = require('inquirer')
const winston = require('winston')
const DB = require('../db')
const Settings = require('../enums/settings')
const { MqttClient } = require('../mqtt')
const { EufyHttp, EufyPush } = require('../eufy')

class EufyClient {

  async init() {
    this.settings = await DB.getAllSettings()

    if (Object.values(this.settings).includes(null)) {
      winston.info(`Missing setting(s)... Running setup.`)
      await this.setup()
      this.settings = await DB.getAllSettings()
    }

    this.mqttClient = new MqttClient()
    this.eufyHttpClient = new EufyHttp(this.settings[Settings.EUFY_USERNAME], this.settings[Settings.EUFY_PASSWORD])
    this.eufyPush = new EufyPush(this.mqttClient)

    await this.mqttClient.connect()
    await this.eufyHttpClient.refreshDevices()
    await this.mqttClient.setupAutoDiscovery()
    await this.eufyPush.retrievePushCredentials()
    await this.eufyPush.startPushClient()
    const fcmToken = this.eufyPush.getFcmToken()
    await this.eufyHttpClient.registerPushToken(fcmToken)
    //
    // setInterval(async () => {
    //   console.log('checking push token')
    //   await this.eufyHttpClient.checkPushToken()
    // }, 30 * 1000)
  }

  async setup() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: Settings.EUFY_USERNAME,
        message: "Username of your Eufy account",
      },
      {
        type: 'password',
        name: Settings.EUFY_PASSWORD,
        message: "Password of your Eufy account",
      },
      {
        type: 'input',
        name: Settings.MQTT_URL,
        message: "MQTT broker url",
        default: 'mqtt://homeassistant.local:1883'
      },
      {
        type: 'input',
        name: Settings.MQTT_USERNAME,
        message: "MQTT username",
      },
      {
        type: 'password',
        name: Settings.MQTT_PASSWORD,
        message: "MQTT password",
      },
    ])

    for (let setting of Object.keys(answers)) {
      await DB.storeSetting(setting, answers[setting])
    }
  }
}

module.exports = EufyClient
