import uuidv4 from "uuid/v4"

import pkg from "~/package"
import {DRAFT, EDIT, PRIVATE_LOCAL, REGULAR} from "~/lib/consts"

import {default_values} from "~/lib/entry"
import {CREATOR, user_ref} from "~/lib/actors"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"

import NavBaseMixin from "~/components/NavBaseMixin"

export default {
  name: "EntryCreateMixin",
  mixins: [PersistentStorageMixin, NavBaseMixin],
  methods: {
    // todo different owner in case of visitor
    // console.log("entry of template_slug", type_slug)
    create_entry(template_slug, language = null, persist = true, init = {}, goto = true) {
      const lang = this.$store.getters["user/settings"].domain_language
      const template = this.$store.getters["templates/entry_type"](template_slug, lang)
      if (!template) {
        return null
      }
      // console.log("type of template_slug",template)

      const user_data = this.$store.getters.user
      const title = init.title || ""

      const license = template.rules.license ? template.rules.license :
        (template.rules.privacy === PRIVATE_LOCAL ? "None" : this.$store.getters["user/settings_value"]("default_license"))
      const privacy = template.rules.privacy ? template.rules.privacy : this.$store.getters["user/settings_value"]("default_privacy")

      language = language || this.$store.getters["user/settings"].domain_language
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
        language: language,
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
      if (persist) {
        this.persist_after_entry_create(entry)
      }
      if (goto) {
        this.to_entry(entry.uuid, EDIT)
      }
      return entry
    },
    persist_after_entry_create(entry) {
      this.$store.commit("entries/save_entry", entry)
      // this.persist_entries()
    },
    entry_select_items(entries, indicate_alt_language =null) {
      return entries.reduce((items, e) => {
        const {slug: value, title: text, description} = e;
        const item = {value, text, description}
        if (indicate_alt_language !== null && e.language !== indicate_alt_language) {
          item.language = e.language
        }
        items.push(item)
        return items
      }, [])
    }
  }
}
