import entry_types from "../lib/data_backups/types";
import codes from "../lib/data_backups/codes"
import {LICCI_PARTNERS} from "../lib/consts";
import {initialize} from "../lib/client"
import {SET_DOMAIN} from "../lib/store_consts";
import {get_release_mode} from "../lib/util";


export default async function (context) {
  console.log("init-middleware")
  const licci_partner_home = get_release_mode(null, context) === LICCI_PARTNERS && context.route.path === "/"

  if (!context.store.state.initialized) {

    //await initialize(context.$axios, context.store, context.localForage)

    if (licci_partner_home) {
      return context.redirect("/domain/licci/")
    }

  } else {
    if (licci_partner_home) {
      return context.redirect("/domain/licci/")
    }
  }
}
