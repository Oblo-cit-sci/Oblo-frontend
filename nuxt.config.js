const pkg = require('./package')
const colors = require('vuetify/es5/util/colors')

/*
release mode:
partner
eovalue
*/

const release_modes = ["eovalue", "licci_partners"]

module.exports = {
  mode: 'universal',

  env: {
    NODE_ENV: process.env.NODE_ENV || true,
    release_mode: "licci_partners"
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
    base: "/app/"
  },

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    {src: '~/plugins/mapbox', mode: 'client'},
    '~/plugins/lodash.js',
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/font-awesome',
    '~/modules/myCache',
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
    // See https://github.com/nuxt-community/axios-module#options
    baseURL: "http://localhost:8080", //"http://192.168.1.36:5000", // //"http://158.109.161.247:5000",, //, // ,
    withCredentials: true,
    credentials: true,
    proxyHeaders: true,
  },
  proxy: {
    '/': 'http://api.example.com'
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
