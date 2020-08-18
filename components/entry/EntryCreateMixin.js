import uuidv4 from "uuid/v4"

import pkg from "~/package"
import {DRAFT, EDIT, PRIVATE_LOCAL, REGULAR} from "~/lib/consts"
import {TEMPLATES_TYPE} from "~/store/templates"
import {default_values, set_titleAspect} from "~/lib/entry"
import {CREATOR, user_ref} from "~/lib/actors"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import {ENTRIES_SAVE_ENTRY} from "~/store/entries"
import NavBaseMixin from "~/components/NavBaseMixin"

export default {
  name: "EntryCreateMixin",
  mixins: [PersistentStorageMixin, NavBaseMixin],
  methods: {
    // todo different owner in case of visitor
    // console.log("entry of template_slug", type_slug)
    create_entry(template_slug, persist = true, init = {}, goto = true) {
      const template = this.$store.getters[TEMPLATES_TYPE](template_slug)
      if (!template) {
        return null
      }
      // console.log("type of template_slug",template)

      const user_data = this.$store.getters.user
      const title = init.title || template.title

      const license = template.rules.license ? template.rules.license :
        (template.rules.privacy === PRIVATE_LOCAL ? "None" : this.$store.getters["user/settings_value"]("default_license"))
      const privacy = template.rules.privacy ? template.rules.privacy : this.$store.getters["user/settings_value"]("default_privacy")

      const location = init.location || null

      const actors = [{
        role: CREATOR,
        actor: user_ref(user_data)
      }]

      const entry = {
        //template: init.entry_type, // maybe out later...
        template: {
          uuid: template.uuid,
          slug: template_slug
        },
        template_version: template.version,
        values: init.values || default_values(template),
        type: REGULAR,
        license: license,
        privacy: privacy,
        title: title,
        entry_refs: {}, // ne
        tags: {},
        status: DRAFT, // todo should go to local
        uuid: uuidv4(),
        version: 0,
        local: { // local stuff that wont go to the server
          dirty: false // todo can go?
        },
        location: location,
        actors: actors,
        app_version: pkg.version,
        domain: template.domain,
        creation_ts: new Date(),
        attached_files: []
      }
      if (template.rules.titleAspect) {
        // is this the best way to check something and have a default of
        // set title aspect.default true
        if (template.rules.hasOwnProperty("setTitleAspect")) {
          if (template.rules.setTitleAspect) {
            set_titleAspect(this.$store, entry)
          }
        } else {
          set_titleAspect(this.$store, entry)
        }
      }
      if (persist) {
        this.persist_after_entry_create(entry)
      }
      if (goto) {
        this.to_entry(entry.uuid, EDIT)
      }
      return entry
    },
    persist_after_entry_create(entry) {
      this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
      this.persist_entries()
    }
  }
}
