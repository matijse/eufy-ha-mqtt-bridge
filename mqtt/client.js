const MQTT = require('async-mqtt')
const get = require('get-value')
const fetch = require('node-fetch')
const winston = require('winston')
const DB = require('../db')
const config = require('../config')
const NotificationType = require('../enums/notification_type')
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

  async sendMotionDetectedEvent (device_sn, attributes) {
    await this.client.publish(`${HaDiscovery.motionDetectedBaseTopic(device_sn)}/state`, 'motion')
    await this.client.publish(`${HaDiscovery.motionDetectedBaseTopic(device_sn)}/attributes`, JSON.stringify(attributes))
  }

  async sendDoorbellPressedEvent (device_sn, attributes) {
    await this.client.publish(`${HaDiscovery.doorbellPressedBaseTopic(device_sn)}/state`, 'motion')
    await this.client.publish(`${HaDiscovery.doorbellPressedBaseTopic(device_sn)}/attributes`, JSON.stringify(attributes))
  }

  async processPushNotification (notification) {
    let type = parseInt(get(notification, 'payload.payload.event_type', { default: 0 }))
    if (type === 0) {
      type = parseInt(get(notification, 'payload.doorbell.event_type', { default: 0 }))
    }
    if (type === 0) {
      type = parseInt(get(notification, 'payload.type', { default: 0 }))
    }

    winston.debug(`Got Push Notification of type ${type}`)

    switch (type) {
      case NotificationType.DOORBELL_PRESSED:
        await this.doorbellEvent(notification)
        break
      case NotificationType.DOORBELL_SOMEONE_SPOTTED:
      case NotificationType.CAM_SOMEONE_SPOTTED:
      case NotificationType.FLOODLIGHT_MOTION_DETECTED:
        await this.motionDetectedEvent(notification)
        break
    }
  }

  async doorbellEvent (event) {
    let device_sn = get(event, 'payload.device_sn')
    if (!device_sn) {
      device_sn = get(event, 'payload.payload.device_sn')
      if (!device_sn) {
        device_sn = get(event, 'payload.doorbell.device_sn')
        if (!device_sn) {
          device_sn = get(event, 'payload.station_sn')
          if (!device_sn) {
            winston.warn(`Got doorbellEvent with unknown device_sn`, {event})
            return
          }
        }
      }
    }

    const attributes = {
      event_time: get(event, 'payload.event_time'),
      thumbnail: get(event, 'payload.payload.pic_url')
    }

    if (!attributes.event_time) {
      attributes.event_time = get(event, 'payload.doorbell.event_time')
    }
    if (!attributes.thumbnail) {
      attributes.thumbnail = get(event, 'payload.doorbell.pic_url')
    }

    try {
      await this.sendDoorbellPressedEvent(device_sn, attributes)
    } catch (e) {
      winston.error(`Failure in doorbellEvent`, { exception: e })
    }

    if (attributes.thumbnail) {
      await this.uploadThumbnail(device_sn, attributes.thumbnail)
    }
  }

  async motionDetectedEvent (event) {
    let device_sn = get(event, 'payload.device_sn')
    if (!device_sn) {
      device_sn = get(event, 'payload.payload.device_sn')
      if (!device_sn) {
        device_sn = get(event, 'payload.doorbell.device_sn')
        if (!device_sn) {
          device_sn = get(event, 'payload.station_sn')
          if (!device_sn) {
            winston.warn(`Got motionDetectedEvent with unknown device_sn`, { event })
            return
          }
        }
      }
    }

    const attributes = {
      event_time: get(event, 'payload.event_time'),
      thumbnail: get(event, 'payload.payload.pic_url')
    }

    if (!attributes.event_time) {
      attributes.event_time = get(event, 'payload.doorbell.event_time')
    }
    if (!attributes.thumbnail) {
      attributes.thumbnail = get(event, 'payload.doorbell.pic_url')
    }

    try {
      await this.sendMotionDetectedEvent(device_sn, attributes)
    } catch (e) {
      winston.error(`Failure in doorbellEvent`, { exception: e })
    }

    if (attributes.thumbnail) {
      await this.uploadThumbnail(device_sn, attributes.thumbnail)
    }
  }

  async uploadThumbnail(device_sn, thumbnail_url) {
    winston.debug(`Uploading new thumbnail for ${device_sn} from ${thumbnail_url}`)
    const response = await fetch(thumbnail_url)
    const image = await response.buffer()

    const topic = HaDiscovery.thumbnailTopic(device_sn)

    await this.client.publish(topic, image)
  }

}

module.exports = MqttClient
