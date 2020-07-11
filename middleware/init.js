// cant remove that for some weird reason
import {} from "~/lib/client"


export default async function (context) {

  // console.log("domain-redir, home?", context.route.path === "/", "fixed?", context.store.getters[APP_FIXED_DOMAIN])

  if (context.route.path === "/") {
    const fixed_domain = context.store.getters["user/settings"].fixed_domain
    if (fixed_domain) {
      // console.log("redirect")
      context.redirect(302, "/domain", {
        f: fixed_domain,
        // unfortunately we seem to need this, to fix the domain again
      })
    }
  }
}
