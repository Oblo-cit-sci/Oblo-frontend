// plugins/i18n.js

const ld = require("lodash")

import Vue from "vue"
import VueI18n from "vue-i18n"

// Tell Vue to use our plugin
Vue.use(VueI18n)

const base_path = "~/static/langs/"

export default ({ app }) => {
  // Set the i18n instance on app
  // This way we can use it globally in our components through this.$i18n
  app.i18n = new VueI18n({
    // Set the initial locale
    locale: "en",

    // Set the fallback locale in case the current locale can't be found
    fallbackLocale: "en",

    warnHtmlInMessage: true,
    // Associate each locale to a content file
    messages: {
      en: require("~/static/langs/content-en.json"),
      de: require("~/static/langs/content-de.json"),
      // es: require("~/static/langs/content-es.json")
    }
  })

  app.i18n.msg = (loc) => ld.get(app.i18n.messages[app.i18n.locale],loc)
}
