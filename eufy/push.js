const fs = require('fs')
const winston = require('winston')
const { PushRegisterService, PushClient, sleep } = require('eufy-node-client')
const DB = require('../db')

class EufyPush {
  CREDENTIALS_FILE = './data/credentials.json'
  pushCredentials = null

  constructor (mqttClient) {
    this.mqttClient = mqttClient
  }

  async retrievePushCredentials() {
    if (this.pushCredentials) {
      return
    }

    if (fs.existsSync(this.CREDENTIALS_FILE)) {
      winston.info('Credentials found -> reusing them...');
      this.pushCredentials = JSON.parse(fs.readFileSync(this.CREDENTIALS_FILE).toString());
      return
    }

    // Register push credentials
    winston.info('No credentials found -> register new...');
    const pushService = new PushRegisterService();
    this.pushCredentials = await pushService.createPushCredentials();
    // Store credentials
    fs.writeFileSync(this.CREDENTIALS_FILE, JSON.stringify(this.pushCredentials));

    // We have to wait shortly to give google some time to process the registration
    await sleep(5 * 1000);
  }

  async startPushClient() {
    if (this.pushCredentials === null) {
      throw new Error('Retrieve credentials first!')
    }

    const pushClient = await PushClient.init({
      androidId: this.pushCredentials.checkinResponse.androidId,
      securityToken: this.pushCredentials.checkinResponse.securityToken,
    });
    pushClient.connect(async (msg) => {
      try {
        await DB.storePush(msg)
      } catch (e) {
        winston.warn(`Could not store push message`, { exception: e })
      }

      winston.debug(`Received push message`, { pushMessage: msg });
      await this.mqttClient.processPushNotification(msg)
    });
  }

  getFcmToken() {
    return this.pushCredentials.gcmResponse.token;
  }
}

module.exports = EufyPush
