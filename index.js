const winston = require('winston')

winston.configure({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: './data/eufy.log' }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: './data/exceptions.log' }),
  ]
})

winston.add(new winston.transports.Console({
  level: process.env.NODE_CONSOLE_LOG_LEVEL ? process.env.NODE_CONSOLE_LOG_LEVEL : 'error',
  format: winston.format.simple(),
  handleExceptions: true
}));

const EufyClient = require('./eufy/client')

const eufyClient = new EufyClient()
eufyClient.init()
