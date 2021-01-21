// plugins/i18n.js

const ld = require("lodash")

import Vue from "vue"
import VueI18n from "vue-i18n"

// Tell Vue to use our plugin
Vue.use(VueI18n)

// const base_path = "~/static/langs/"

export default ({ app }) => {
  // Set the i18n instance on app
  // This way we can use it globally in our components through this.$i18n
  const lang = app.context.env.DEFAULT_LANGUAGE
  app.i18n = new VueI18n({
    // Set the initial locale
    locale: lang,

    // Set the fallback locale in case the current locale can't be found
    fallbackLocale: lang,

    warnHtmlInMessage: true,
    // Associate each locale to a content file
    messages: {
      [lang]: require(`~/static/langs/content-${lang}.json`),
    },

    // postTranslation: function (result, path) {
    // could be used to collect all paths required for all individual pages
    //   // console.log("post", path)
    //   // console.log(app)
    //   // console.log(app.$axios, app.context.route.name)
    //   return result
    // }
  })

  app.i18n.msg = (loc) => ld.get(app.i18n.messages[app.i18n.locale],loc)
}
