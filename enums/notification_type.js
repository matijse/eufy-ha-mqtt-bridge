module.exports = {
  EVENT_MOTION_DETECTED: 3101,      // payload.payload.event_type
  EVENT_SOMEONE_SPOTTED: 3102,      // payload.payload.event_type OR payload.doorbell.event_type
  EVENT_DOORBELL_PRESSED: 3103,     // payload.payload.event_type OR payload.doorbell.event_type
  EVENT_CRYING_DETECTED: 3104,      // payload.payload.event_type OR payload.doorbell.event_type
  EVENT_SOUND_DETECTED: 3105,       // payload.payload.event_type
  EVENT_PET_DETECTED: 3106,         // payload.payload.event_type
  CAM_SOMEONE_SPOTTED: 14,          // payload.type
  FLOODLIGHT_MOTION_DETECTED: 3,    // payload.type
  MOTION_SENSOR_TRIGGERED: 10,      // payload.type
  CAM_2C_SOMEONE_SPOTTED: 8,        // payload.type
  CAM_2_SOMEONE_SPOTTED: 9,         // payload.type
  CAM_2C_PRO_MOTION_DETECTED: 15,   // payload.type
  DOOR_SENSOR_CHANGED: 2,           // payload.type
}
