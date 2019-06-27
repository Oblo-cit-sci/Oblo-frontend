
import entry_types from "../lib/types";
import codes from "../lib/codes"

export default function (context) {
  context.userAgent = process.server ? context.req.headers['user-agent'] : navigator.userAgent;
  context.store.commit("backup_init", {
    entryTemplates: entry_types,
    codes: codes
  })
}
