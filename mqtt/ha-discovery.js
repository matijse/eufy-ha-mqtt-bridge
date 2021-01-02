const { DeviceType } = require('../enums/device_type')

class HaDiscovery {

  discoveryConfigs (device) {
    let configs = []
    const deviceType = device.type
    const deviceSN = device.id || device.station_sn

    if ([DeviceType.EUFYCAM_2_PRO, DeviceType.VIDEO_DOORBELL_2K_BATTERY, DeviceType.FLOODLIGHT_CAMERA].includes(deviceType)) {
      // Motion detected
      configs.push({
        topic: `homeassistant/binary_sensor/eufy/${deviceSN}_motion/config`,
        message: JSON.stringify({
          name: `${device.name} - Motion detected`,
          device_class: 'motion',
          state_topic: `${this.motionDetectedBaseTopic(deviceSN)}/state`,
          json_attributes_topic: `${this.motionDetectedBaseTopic(deviceSN)}/attributes`,
          payload_on: 'motion',
          payload_off: 'clear',
          off_delay: 5,
          unique_id: `${deviceSN}_motion`
        })
      })

      // Thumbnail
      configs.push({
        topic: `homeassistant/camera/eufy/${deviceSN}_thumbnail/config`,
        message: JSON.stringify({
          name: `${device.name} - Last event`,
          topic: `${this.thumbnailTopic(deviceSN)}`,
          unique_id: `${deviceSN}_thumbnail`
        })
      })
    }

    if ([DeviceType.VIDEO_DOORBELL_2K_BATTERY].includes(deviceType)) {
      // Doorbell pressed
      configs.push({
        topic: `homeassistant/binary_sensor/eufy/${deviceSN}_doorbell/config`,
        message: JSON.stringify({
          name: `${device.name} - Doorbell pressed`,
          device_class: 'motion',
          state_topic: `${this.doorbellPressedBaseTopic(deviceSN)}/state`,
          json_attributes_topic: `${this.doorbellPressedBaseTopic(deviceSN)}/attributes`,
          payload_on: 'motion',
          payload_off: 'clear',
          off_delay: 5,
          unique_id: `${deviceSN}_doorbell`
        })
      })
    }

    return configs
  }

  motionDetectedBaseTopic (device_sn) {
    return `homeassistant/binary_sensor/eufy/${device_sn}_motion`
  }

  doorbellPressedBaseTopic (device_sn) {
    return `homeassistant/binary_sensor/eufy/${device_sn}_doorbell`
  }

  thumbnailTopic (device_sn) {
    return `homeassistant/camera/eufy/${device_sn}_thumbnail`
  }
}

module.exports = new HaDiscovery()
