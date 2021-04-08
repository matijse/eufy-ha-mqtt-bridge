class Scheduler {

  runEveryHour (handler, runImmediately = false) {
    setInterval(handler, 60 * 60 * 1000)

    if (runImmediately) {
      handler()
    }
  }

  sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

}

module.exports = new Scheduler()