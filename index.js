const winston = require('winston')

winston.configure({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: './data/error.log', level: 'error' }),
    new winston.transports.File({ filename: './data/combined.log' }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: './data/exceptions.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  winston.add(new winston.transports.Console({
    level: 'debug',
    format: winston.format.simple(),
  }));
}

const { EufyClient } = require('./eufy')

const eufyClient = new EufyClient()
eufyClient.init()
