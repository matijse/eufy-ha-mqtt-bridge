const fs = require('fs')
const winston = require('winston')
const { PushNotificationService } = require("eufy-security-client")

class EufyPush {
  CREDENTIALS_FILE = './data/credentials.json'
  pushCredentials = null
  logger
  pushService = null

  constructor (mqttClient) {
    this.mqttClient = mqttClient
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({ filename: './data/push.log' }),
      ]
    })
  }

  async startPushClient() {
    const pushService = new PushNotificationService(this.logger);

    if (fs.existsSync(this.CREDENTIALS_FILE)) {
      winston.info('Credentials found -> reusing them...');
      pushService.credentials = JSON.parse(fs.readFileSync(this.CREDENTIALS_FILE).toString());
    }

    pushService.on('credential', creds => {
        fs.writeFileSync(this.CREDENTIALS_FILE, JSON.stringify(creds))
    })

    pushService.on('raw message', async (msg) => {
       this.logger.info('Received push message', { pushMessage: msg })
       winston.debug(`Received push message`, { pushMessage: msg });
       await this.mqttClient.processPushNotification(msg)
    })

    this.pushService = pushService;
    this.pushCredentials = await pushService.open()
  }

  getFcmToken() {
    return this.pushCredentials.gcmResponse.token;
  }
}
module.exports = EufyPush
