const pkg = require('./package')
const colors = require('vuetify/es5/util/colors')

var qs = require('qs');

const webpack = require('webpack')

/*
release mode:
partner
eovalue
*/


console.log("NUXT:CONFIG. env:server", process.env.SERVER)

let hostname = "https://opentek.eu"

if (process.env.SERVER === "staging") {
  console.log("building for staging")
  hostname = "https://staging.opentek.eu"
}

if (process.env.NODE_ENV === "development" || process.env.SERVER === "local") {
  console.log("building for localhost")
  hostname = "http://localhost:8100"
}

module.exports = {
  telemetry: false,

  env: {
    NODE_ENV: process.env.NODE_ENV || true,
    DEFAUL_OP_LANGUAGE: "en", // 639-1
    DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE || "en", // for the ui... // 639-3
    HOSTNAME: hostname,
    COLLECT_MESSAGE_PATHS: false, // during development. collect all messages path grouped by their page in the store.
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
    "@mdi/font/css/materialdesignicons.css",
    "mapbox-gl/dist/mapbox-gl.css"
  ],

  router: {
    middleware: ['fixed_domain', 'goatcounter'],
    base: "/"
  },

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/lodash.js',
    "~/plugins/bus.js",
    '~/plugins/api_wrapper',
    "~/plugins/i18n.js"
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
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
    baseURL: hostname,
    withCredentials: true,
    defaults: {
      // todo why not used?! needs to be added manually to all routes.
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
    // analyze: true,
    transpile: ['vuetify/lib'],
    loaders: {
      stylus: {
        import: ["~assets/style/variables.styl"]
      }
    },
    extractCSS: true,
    plugins: [
      new webpack.ProvidePlugin({
        mapboxgl: 'mapbox-gl',
      })
    ],
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {

    }
  }
}
