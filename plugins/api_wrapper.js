import Vue from 'vue'

const qs = require('qs');

class APIWrapper {

  constructor() {
    this.axios = null
  }

  init(axios) {
    this.axios = axios
  }

  is_initialized() {
    return this.axios !== null
  }

  /*
  API ROUTES
   */

  token(username, password) {
    return this.axios.post("/token", qs.stringify({
      username,
      password,
      grant_type: "password"
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }
}


// console.log(Nuxt)
Vue.prototype.$api = new APIWrapper()
