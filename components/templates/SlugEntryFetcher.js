import EntryHelperMethodsMixin from "~/components/entry/EntryHelperMethodsMixin"

export default {
  name: "slugentryfetcher",
  mixins:[EntryHelperMethodsMixin],
  methods: {
    async guarantee_template_code_with_references(slug, language) {
      const has_template = this.$store.getters["templates/has_template_in_lang"](slug, language)
      if (has_template) {
        return Promise.resolve()
      }
      // console.log("has_template", has_template)
      const can_request = this.$store.getters["templates/is_slug_lang_marked_missing"](slug, language)
      // console.log("can_request", !can_request)
      try {
        const response = await this.$api.template_code.get_slug_lang_with_references(slug, language)
        // console.log(response.data)
        response.data.forEach(e => {
          this.$store.commit("templates/insert_template_code", e)
        })
        // this.$store.commit("templates/insert_template_code", response.data)
        return response.data
      } catch (error) {
        if (error.response.status === 404) {
          // console.log("not found...")
          // something to force inserting the base
          await this.guarantee_default_language(slug)
          this.$store.commit("templates/add_missing", {slug, language})
        }
      }
    },
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
        // console.log(response.data)
        this.$store.commit("templates/insert_template_code", response.data)
        return response.data
      } catch (error) {
        if (error.response.status === 404) {
          // console.log("not found...")
          // something to force inserting the base
          await this.guarantee_default_language(slug)
          this.$store.commit("templates/add_missing", {slug, language})
        }
      }
    },
    async guarantee_default_language(slug) {
      const has_template = this.$store.getters["templates/has_slug"](slug)
      if (has_template) {
        return Promise.resolve()
      }
      try {
        const response = await this.$api.template_code.get_slug_lang(slug, "xx", true)
        // console.log(response.data)
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
