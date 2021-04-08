const yaml = require('js-yaml')
const fs = require('fs')
const get = require('get-value')
const winston = require('winston')
const Configstore = require('configstore');

class Config {
  config

  EUFY_USERNAME = 'eufy.username'
  EUFY_PASSWORD = 'eufy.password'
  EUFY_TOKEN = 'eufy.token'
  EUFY_TOKEN_EXPIRATION = 'eufy.token_expiration'
  EUFY_API_BASE = 'eufy.api_base'

  MQTT_URL = 'mqtt.url'
  MQTT_USERNAME = 'mqtt.username'
  MQTT_PASSWORD = 'mqtt.password'
  MQTT_KEEPALIVE = 'mqtt.keepalive'

  constructor () {
    this.config = new Configstore('eufy-ha-mqtt-bridge')

    let configYml
    try {
      configYml = yaml.load(fs.readFileSync('./data/config.yml', 'utf8'));
    } catch (e) {
      winston.error('Cannot read config.yml')
      throw e
    }

    this.config.set(this.EUFY_USERNAME, get(configYml, 'eufy.username'))
    this.config.set(this.EUFY_PASSWORD, get(configYml, 'eufy.password'))
    this.config.set(this.MQTT_URL, get(configYml, 'mqtt.url'))
    this.config.set(this.MQTT_USERNAME, get(configYml, 'mqtt.username'))
    this.config.set(this.MQTT_PASSWORD, get(configYml, 'mqtt.password'))
    this.config.set(this.MQTT_KEEPALIVE, parseInt(get(configYml, 'mqtt.keepalive', { default: 60 })))

    console.log(this.config.all)

    if (
      typeof this.config.get(this.EUFY_USERNAME) === "undefined" ||
      typeof this.config.get(this.EUFY_PASSWORD) === "undefined" ||
      typeof this.config.get(this.MQTT_URL) === "undefined"
    ) {
      winston.error('Missing configuration, please check config.yml')
      throw new Error('Missing configuration, please check config.yml')
    }
  }

  get (key, defaultValue) {
    const value = this.config.get(key)
    if (typeof value === "undefined") {
      return defaultValue
    }

    if (key === this.EUFY_TOKEN_EXPIRATION) {
      return new Date(value)
    }

    return value
  }

  set (key, value) {
    this.config.set(key, value)
  }

  has (key) {
    return this.config.has(key)
  }

  delete (key) {
    return this.config.delete(key)
  }
}

module.exports = new Config()
