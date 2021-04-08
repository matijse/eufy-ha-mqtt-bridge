const { HTTPApi, AuthResult } = require('eufy-security-client')
const config = require('../config')
const winston = require('winston')
// const get = require('get-value')
// const { supportedDevices } = require('../enums/device_type')

class EufyHttp {
  httpApi

  constructor () {
    this.httpApi = new HTTPApi(config.get(config.EUFY_USERNAME), config.get(config.EUFY_PASSWORD), winston)
  }

  async authenticate () {
    if (config.has(config.EUFY_TOKEN) && config.has(config.EUFY_TOKEN_EXPIRATION) && config.has(config.EUFY_API_BASE)) {
      winston.info('Trying to authenticate with previous token')
      this.httpApi.setToken(config.get(config.EUFY_TOKEN))
      this.httpApi.setTokenExpiration(config.get(config.EUFY_TOKEN_EXPIRATION))
      this.httpApi.setAPIBase(config.get(config.EUFY_API_BASE))
    }

    let result = await this.httpApi.authenticate()

    if (result === AuthResult.RENEW) {
      winston.info('Token needs to be renewed')
      result = await this.httpApi.authenticate()
    }

    console.log(
      result,
      this.httpApi.getToken(),
      this.httpApi.getTokenExpiration(),
      this.httpApi.getAPIBase()
    )

    config.set(config.EUFY_TOKEN, this.httpApi.getToken())
    config.set(config.EUFY_TOKEN_EXPIRATION, this.httpApi.getTokenExpiration())
    config.set(config.EUFY_API_BASE, this.httpApi.getAPIBase())
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

    await this.httpApi.updateDeviceInfo()
    this.devices = await this.httpApi.getDevices()
    this.devicesRefreshedAt = new Date().getTime()
    winston.silly(`Device list: `, Object.keys(this.devices))

    return this.devices
  }

  async refreshStoredDevices () {
    const devices = await this.getDevices()
    // for (let device of devices) {
    //   await DB.createOrUpdateDevice(device)
    //   const deviceType = get(device, 'device_model', { default: null })
    //
    //   winston.info(`Stored device: ${device.device_name} (${device.device_sn} - type: ${deviceType})`)
    //
    //   if (!supportedDevices.includes(deviceType)) {
    //     winston.warn(`DEVICE ${device.device_name} NOT SUPPORTED! See: https://github.com/matijse/eufy-ha-mqtt-bridge/issues/7`)
    //   }
    // }
  }

  async registerPushToken (fcmToken) {
    const response = await this.httpApi.registerPushToken(fcmToken)
    winston.info(`Registered Push Token`, { response })
  }

  async checkPushToken () {
    const response = await this.httpApi.checkPushToken()
    winston.info(`Checked Push Token`, { response })
  }

  // async setArmingMode () {
  //   const lookupService = new LocalLookupService();
  //   const address = await lookupService.lookup('192.168.1.1');
  //   console.log('Found address', address);
  //
  //   const devClientService = new DeviceClientService(address, P2P_DID, ACTOR_ID);
  //   await devClientService.connect();
  //   console.log('Connected!');
  //
  //   // CMD_SET_ARMING  # 0 => away 1 => home, 2 => schedule, 63 => disarmed
  //   devClientService.sendCommandWithInt(CommandType.CMD_SET_ARMING, 1);
  //   console.log('Sended command...');
  // }
}

module.exports = EufyHttp
