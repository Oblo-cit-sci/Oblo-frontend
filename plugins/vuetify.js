import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import colors from "vuetify/es5/util/colors" 
// import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify, {
  theme: {
    dark: false,
     themes: {
       dark: {
         primary: colors.deepPurple.lighten3,
         accent: colors.red,
         secondary: colors.amber.darken3,
         info: colors.teal.lighten1,
         warning: colors.amber.base,
         error: colors.deepOrange.accent4,
         success: colors.green.accent4
       },
       light: {
        primary: colors.deepPurple.lighten3,
        accent: colors.red,
        secondary: colors.amber.darken3,
        info: colors.teal.lighten1,
        warning: colors.amber.base,
        error: colors.deepOrange.accent4,
        success: colors.green.accent4
      }
    }
  },
});
