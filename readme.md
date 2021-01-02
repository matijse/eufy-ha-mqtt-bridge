# Eufy Home Assistant MQTT Bridge

(Early version) 

This script subscribes to push notifications of the Eufy Security app and publishes Motion and Doorbell pressed events
via MQTT to Home Assistant. When using auto discovery, it automatically creates binary sensors for Motion and
Doorbell pressed events. 

Uses the [eufy-node-client](https://github.com/JanLoebel/eufy-node-client) by JanLoebel and is heavily inspired on 
its examples.

## Supported devices

For now very limited, and only tested with

* Eufy Cam 2 (T8114)
* Eufy Cam 2 C (T8113)
* Eufy Cam 2 Pro (T8140)
* Eufy video doorbell 2K (powered) (T8200)
* Eufy video doorbell 2K (battery) (T8210)
* Floodlight Camera (T8420)
* Indoor Cam (T8400)
* Motion Sensor (T8910)

All push messages from all devices are logged, so it would be relatively easy to add support for new devices

## Features

The following sensors are automatically added to Home Assistant via MQTT discovery:

* Motion detected (binary sensor)
    * Eufy Cam 2 (T8114)
    * Eufy Cam 2 C (T8113)
    * Eufy Cam 2 Pro (T8140)
    * Eufy video doorbell 2K (powered) (T8200)
    * Eufy video doorbell 2K (battery) (T8210)
    * Floodlight Camera (T8420)
    * Indoor Cam (T8400)
    * Motion Sensor (T8910)
* Crying detected (binary sensor)
    * Indoor Cam (T8400)
* Doorbell button pressed (binary sensor)
    * Eufy video doorbell 2K (powered) (T8200)
    * Eufy video doorbell 2K (battery) (T8210)
* Thumbnail of Last event (camera sensor)
    * Eufy Cam 2 (T8114)
    * Eufy Cam 2 C (T8113)
    * Eufy Cam 2 Pro (T8140)
    * Eufy video doorbell 2K (powered) (T8200)
    * Eufy video doorbell 2K (battery) (T8210)
    * Floodlight Camera (T8420)
    * Indoor Cam (T8400)
    
These can be used to trigger automations based on motion / button pressed.

## Setup 

### Docker configuration

The data folder contains the config, logs and a record of all push notifications (so new types of notifications can
be discovered). Mount this directory to a local folder. Replace `/path/to/local/data/folder`
below with the location where you want to store this data.

If you run your MQTT broker on the same host as this Docker image, it cannot simply connect to `localhost` from inside
this Docker image. In that case, add a line to add the correct IP for the Docker network inside the image as 
`dockerhost`. You can then use `mqtt://dockerhost:1883` as the MQTT url. Otherwise, you can remove that line from the
example below.

In the data directory, you will need to create a `config.yml` file with your credentials. It should contain the 
following contents:

```yaml
eufy:
  username: "your@email"
  password: "password"
mqtt:
  url: "mqtt://dockerhost:1883"
  username: "user"
  password: "password"
```

At the moment it is not possible to use an account with 2FA enabled. If you use the same credentials on the app, you 
might be logged out here when you login in the app, so I recommend creating a second account (with a strong random 
generated password and no 2FA) and invite it to your Eufy account.

### Run via Docker

Run the container, with a volume mapping to the local data directory, for example:

```shell
docker run \
   -d \
   --name eufy-bridge \
   --restart unless-stopped \
   -v /path/to/local/data/folder:/app/data \
   --add-host=dockerhost:`docker network inspect --format='{{range .IPAM.Config}}{{.Gateway}}{{end}}' bridge` \
   matijse/eufy-ha-mqtt-bridge
```

Or add it to a Docker Compose file:

```yaml
services:
  eufy-bridge:
    container_name: eufy-bridge
    image: matijse/eufy-ha-mqtt-bridge
    restart: unless-stopped
    volumes:
      - /path/to/local/data/folder:/app/data
```

### Run via npm

To run directly via npm:

1. Clone this repository
1. Create a `config.yml` file in the `data` folder, for contents see above.
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
    json_attributes_topic: homeassistant/binary_sensor/eufy/{device_sn}_motion/attributes
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
    json_attributes_topic: homeassistant/binary_sensor/eufy/{device_sn}_doorbell/attributes
    payload_on: motion
    payload_off: clear
    off_delay: 5
```

Thumbnail of last event:

```yaml
camera:
  - platform: mqtt
    name: Camera - Last event
    topic: homeassistant/camera/eufy/{device_sn}_thumbnail
```
