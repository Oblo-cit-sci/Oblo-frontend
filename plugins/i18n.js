// plugins/i18n.js

const ld = require("lodash")

import Vue from "vue"
import VueI18n from "vue-i18n"

Vue.use(VueI18n)


export default ({app}) => {
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

    postTranslation: function (result, path) {
      // console.log(app.context.isDev, app.context.env)
      if (app.context.isDev) {
        let {page_messages} = app.store.getters["app/get_dev"]
        if (!page_messages)
          page_messages = {}
        let route_msgs = page_messages[app.context.route.name]
        if (!route_msgs) {
          route_msgs = new Set()
          page_messages[app.context.route.name] = route_msgs
        }
        if (!route_msgs.has(path)) {
          route_msgs.add(path)
          app.context.store.commit("app/set_dev", {data: {page_messages}, merge: true})
        }
      }
      return result
    }
  })

  app.i18n.msg = (loc) => ld.get(app.i18n.messages[app.i18n.locale], loc)
  app.i18n.silence = silence => app.i18n.silentTranslationWarn = silence

}
