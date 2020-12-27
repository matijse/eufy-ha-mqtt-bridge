const { HttpService } = require('eufy-node-client')
const winston = require('winston')
const DB = require('../db')

class EufyHttp {
  constructor (username, password) {
    this.httpService = new HttpService(username, password)
  }

  async refreshDevices () {
    const devices = await this.httpService.listDevices()
    for (let device of devices) {
      await DB.createOrUpdateDevice(device)
      winston.info(`Stored device: ${device.device_name} (${device.device_sn})`)
    }
  }

  async registerPushToken (fcmToken) {
    const response = await this.httpService.registerPushToken(fcmToken);
    winston.info(`Registered Push Token`, { response })
  }

  async checkPushToken () {
    const response = await this.httpService.pushTokenCheck()
    winston.info(`Checked Push Token`, { response })
  }
}

module.exports = EufyHttp
