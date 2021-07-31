const { HttpService } = require('eufy-node-client')
const winston = require('winston')
const get = require('get-value')
const { supportedDevices } = require('../enums/device_type')

class EufyHttp {
  devices
  deviceObjects

  constructor (username, password) {
    this.httpService = new HttpService(username, password)
    this.deviceObjects = []
  }

  deviceListUpToDate () {
    if (!this.devicesRefreshedAt) {
      return false
    }

    const now = new Date().getTime()
    return (now - this.devicesRefreshedAt) < (15 * 60 * 1000)
  }

  async getDevices () {
    if (this.devices && this.deviceListUpToDate()) {
      return this.devices
    }

    winston.debug('Refreshing devices...')

    try {
      this.devices = await this.httpService.listDevices()
    } catch (e) {
      winston.error(`Error -- httpService.listDevices`, e)
      this.devices = []
    }
    this.devicesRefreshedAt = new Date().getTime()
    winston.silly(`Device list: `, this.devices)

    return this.devices
  }

  async refreshStoredDevices () {
    const devices = await this.getDevices()
    for (let device of devices) {
      const id = get(device, 'device_sn', { default: null })
      if (id === null) {
        winston.error('Cannot get device_sn for device', { device })
        continue
      }

      const station_sn = get(device, 'station_sn', { default: null })
      const name = get(device, 'device_name', { default: null })
      const type = get(device, 'device_model', { default: null })

      winston.info(`Found device: ${device.device_name} (${device.device_sn} - type: ${type})`)

      this.deviceObjects.push({
        id,
        station_sn,
        name,
        type
      })

      if (!supportedDevices.includes(type)) {
        winston.warn(`DEVICE ${device.device_name} NOT SUPPORTED! See: https://github.com/matijse/eufy-ha-mqtt-bridge/issues/7`)
      }
    }
  }

  async registerPushToken (fcmToken) {
    try {
      const response = await this.httpService.registerPushToken(fcmToken);
      winston.info(`Registered Push Token`, { response })
    } catch (e) {
      winston.error(`Error -- httpService.registerPushToken`, e)
    }
  }

  async checkPushToken () {
    try {
      const response = await this.httpService.pushTokenCheck()
      winston.info(`Checked Push Token`, { response })
    } catch (e) {
      winston.error(`Error -- httpService.pushTokenCheck`, e)
    }
  }
}

module.exports = EufyHttp
