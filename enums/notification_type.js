const notificationType = {
  // Based on notification event_type
  EVENT_MOTION_DETECTED: 3101,
  EVENT_PERSON_DETECTED: 3102,
  EVENT_DOORBELL_PRESSED: 3103,
  EVENT_CRYING_DETECTED: 3104,
  EVENT_SOUND_DETECTED: 3105,
  EVENT_PET_DETECTED: 3106,

  // Custom notifications
  DOOR_SENSOR_CHANGED: 100001,
  THUMBNAIL: 100002,
}

const notificationTypeByString = {
  'Motion is detected': 3101,
  'Someone has been spotted': 3102,
  'Trigger is open': 100001,
  'Trigger is close': 100001,
}

exports.NotificationType = notificationType
exports.supportedNotificationTypes = Object.values(notificationType)

exports.NotificationTypeByString = notificationTypeByString
exports.supportedNotificationStrings = Object.keys(notificationTypeByString)