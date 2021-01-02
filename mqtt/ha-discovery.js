const { DeviceType } = require('../enums/device_type')

class HaDiscovery {

  discoveryConfigs (device) {
    let configs = []
    const deviceType = device.type
    const deviceSN = device.id || device.station_sn

    // Motion detected
    if ([
      DeviceType.EUFYCAM_2_PRO,
      DeviceType.EUFYCAM_2C,
      DeviceType.INDOOR_CAM,
      DeviceType.VIDEO_DOORBELL_2K_BATTERY,
      DeviceType.VIDEO_DOORBELL_2K_POWERED,
      DeviceType.FLOODLIGHT_CAMERA,
      DeviceType.MOTION_SENSOR
    ].includes(deviceType)) {
      configs.push(this.motionDetectedConfiguration(device.name, deviceSN))
    }

    // Doorbell pressed
    if ([
      DeviceType.VIDEO_DOORBELL_2K_BATTERY,
      DeviceType.VIDEO_DOORBELL_2K_POWERED
    ].includes(deviceType)) {
      configs.push(this.doorbellPressedConfiguration(device.name, deviceSN))
    }

    // Thumbnail
    if ([
      DeviceType.EUFYCAM_2_PRO,
      DeviceType.EUFYCAM_2C,
      DeviceType.INDOOR_CAM,
      DeviceType.VIDEO_DOORBELL_2K_BATTERY,
      DeviceType.VIDEO_DOORBELL_2K_POWERED,
      DeviceType.FLOODLIGHT_CAMERA
    ].includes(deviceType)) {
      configs.push(this.thumbnailConfiguration(device.name, deviceSN))
    }

    // Crying detected
    if ([
      DeviceType.INDOOR_CAM,
    ].includes(deviceType)) {
      configs.push(this.cryingDetectedConfiguration(device.name, deviceSN))
    }

    return configs
  }

  motionDetectedConfiguration (deviceName, deviceSN) {
    return {
      topic: `homeassistant/binary_sensor/eufy/${deviceSN}_motion/config`,
      message: JSON.stringify({
        name: `${deviceName} - Motion detected`,
        device_class: 'motion',
        state_topic: `${this.motionDetectedBaseTopic(deviceSN)}/state`,
        json_attributes_topic: `${this.motionDetectedBaseTopic(deviceSN)}/attributes`,
        payload_on: 'motion',
        payload_off: 'clear',
        off_delay: 5,
        unique_id: `${deviceSN}_motion`
      })
    }
  }

  doorbellPressedConfiguration (deviceName, deviceSN) {
    return {
      topic: `homeassistant/binary_sensor/eufy/${deviceSN}_doorbell/config`,
      message: JSON.stringify({
        name: `${deviceName} - Doorbell pressed`,
        device_class: 'motion',
        state_topic: `${this.doorbellPressedBaseTopic(deviceSN)}/state`,
        json_attributes_topic: `${this.doorbellPressedBaseTopic(deviceSN)}/attributes`,
        payload_on: 'motion',
        payload_off: 'clear',
        off_delay: 5,
        unique_id: `${deviceSN}_doorbell`
      })
    }
  }

  cryingDetectedConfiguration (deviceName, deviceSN) {
    return {
      topic: `homeassistant/binary_sensor/eufy/${deviceSN}_crying/config`,
      message: JSON.stringify({
        name: `${deviceName} - Crying detected`,
        device_class: 'sound',
        state_topic: `${this.cryingDetectedBaseTopic(deviceSN)}/state`,
        json_attributes_topic: `${this.cryingDetectedBaseTopic(deviceSN)}/attributes`,
        payload_on: 'crying',
        payload_off: 'clear',
        off_delay: 5,
        unique_id: `${deviceSN}_crying`
      })
    }
  }

  thumbnailConfiguration (deviceName, deviceSN) {
    return {
      topic: `homeassistant/camera/eufy/${deviceSN}_thumbnail/config`,
      message: JSON.stringify({
        name: `${deviceName} - Last event`,
        topic: `${this.thumbnailTopic(deviceSN)}`,
        unique_id: `${deviceSN}_thumbnail`
      })
    }
  }

  motionDetectedBaseTopic (device_sn) {
    return `homeassistant/binary_sensor/eufy/${device_sn}_motion`
  }

  doorbellPressedBaseTopic (device_sn) {
    return `homeassistant/binary_sensor/eufy/${device_sn}_doorbell`
  }

  cryingDetectedBaseTopic (device_sn) {
    return `homeassistant/binary_sensor/eufy/${device_sn}_crying`
  }

  thumbnailTopic (device_sn) {
    return `homeassistant/camera/eufy/${device_sn}_thumbnail`
  }
}

module.exports = new HaDiscovery()
