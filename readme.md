# Eufy Home Assistant MQTT Bridge

This script subscribes to push notifications of the Eufy Security app and publishes events via MQTT to Home Assistant.
When using auto discovery, it automatically creates a device with sensors within Home Assistant. 

Uses the [eufy-node-client](https://github.com/JanLoebel/eufy-node-client) by JanLoebel and is heavily inspired on 
its examples.

## Create a second Eufy account!

At the moment it is not possible to use an account with 2FA enabled. You should not use the same account here and in the
app, because when you log in at one app, sometimes you get logged out on other locations. I recommend creating a second 
account (with a strong random generated password and no 2FA) and invite it to your Eufy account. 

When you receive "Failed to request" errors when starting this script, you have logged in too many times and are 
temporarily blocked. Wait a day and you'll be able to log in again.

## Home Assistant Core vs Home Assistant Add-on

This repo describes running via Docker alongside Home Assistant Core. See [below](#run-as-home-assistant-add-on) 
for an option to run it as an Add-on.

## Supported devices

The following devices and features are supported. When a device of that type is detected, the sensors that are supported
are automatically discovered in Home Assistant.

|   | Motion detected | Person detected | Doorbell press | Crying detected | Sound detected | Pet detected | Thumbnail last event | Battery status |
|--|--|--|--|--|--|--|--|--|
| Eufy Cam 2 (T8114) | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: |
| Eufy Cam 2 Pro (T8140) | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: |
| Eufy Cam 2C (T8113) | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: |
| Eufy Cam 2C Pro (T8142) | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: |
| Eufy Cam E (T8112) | :heavy_check_mark: | :x: | :x: | :x: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: |
| Floodlight Camera (T8420) | :heavy_check_mark: | :x: | :x: | :x: | :x: | :x: | :heavy_check_mark: | :x: |
| Indoor Cam 2K (T8400) | :heavy_check_mark: | :heavy_check_mark: | :x: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x: |
| Indoor Cam Pan & Tilt (T8410) | :heavy_check_mark: | :heavy_check_mark: | :x: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x: |
| Motion Sensor (T8910) | :heavy_check_mark: | :x: | :x: | :x: | :x: | :x: | :x: | :heavy_check_mark: |
| Eufy video doorbell 1080P (battery) (T8220 / T8222) | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: |
| Eufy video doorbell 1080P (powered) (T8221) | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :x: | :heavy_check_mark: | :x: |
| Eufy video doorbell 2K (battery) (T8210) | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :x: | :heavy_check_mark: | :heavy_check_mark: |
| Eufy video doorbell 2K (powered) (T8200 / T8202) | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x: | :x: | :x: | :heavy_check_mark: | :x: |

Also, the Door Sensor (T8900) is supported, this generates a seperate sensor, based on door open/closed events.

All push messages from all devices are logged, click [here](https://github.com/matijse/eufy-ha-mqtt-bridge/issues/7) to
help with adding support for new devices or message types that aren't supported yet.

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

### Run via Docker

Run the container, with a volume mapping to the local data directory, for example:

```shell
docker run \
   -d \
   --name eufy-bridge \
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
    volumes:
      - /path/to/local/data/folder:/app/data
```

If for some reason the connection with MQTT is lost, all sensors will be marked Unavailable in Home Assistant. So I
recommend not auto-restarting the Docker image, but adding an automation to Home Assistant to notify yourself when a 
sensor is Unavailable. This prevents your account from getting blocked when the script keeps restarting due to a bug...

### Run via npm

To run directly via npm:

1. Clone this repository
1. Create a `config.yml` file in the `data` folder, for contents see above.
1. Run `npm install`
1. Run `npm run start` or `npm run dev` to see debug output.

### Run as Home Assistant Add-on

[MaxWinterstein](https://github.com/MaxWinterstein/) created a Home Assistant Add-on Repository containing an easy 
installable version of this bridge. See [MaxWinterstein/homeassistant-addons](https://github.com/MaxWinterstein/homeassistant-addons)
for more information.

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

Crying detected:

```yaml
binary_sensor:
  - platform: mqtt
    name: Crying detected
    device_class: sound
    state_topic: homeassistant/binary_sensor/eufy/{device_sn}_crying/state
    json_attributes_topic: homeassistant/binary_sensor/eufy/{device_sn}_crying/attributes
    payload_on: crying
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
