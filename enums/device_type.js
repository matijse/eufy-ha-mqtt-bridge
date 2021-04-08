const { NotificationType } = require('./notification_type')
const { SensorType } = require('./sensor_type')

const deviceType = {
  DOOR_SENSOR: 'T8900',
  EUFYCAM_1: 'T8111',
  EUFYCAM_2: 'T8114',
  EUFYCAM_2C: 'T8113',
  EUFYCAM_2C_Z: 'T8113-Z',
  EUFYCAM_2C_PRO: 'T8142',
  EUFYCAM_2C_PRO_Z: 'T8142-Z',
  EUFYCAM_2_PRO: 'T8140',
  EUFYCAM_2_PRO_Z: 'T8140-Z',
  EUFYCAM_E: 'T8112',
  FLOODLIGHT_CAMERA: 'T8420',
  INDOOR_CAM: 'T8400',
  INDOOR_CAM_PAN_TILT: 'T8410',
  MOTION_SENSOR: 'T8910',
  VIDEO_DOORBELL_1080P_BATTERY: 'T8220',
  VIDEO_DOORBELL_1080P_BATTERY2: 'T8222',
  VIDEO_DOORBELL_1080P_POWERED: 'T8221',
  VIDEO_DOORBELL_2K_BATTERY: 'T8210',
  VIDEO_DOORBELL_2K_POWERED: 'T8200',
  VIDEO_DOORBELL_2K_POWERED2: 'T8202',
}

const capabilities = {
  [deviceType.DOOR_SENSOR]: [
    NotificationType.DOOR_SENSOR_CHANGED,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.EUFYCAM_1]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.EUFYCAM_2]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.EUFYCAM_2C]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.EUFYCAM_2C_Z]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.EUFYCAM_2C_PRO]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.EUFYCAM_2C_PRO_Z]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.EUFYCAM_2_PRO]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.EUFYCAM_2_PRO_Z]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.EUFYCAM_E]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.FLOODLIGHT_CAMERA]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.THUMBNAIL,
  ],
  [deviceType.INDOOR_CAM]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.EVENT_CRYING_DETECTED,
    NotificationType.EVENT_SOUND_DETECTED,
    NotificationType.EVENT_PET_DETECTED,
    NotificationType.THUMBNAIL,
  ],
  [deviceType.INDOOR_CAM_PAN_TILT]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.EVENT_CRYING_DETECTED,
    NotificationType.EVENT_SOUND_DETECTED,
    NotificationType.EVENT_PET_DETECTED,
    NotificationType.THUMBNAIL,
  ],
  [deviceType.MOTION_SENSOR]: [
    NotificationType.EVENT_MOTION_DETECTED,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.VIDEO_DOORBELL_1080P_BATTERY]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.EVENT_DOORBELL_PRESSED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.VIDEO_DOORBELL_1080P_BATTERY2]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.EVENT_DOORBELL_PRESSED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.VIDEO_DOORBELL_1080P_POWERED]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.EVENT_DOORBELL_PRESSED,
    NotificationType.THUMBNAIL,
  ],
  [deviceType.VIDEO_DOORBELL_2K_BATTERY]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.EVENT_DOORBELL_PRESSED,
    NotificationType.THUMBNAIL,
    SensorType.BATTERY_PERCENTAGE,
  ],
  [deviceType.VIDEO_DOORBELL_2K_POWERED]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.EVENT_DOORBELL_PRESSED,
    NotificationType.THUMBNAIL,
  ],
  [deviceType.VIDEO_DOORBELL_2K_POWERED2]: [
    NotificationType.EVENT_MOTION_DETECTED,
    NotificationType.EVENT_PERSON_DETECTED,
    NotificationType.EVENT_DOORBELL_PRESSED,
    NotificationType.THUMBNAIL,
  ],
}

exports.DeviceType = deviceType
exports.DeviceCapabilities = capabilities
exports.supportedDevices = Object.values(deviceType)
