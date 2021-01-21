class Scheduler {

  runEveryHour (handler, runImmediately = false) {
    setInterval(handler, 60 * 60 * 1000)

    if (runImmediately) {
      handler()
    }
  }

}

module.exports = new Scheduler()