// cant remove that for some weird reason


export default async function (context) {

  if (context.route.path === "/") {
    const fixed_domain = context.store.getters["user/settings"].fixed_domain
    if (fixed_domain) {
      context.redirect(302, "/domain", {
        f: fixed_domain,
        // unfortunately we seem to need this, to fix the domain again
      })
    }
  }
}
