import Vue from 'vue'

const logger = new Vue()

Vue.prototype.$log = logger
logger.messages = []

logger.log = (list) => {
  console.log(list)
  logger.messages.push(list)
}
