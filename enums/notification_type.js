module.exports = {
  DOORBELL_SOMEONE_SPOTTED: 3102,   // payload.payload.event_type OR payload.doorbell.event_type
  DOORBELL_PRESSED: 3103,           // payload.payload.event_type OR payload.doorbell.event_type
  CRYING_DETECTED: 3104,            // payload.payload.event_type OR payload.doorbell.event_type
  CAM_SOMEONE_SPOTTED: 14,          // payload.type
  FLOODLIGHT_MOTION_DETECTED: 3,    // payload.type
  MOTION_SENSOR_TRIGGERED: 10,      // payload.type
  CAM_2C_SOMEONE_SPOTTED: 8,        // payload.type
  CAM_2_SOMEONE_SPOTTED: 9,         // payload.type
  INDOOR_SOMEONE_SPOTTED = 3102 //payload.payload.event_type
  INDOOR_SOUND_DETECTED = 3105 //payload.payload.event_type
  INDOOR_MOTION_DETECTED = 3101 //payload.payload.event_type
}
