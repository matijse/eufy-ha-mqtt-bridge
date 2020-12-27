# Eufy Home Assistant MQTT Bridge

(Early version) 

This script subscribes to push notifications of the Eufy Security app and publishes Motion and Doorbell pressed events
via MQTT to Home Assistant. When using auto discovery, it automatically creates binary sensors for Motion and
Doorbell pressed events. 

Uses the [eufy-node-client](https://github.com/JanLoebel/eufy-node-client) by JanLoebel and is heavily inspired on 
its examples.

## Supported devices

For now very limited, and only tested with

* Eufy Cam 2 Pro (T8140)
* Eufy video doorbell 2K (T8210)

All push messages from all devices are logged, so it would be relatively easy to add support for new devices

## Features

The following sensors are automatically added to Home Assistant via MQTT discovery:

* Motion detected (binary sensor)
    * Eufy Cam 2 Pro
    * Eufy video doorbell 2K
* Doorbell button pressed (binary sensor)
    * Eufy video doorbell 2K
    
These can be used to trigger automations based on motion / button pressed.

## Setup

### Run via Docker

The data folder contains the settings, logs and a record of all push notifications (so new types of notifications can
be discovered). Mount this directory to a local folder to be able to view them. Note that the passwords are stored
plaintext in the SQLite database. Replace `/path/to/local/data/folder` below with the location where you want to 
store this data.

```shell
docker run \
   -it \
   --restart unless-stoppped \
   -v /path/to/local/data/folder:/app/data \
   matijse/eufy-ha-mqtt-bridge
```

If you run your MQTT broker on the same host as this Docker image, it cannot simply connect to `localhost` from inside
this Docker image. In that case, add a line to add the correct IP for the Docker network inside the image as 
`dockerhost`. You can then use `mqtt://dockerhost:1883` as the MQTT url.

```shell
docker run \
   -it \
   --restart unless-stoppped \
   -v /path/to/local/data/folder:/app/data \
   --add-host=dockerhost:`docker network inspect --format='{{range .IPAM.Config}}{{.Gateway}}{{end}}' bridge` \
   matijse/eufy-ha-mqtt-bridge
```

After running the image for the first time, you are asked for your Eufy credentials and MQTT information. At the 
moment it is not possible to use an account with 2FA enabled, so I recommend inviting a user to your Eufy account
with a strong random generated password. 

For the MQTT connection, it asks for your MQTT Url. Use the form `mqtt://{ip}:{port}` or `mqtt://{host}:{port}`.

### Run via npm

To run directly via npm:

1. Clone this repository
1. Run `npm install`
1. Run `npm run start`

## Manually adding sensors

When you have automatic discovery via MQTT disabled, you can add the binary sensors manually via YAML configuration:

Replace `{device_sn}` by the serial number of the device, for example `T8140P0123456789`

Motion detected:

```yaml
binary_sensor:
  - platform: mqtt
    name: Camera motion detected
    device_class: motion
    state_topic: homeassistant/binary_sensor/eufy/{device_sn}_motion/state
    json_attribute_topic: homeassistant/binary_sensor/eufy/{device_sn}_motion/attributes
    payload_on: motion
    payload_off: clear
    off_delay: 5
```

Doorbell button pressed:

```yaml
binary_sensor:
  - platform: mqtt
    name: Doorbell button pressed
    device_class: motion
    state_topic: homeassistant/binary_sensor/eufy/{device_sn}_doorbell/state
    json_attribute_topic: homeassistant/binary_sensor/eufy/{device_sn}_doorbell/attributes
    payload_on: motion
    payload_off: clear
    off_delay: 5
```