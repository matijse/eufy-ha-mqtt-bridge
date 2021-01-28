const yaml = require('js-yaml')
const fs = require('fs')
const get = require('get-value')
const winston = require('winston')

class Config {
  eufyUsername
  eufyPassword
  mqttUrl
  mqttUsername
  mqttPassword

  constructor () {
    let config
    try {
      config  = yaml.load(fs.readFileSync('./data/config.yml', 'utf8'));
    } catch (e) {
      winston.error('Cannot read config.yml')
      throw e
    }

    this.eufyUsername = get(config, 'eufy.username')
    this.eufyPassword = get(config, 'eufy.password')

    this.mqttUrl = get(config, 'mqtt.url')
    this.mqttUsername = get(config, 'mqtt.username')
    this.mqttPassword = get(config, 'mqtt.password')

    if (
      typeof this.eufyUsername === "undefined" ||
      typeof this.eufyPassword === "undefined" ||
      typeof this.mqttUrl === "undefined"
    ) {
      winston.error('Missing configuration, please check config.yml')
      throw new Error('Missing configuration, please check config.yml')
    }
  }
}

module.exports = new Config()
