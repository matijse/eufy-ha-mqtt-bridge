const get = require('get-value')
const winston = require('winston')
const sqlite3 = require('sqlite3').verbose()

class DB {
  constructor () {
    this.db = new sqlite3.Database('./data/database.sqlite')
    this.migrate()
  }

  migrate () {
    winston.info(`Migrating the database...`)
    this.db.serialize(() => {
      this.db.run('CREATE TABLE IF NOT EXISTS push_payloads (' +
        'id TEXT,' +
        'station_sn TEXT,' +
        'device_sn TEXT,' +
        'type NUMBER,' +
        'payload TEXT' +
        ')')

      this.db.run('CREATE TABLE IF NOT EXISTS devices (' +
        'id TEXT NOT NULL UNIQUE,' +
        'station_sn TEXT,' +
        'name TEXT,' +
        'type TEXT' +
        ')')
    })
  }

  storePush (push) {
    const id = get(push, 'id', { default: null })
    const station_sn = get(push, 'payload.station_sn', { default: null })
    const device_sn = get(push, 'payload.device_sn', { default: null })
    let type = parseInt(get(push, 'payload.payload.event_type', { default: 0 }))
    if (type === 0) {
      type = parseInt(get(push, 'payload.type', { default: 0 }))
    }

    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO push_payloads (id, station_sn, device_sn, type, payload) VALUES (?, ?, ?, ?, ?)',
        [
          id,
          station_sn,
          device_sn,
          type,
          JSON.stringify(push)
        ],
        (error) => {
          if (error !== null) {
            reject(error)
          } else {
            resolve()
          }
        })
    })
  }

  getDevice (id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM devices WHERE id = ?', [id], (error, row) => {
        if (error) {
          reject(error)
        } else {
          resolve(row)
        }
      })
    })
  }

  getDevices () {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM devices', (error, rows) => {
        if (error) {
          reject(error)
        } else {
          resolve(rows)
        }
      })
    })
  }

  createOrUpdateDevice (device) {
    const id = get(device, 'device_sn', { default: null })
    if (id === null) {
      throw new Error('Cannot get device_sn')
    }

    const station_sn = get(device, 'station_sn', { default: null })
    const name = get(device, 'device_name', { default: null })
    const type = get(device, 'device_model', { default: null })

    return new Promise((resolve, reject) => {
      this.db.run('INSERT OR REPLACE INTO devices (id, station_sn, name, type) VALUES (?, ?, ?, ?)',
        [
          id,
          station_sn,
          name,
          type
        ],
        (error) => {
          if (error !== null) {
            reject(error)
          } else {
            resolve()
          }
        })
    })
  }
}

module.exports = new DB()
