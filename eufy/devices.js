const get = require('get-value')
const { SensorType } = require('../enums/sensor_type')

class EufyDevices {
  constructor (eufyHttp, mqttClient) {
    this.http = eufyHttp
    this.mqtt = mqttClient
  }

  async retrieveDeviceThumbnails () {
    const devices = await this.http.getDevices()
    for (let device of devices) {
      await this.processDeviceThumbnail(device)
    }
  }

  async processDeviceProperties () {
    const devices = await this.http.getDevices()
    for (let device of devices) {
      await this.processDeviceBatteryStatus(device)
    }
  }

  async processDeviceThumbnail (device) {
    const deviceSN = get(device, 'device_sn', { default: false })
    if (!deviceSN) {
      return
    }

    const thumbnailUrl = get(device, 'cover_path', { default: false })
    if (!thumbnailUrl || thumbnailUrl === '') {
      return
    }

    await this.mqtt.uploadThumbnail(deviceSN, thumbnailUrl)
  }

  async processDeviceBatteryStatus (device) {
    const deviceSN = get(device, 'device_sn', { default: false })
    if (!deviceSN) {
      return
    }

    const params = get(device, 'params', { default: [] })
    const param = params.find(p => p.param_type === SensorType.BATTERY_PERCENTAGE)

    if (!param || !param.param_value) {
      return
    }

    await this.mqtt.publishBatteryPercentage(deviceSN, parseInt(param.param_value))
  }
}

module.exports = EufyDevices
