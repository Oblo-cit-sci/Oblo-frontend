const pkg = require('./package')
const colors = require('vuetify/es5/util/colors')

var qs = require('qs');

/*
release mode:
partner
eovalue
*/

const release_modes = ["opentek", "eovalue", "licci_partners"]

console.log("env:server", process.env.SERVER)

let axios_baseURL = "https://opentek.eu"

if(process.env.SERVER === "staging") {
  console.log("building for staging")
  axios_baseURL = "https://staging.opentek.eu"
}

if(process.env.NODE_ENV === "development" || process.env.SERVER === "local") {
  console.log("building for localhost")
  axios_baseURL = "http://localhost:8100"
}

module.exports = {
  mode: 'universal',

  env: {
    NODE_ENV: process.env.NODE_ENV || true,
    release_mode: "opentek"
  },

  server: {
    port: 8082,
    host: "0.0.0.0"
  },

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'},
      {hid: 'description', name: 'description', content: pkg.description}
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: {color: '#fff'},

  /*
  ** Global CSS
  */
  css: [
    '~/assets/style/app.styl',
    '~/assets/style/main.scss',
    "@mdi/font/css/materialdesignicons.css"
  ],

  router: {
    middleware: ['init'],
    base: "/"
  },

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    {src: '~/plugins/mapbox', mode: 'client'},
    '~/plugins/lodash.js',
    {src: '~/plugins/api_wrapper'},
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/font-awesome',
    '@nuxtjs/localforage'
  ],


  buildModules: [
    ['@nuxtjs/vuetify', {
      defaultAssets: false,
      icons: {
        iconfont: 'mdi',
      },
      theme: {
        themes: {
          light: {
            primary: colors.default.blue.darken2,
            accent: colors.default.grey.darken3,
            secondary: colors.default.amber.darken4,
            info: colors.default.teal.lighten1,
            warning: colors.default.amber.base,
            error: colors.default.deepOrange.accent4,
            success: colors.default.green.accent4
          },
        },
      }
    }]
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    baseURL: axios_baseURL,
    withCredentials: true,
    defaults: {
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    }

    // credentials: true,
    // proxyHeaders: true,
  },
  /*
  ** Build configuration
  */
  build: {
    transpile: ['vuetify/lib'],
    loaders: {
      stylus: {
        import: ["~assets/style/variables.styl"]
      }
    },

    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {

    }
  }
}
