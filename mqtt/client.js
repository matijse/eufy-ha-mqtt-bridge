const MQTT = require('async-mqtt')
const get = require('get-value')
const fetch = require('node-fetch')
const winston = require('winston')
const DB = require('../db')
const config = require('../config')
const { NotificationType, NotificationTypeByString, supportedNotificationTypes, supportedNotificationStrings } = require('../enums/notification_type')
const HaDiscovery = require('./ha-discovery')

class MqttClient {

  async connect() {
    this.client = await MQTT.connectAsync(config.mqttUrl, {
      username: config.mqttUsername,
      password: config.mqttPassword,
      keepalive: 60,
      reconnectPeriod: 1000
    })

    this.client.on('error', error => {
      winston.error(`MQTT error`, { error })
    })

    this.client.on('reconnect', () => {
      winston.info(`MQTT reconnect`)
    })

    this.client.on('close', () => {
      winston.info('MQTT connection closed')
    })

    this.client.on('message', async (topic, message) => {
      winston.debug(`MQTT message: [${topic}]: ${message.toString()}`)
      if (topic === 'homeassistant/status') {
        if (message.toString() === 'online') {
          await this.setupAutoDiscovery()
        }
      }
    })

    try {
      await this.client.subscribe('homeassistant/status')
      winston.debug(`Subscribed to homeassistant/status`)
    } catch (e) {
      winston.error(`Error subscribing to homeassistant/status`, { exception: e })
    }
  }

  async setupAutoDiscovery () {
    const devices = await DB.getDevices()
    for (let device of devices) {
      const configs = HaDiscovery.discoveryConfigs(device)
      for (let config of configs) {
        await this.client.publish(config.topic, config.message)
      }
    }
  }

  async processPushNotification (notification) {
    // Special case for Doorbell (T8200), payload is a string; Parse to JSON and save in notification for later use.
    let doorbellPayload = get(notification, 'payload.doorbell', { default: false })
    if (doorbellPayload) {
      try {
        notification.payload.doorbell = JSON.parse(doorbellPayload)
        notification.payload.payload = notification.payload.doorbell
      } catch (e) {
        winston.debug(`Error parsing doorbell payload`, e)
      }
    }

    let notificationType = this.getNotificationType(notification)
    if (notificationType === 'unknown') {
      return
    }

    let deviceSN = this.getDeviceSNFromNotification(notification)
    if (!deviceSN) {
      winston.warn(`Got notification with unknown device_sn`, { notification })
      return
    }

    const attributes = this.getAttributesFromNotification(notification)

    winston.debug(`Got notification - Device: ${deviceSN}, Type: ${notificationType}`)

    if (notificationType === NotificationType.DOOR_SENSOR_CHANGED) {
      await this.doorSensorChanged(notification, deviceSN, attributes)
    } else {
      await this.sendNotification(notificationType, deviceSN, attributes)
    }

    if (attributes.hasOwnProperty('thumbnail') && attributes.thumbnail.length > 0) {
      await this.uploadThumbnail(deviceSN, attributes.thumbnail)
    }
  }

  async sendNotification (notificationType, deviceSN, attributes) {
    const baseTopic = HaDiscovery.baseTopicForCapability(notificationType, deviceSN)
    await this.client.publish(`${baseTopic}/state`, HaDiscovery.payloadForCapability(notificationType))
    await this.client.publish(`${baseTopic}/attributes`, JSON.stringify(attributes))
  }

  async uploadThumbnail(deviceSN, thumbnailUrl) {
    winston.debug(`Uploading new thumbnail for ${deviceSN} from ${thumbnailUrl}`)
    const response = await fetch(thumbnailUrl)
    const image = await response.buffer()

    const topic = HaDiscovery.baseTopicForCapability(NotificationType.THUMBNAIL, deviceSN)

    await this.client.publish(topic, image)
  }

  async doorSensorChanged(notification, deviceSN, attributes) {
    let doorState = get(notification, 'payload.payload.e', { default: false })
    if (doorState === false) {
      winston.warn(`Got doorSensorChanged with unknown doorState`, { notification })
      return
    }
    attributes.door = parseInt(doorState) === 1 ? 'open' : 'closed'

    let baseTopic = HaDiscovery.baseTopicForCapability(NotificationType.DOOR_SENSOR_CHANGED, deviceSN)

    try {
      await this.client.publish(`${baseTopic}/state`, attributes.door)
      await this.client.publish(`${baseTopic}/attributes`, JSON.stringify(attributes))
    } catch (e) {
      winston.error(`Failure in doorSensorChanged`, { exception: e })
    }
  }

  getNotificationType (notification) {
    // Notification based on event_type (3101, 3102, etc)
    let type = parseInt(get(notification, 'payload.payload.event_type', { default: 0 }))
    if (supportedNotificationTypes.includes(type)) {
      return type
    }

    // Notification based on content title
    let content = get(notification, 'payload.content', { default: '' })

    for (let str of supportedNotificationStrings) {
      if (content.includes(str)) {
        return NotificationTypeByString[str]
      }
    }

    winston.debug('Notification with unknown type', notification)
    return 'unknown'
  }

  getDeviceSNFromNotification (notification) {
    let device_sn = get(notification, 'payload.device_sn')
    if (!device_sn) {
      device_sn = get(notification, 'payload.payload.device_sn')
      if (!device_sn) {
        device_sn = get(notification, 'payload.doorbell.device_sn')
        if (!device_sn) {
          device_sn = get(notification, 'payload.station_sn')
        }
      }
    }

    return device_sn
  }

  getAttributesFromNotification (notification) {
    const attributes = {
      event_time: get(notification, 'payload.event_time'),
      thumbnail: get(notification, 'payload.payload.pic_url')
    }

    if (!attributes.event_time) {
      attributes.event_time = get(notification, 'payload.doorbell.event_time')
    }
    if (!attributes.thumbnail) {
      attributes.thumbnail = get(notification, 'payload.doorbell.pic_url')
    }

    return attributes
  }
}

module.exports = MqttClient
