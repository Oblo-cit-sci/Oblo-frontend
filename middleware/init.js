import entry_types from "../lib/data_backups/types";
import codes from "../lib/data_backups/codes"

export default function (context) {
  //context.userAgent = process.server ? context.req.headers['user-agent'] : navigator.userAgent;
  /*
  let DEV_MODE = context.env.NODE_ENV

  if (DEV_MODE) {
    context.store.commit("backup_init", {
      entryTemplates: entry_types,
      codes: codes
    })
  }
   */
}
