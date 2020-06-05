// cant remove that for some weird reason
import {} from "~/lib/client"
import {APP_FIXED_DOMAIN} from "~/store/app"

// const APP_FIXED_DOMAIN = "app/fixed_domain"

export default async function (context) {
  // console.log(context.route.path, context.route.query)
  // console.log(context.$axios)
  if (context.route.query.hasOwnProperty("fixed_domain")) {
    context.store.commit(APP_FIXED_DOMAIN, context.route.query.fixed_domain)
  } else if(context.route.path === "/domain" && context.route.query.hasOwnProperty("f")) {
    context.store.commit(APP_FIXED_DOMAIN, context.route.query.f)
  }
  // console.log("domain-redir, home?", context.route.path === "/", "fixed?", context.store.getters[APP_FIXED_DOMAIN])

  if(context.route.path === "/") {
      if(context.store.getters[APP_FIXED_DOMAIN]) {
        console.log("redirect")
        context.redirect(302, "/domain", {
          f: context.store.getters[APP_FIXED_DOMAIN],
          // unfortunately we seem to need this, to fix the domain again
        })
      }
  }
}
