const { NotificationType } = require('../enums/notification_type');
const { SensorType } = require('../enums/sensor_type');
const { DeviceCapabilities } = require('../enums/device_type')
const config = require('../config')

class HaDiscovery {

  availabilityTopic = `homeassistant/eufy/available`

  discoveryConfigs (device) {
    let configs = []
    const deviceName = device.name
    const deviceType = device.type
    const deviceSN = device.id || device.station_sn

    if (!DeviceCapabilities.hasOwnProperty(deviceType)) {
      return []
    }

    let capabilities = DeviceCapabilities[deviceType]

    capabilities.forEach(capability => {
      configs.push(this.configurationForCapability(capability, deviceName, deviceSN, deviceType))
    })

    return configs
  }

  baseTopicForCapability (capability, deviceSN) {
    switch (capability) {
      case NotificationType.EVENT_MOTION_DETECTED:
        return `homeassistant/binary_sensor/eufy/${deviceSN}_motion`
      case NotificationType.EVENT_PERSON_DETECTED:
        return `homeassistant/binary_sensor/eufy/${deviceSN}_person`
      case NotificationType.EVENT_DOORBELL_PRESSED:
        return `homeassistant/binary_sensor/eufy/${deviceSN}_doorbell`
      case NotificationType.EVENT_CRYING_DETECTED:
        return `homeassistant/binary_sensor/eufy/${deviceSN}_crying`
      case NotificationType.EVENT_SOUND_DETECTED:
        return `homeassistant/binary_sensor/eufy/${deviceSN}_sound`
      case NotificationType.EVENT_PET_DETECTED:
        return `homeassistant/binary_sensor/eufy/${deviceSN}_pet`
      case NotificationType.DOOR_SENSOR_CHANGED:
        return `homeassistant/binary_sensor/eufy/${deviceSN}_door`
      case NotificationType.THUMBNAIL:
        return `homeassistant/camera/eufy/${deviceSN}_thumbnail`
      case SensorType.BATTERY_PERCENTAGE:
        return `homeassistant/sensor/eufy/${deviceSN}_battery`
    }
  }

  payloadForCapability (capability) {
    switch (capability) {
      case NotificationType.EVENT_CRYING_DETECTED:
        return 'crying'
      case NotificationType.EVENT_SOUND_DETECTED:
        return 'sound'
      default:
        return 'motion'
    }
  }

  configurationForCapability (capability, deviceName, deviceSN, deviceType) {
    let sensorId, sensorName, sensorDeviceClass, sensorPayloadOff
    let sensorBaseTopic = this.baseTopicForCapability(capability, deviceSN)
    let sensorPayloadOn = this.payloadForCapability(capability)

    switch (capability) {
      case NotificationType.EVENT_MOTION_DETECTED:
        sensorId = `${deviceSN}_motion`
        sensorName = `${deviceName} - Motion detected`
        sensorDeviceClass = 'motion'
        break
      case NotificationType.EVENT_PERSON_DETECTED:
        sensorId = `${deviceSN}_person`
        sensorName = `${deviceName} - Person detected`
        sensorDeviceClass = 'motion'
        break
      case NotificationType.EVENT_DOORBELL_PRESSED:
        sensorId = `${deviceSN}_doorbell`
        sensorName = `${deviceName} - Doorbell pressed`
        sensorDeviceClass = 'motion'
        break
      case NotificationType.EVENT_CRYING_DETECTED:
        sensorId = `${deviceSN}_crying`
        sensorName = `${deviceName} - Crying detected`
        sensorDeviceClass = 'sound'
        break
      case NotificationType.EVENT_SOUND_DETECTED:
        sensorId = `${deviceSN}_sound`
        sensorName = `${deviceName} - Sound detected`
        sensorDeviceClass = 'sound'
        break
      case NotificationType.EVENT_PET_DETECTED:
        sensorId = `${deviceSN}_pet`
        sensorName = `${deviceName} - Pet detected`
        sensorDeviceClass = 'motion'
        break
      case NotificationType.DOOR_SENSOR_CHANGED:
        sensorId = `${deviceSN}_door`
        sensorName = `${deviceName}`
        sensorDeviceClass = 'door'
        sensorPayloadOn = 'open'
        sensorPayloadOff = 'closed'
        break
      case NotificationType.THUMBNAIL:
        sensorId = `${deviceSN}_thumbnail`
        sensorName = `${deviceName} - Last event`
        break
      case SensorType.BATTERY_PERCENTAGE:
        sensorId = `${deviceSN}_battery`
        sensorName = `${deviceName} - Battery percentage`
        sensorDeviceClass = 'battery'
    }

    if (capability === NotificationType.DOOR_SENSOR_CHANGED) {
      return {
        topic: `${sensorBaseTopic}/config`,
        message: JSON.stringify({
          name: sensorName,
          device_class: sensorDeviceClass,
          availability_topic: this.availabilityTopic,
          state_topic: `${sensorBaseTopic}/state`,
          json_attributes_topic: `${sensorBaseTopic}/attributes`,
          payload_on: sensorPayloadOn,
          payload_off: sensorPayloadOff,
          unique_id: sensorId,
          device: {
            identifiers: deviceSN,
            name: deviceName,
            manufacturer: 'Eufy',
            model: deviceType,
          }
        })
      }
    } else if (capability === NotificationType.THUMBNAIL) {
      return {
        topic: `${sensorBaseTopic}/config`,
        message: JSON.stringify({
          name: sensorName,
          availability_topic: this.availabilityTopic,
          topic: `${sensorBaseTopic}`,
          unique_id: sensorId,
          device: {
            identifiers: deviceSN,
            name: deviceName,
            manufacturer: 'Eufy',
            model: deviceType,
          }
        })
      }
    } else if (capability === SensorType.BATTERY_PERCENTAGE) {
      return {
        topic: `${sensorBaseTopic}/config`,
        message: JSON.stringify({
          name: sensorName,
          device_class: sensorDeviceClass,
          availability_topic: this.availabilityTopic,
          state_topic: `${sensorBaseTopic}/state`,
          unit_of_measurement: '%',
          unique_id: sensorId,
          device: {
            identifiers: deviceSN,
            name: deviceName,
            manufacturer: 'Eufy',
            model: deviceType,
          }
        })
      }
    }

    return {
      topic: `${sensorBaseTopic}/config`,
      message: JSON.stringify({
        name: sensorName,
        device_class: sensorDeviceClass,
        availability_topic: this.availabilityTopic,
        state_topic: `${sensorBaseTopic}/state`,
        json_attributes_topic: `${sensorBaseTopic}/attributes`,
        payload_on: sensorPayloadOn,
        off_delay: config.haOffDelay,
        unique_id: sensorId,
        device: {
          identifiers: deviceSN,
          name: deviceName,
          manufacturer: 'Eufy',
          model: deviceType,
        }
      })
    }
  }
}

module.exports = new HaDiscovery()
