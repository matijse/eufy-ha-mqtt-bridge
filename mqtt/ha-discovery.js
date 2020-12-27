const DeviceType = require('../enums/device_type')

class HaDiscovery {

  discoveryConfigs (device) {
    let configs = []
    const deviceType = device.type

    if ([DeviceType.EUFYCAM_2_PRO, DeviceType.VIDEO_DOORBELL_2K_BATTERY].includes(deviceType)) {
      // Motion detected
      configs.push({
        topic: `homeassistant/binary_sensor/eufy/${device.id}_motion/config`,
        message: JSON.stringify({
          name: `${device.name} - Motion detected`,
          device_class: 'motion',
          state_topic: `${this.motionDetectedBaseTopic(device.id)}/state`,
          json_attributes_topic: `${this.motionDetectedBaseTopic(device.id)}/attributes`,
          payload_on: 'motion',
          payload_off: 'clear',
          off_delay: 5,
          unique_id: `${device.id}_motion`
        })
      })
    }

    if ([DeviceType.VIDEO_DOORBELL_2K_BATTERY].includes(deviceType)) {
      // Doorbell pressed
      configs.push({
        topic: `homeassistant/binary_sensor/eufy/${device.id}_doorbell/config`,
        message: JSON.stringify({
          name: `${device.name} - Doorbell pressed`,
          device_class: 'motion',
          state_topic: `${this.doorbellPressedBaseTopic(device.id)}/state`,
          json_attributes_topic: `${this.doorbellPressedBaseTopic(device.id)}/attributes`,
          payload_on: 'motion',
          payload_off: 'clear',
          off_delay: 5,
          unique_id: `${device.id}_doorbell`
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
}

module.exports = new HaDiscovery()
