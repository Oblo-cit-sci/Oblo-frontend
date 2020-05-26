import uuidv4 from "uuid/v4"

import pkg from "~/package"
import {DRAFT, PRIVATE_LOCAL, REGULAR} from "~/lib/consts"
import {PUSH_PAGE_PATH, UPDATE_DRAFT_NUMBER} from "~/store"
import {TEMPLATES_TYPE} from "~/store/templates"
import {default_values, set_titleAspect} from "~/lib/entry"
import {CREATOR, user_ref} from "~/lib/actors"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import {ENTRIES_SAVE_ENTRY} from "~/store/entries"

export default {
  name: "EntryCreateMixin",
  mixins: [PersistentStorageMixin],
  methods: {
    // todo different owner in case of visitor
    // console.log("entry of template_slug", type_slug)
    create_entry(template_slug, persist = true, init = {}) {
      const template = this.$store.getters[TEMPLATES_TYPE](template_slug)
      if(!template) {
        return null
      }
      // console.log("type of template_slug",template)
      const draft_no = this.get_update_draft_no(template_slug)

      const user_data = this.$store.getters.user
      const title = init.title || template.title + " " + draft_no

      const license = template.rules.license ? template.rules.license :
        (template.rules.privacy === PRIVATE_LOCAL ? "None" : user_data.default_license)
      const privacy = template.rules.privacy ? template.rules.privacy : user_data.default_privacy

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
        draft_no: draft_no, // todo. local
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
          dirty: false, // todo can go?
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
      return entry
    },
    persist_after_entry_create(entry) {
      this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
      this.persist_draft_numbers()
      this.persist_entries()
    },
    get_update_draft_no(template_slug) {
      const draft_no = this.$store.getters.draft_no(template_slug) + 1
      this.$store.commit(UPDATE_DRAFT_NUMBER, template_slug)
      return draft_no
    }
  }
}
