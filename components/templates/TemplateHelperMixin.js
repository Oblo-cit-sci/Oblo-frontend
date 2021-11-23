import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import EntryHelperMethodsMixin from "~/components/entry/EntryHelperMethodsMixin"

export default {
  name: "TemplateHelperMixin",
  mixins: [TriggerSnackbarMixin, EntryHelperMethodsMixin],
  created() {
    if (!this.template) {
      console.log("TemplateHelperMixin.WARNING: no template in component")
    }
  },
  methods: {
    get_reference_slugs() {
      return Array.from(this.template.entry_refs.reduce((slug_set, ref) => {
        slug_set.add(ref.dest_slug)
        return slug_set
      }, new Set()).values())
    },
    has_template_in_lang(slug, language) {
      return this.$store.getters["templates/has_template_in_lang"](slug, language)
    },
    has_code_in_lang(slug, language) {
      return this.$store.getters["templates/has_code_in_lang"](slug, language)
    },
    has_slug_in_lang(slug, language) {
      return this.$store.getters["templates/has_slug_in_lang"](slug, language)
    },
    // // todo this maybe somewhere else
    // // ENTRYFETCH_MIXIN
    // async guarantee_slugs_in_language(slugs, language) {
    //     const missing = slugs.filter(slug => !this.has_slug_in_lang(slug, language))
    //     if (!this.$_.isEmpty(missing)) {
    //         const {data} = await this.$api.entries.get_entries_by_slugs(missing, language)
    //         const entries = data.data
    //         await this.$store.dispatch("templates/add_templates_codes", entries)
    //     }
    // },
    // TODO should work, but we also download complete sets of code_template for a domain
    // async guarantee_slug_lang(slug, language) {
    //     if (this.$store.getters["entries/has_full_entry"](entry_uuid)) {
    //         return Promise.resolve(this.$store.getters["entries/get_entry"](entry_uuid))
    //     } else {
    //         const entry_response = await this.$api.entry.get_slug_lang(slug, language)
    //         if (entry_response.status === 200) {
    //             const entry = entry_response.data.data
    //             this.$store.commit("templates/insert_template_code", entry)
    //             // todo: maybe do more stuff. preparing?
    //             this.$store.commit("entries/save_entry", entry)
    //             return Promise.resolve(entry)
    //         } else {
    //             return Promise.reject(entry_response)
    //         }
    //     }
    // }
    async guarantee_template_code(slug, language) {
      const has_template = this.$store.getters["templates/has_template_in_lang"](slug, language)
      if (has_template) {
        return Promise.resolve()
      }
      console.log("has_template", has_template)
      const can_request = this.$store.getters["templates/is_slug_lang_marked_missing"](slug, language)
      console.log("can_request", !can_request)
      try {
        const response = await this.$api.template_code.get_slug_lang(slug, language)
        console.log(response.data)
      } catch (error) {
        if(error.response.status === 404) {
          // console.log("not found...")
          // something to force inserting the base
          await this.guarantee_default_language(slug)
          this.$store.commit("templates/add_missing", {slug, language})
        }
      }
    },
    async guarantee_default_language(slug) {

      const has_template = this.$store.getters["templates/has_slug"](slug)
      if(has_template) {
        return Promise.resolve()
      }
      try {
        const response = await this.$api.template_code.get_slug_lang(slug,"xx",true)
        console.log(response.data)
        this.$store.commit("templates/insert_template_code", response.data)
      } catch (error) {
        console.error(error)
      }
    },
    async guarantee_template_code_of_version(entry) {
      if (entry.template_version ===
        this.$store.getters["templates/get_current_template_version"](entry.template.slug, entry.language)) {
        return
      }
      const existing_template_code = this.get_template_of_version(entry)
      if (existing_template_code) {
        return Promise.resolve(existing_template_code)
      } else {
        // todo could be template.language but that is not included yet...
        return this.retrieve_template_code_of_version(entry.template.slug, entry.language, entry.template_version)
      }
    },
    async retrieve_template_code_of_version(slug, language, version) {
      return new Promise((resolve, reject) => {
        this.$api.template_code.get_entry_of_version(slug, language, version).then(resp => {
          console.log(resp.data)
          this.$store.commit("templates/add_template_of_version", resp.data.data)
          return resolve(resp.data)
        }).catch(err => {
          console.error(err)
          this.error_snackbar()
          return reject()
        })
      })
    }
  }
}
