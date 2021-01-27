<template lang="pug">
  Entry(:entry="entry" :mode="mode")
</template>

<script>


import PersistentStorageMixin from "../components/util/PersistentStorageMixin";
import Entry from "../components/entry/Entry";
import {VIEW} from "~/lib/consts"

// todo, use mapgetters with entries context
export default {
  name: "entry",
  mixins: [PersistentStorageMixin],
  components: {
    Entry
  },
  data() {
    return {}
  },
  created() {
    // todo some in case we want edit in main page, it wouldnt be set to edit yet, cuz this is the only place edit is set...
    if (!this.$store.getters["entries/has_full_entry"](this.uuid)) {
      // actually should be home or back. but we should always have it...
      this.$router.push("/")
    }
    this.$store.dispatch("entries/set_edit", this.uuid)
  },
  beforeRouteEnter(to, from, next) {
    // console.log("entry enter.. to", to)
    if (!to.query.uuid) {
      // todo page not found :(
      next(false)
    } else {
      next()
    }
  },
  mounted() {
    // if (this.$route.query.goTo) {
    //   setTimeout(() => {
    //     goTo("#" + this.$route.query.goTo, {
    //       duration: 1200,
    //       easing: "easeOutCubic"
    //     })
    //   }, 300)
    // }
    // if (this.outdated) {
    //   this.$store.dispatch(ENTRIES_UPDATE_PARENT_VERSION, this.uuid)
    //   this.ok_snackbar("Updated")
    // }
  },
  beforeRouteLeave(to, from, next) {
    // console.log("entry leave")
    if (this.entry.is_draft) {
      this.persist_entries()
    }
    next()
  },
  computed: {
    uuid() {
      return this.$route.query.uuid
    },
    entry() {
      return this.$store.getters["entries/get_edit"]()
    },
    mode() {
      return this.$route.query.entry_mode || VIEW
    }
  },
  methods: {
    // check_language_switch() {
    //   if (this.entry.language !== this.$store.getters.domain_language) {
    //     this.$bus.$emit("dialog-open", {
    //       data: {
    //         cancel_text: this.$t("comp.entry.language_switch_dialog.cancel_text"),
    //         title: this.$t("comp.entry.language_switch_dialog.title"),
    //         text: this.$t("comp.entry.language_switch_dialog.text",
    //           {language: this.$t("lang." + this.entry.language)})
    //       },
    //       cancel_method: () => {
    //         this.$router.back()
    //       },
    //       confirm_method: async () => {
    //         const template_slug = this.entry.template.slug
    /*        const entry_lang = this.entry.language*/
    //         await this.guarantee_slugs_in_language(this.get_reference_slugs().concat([template_slug]), entry_lang)
    //         const has_entry = this.$store.getters["templates/has_template_in_lang"](template_slug, entry_lang)
    //         if (has_entry) {
    //           this.force_entry_language = true
    //         } else {
    //           this.error_snackbar(this.$t("comp.entry.template_not_in_lang"))
    //         }
    //       }
    //     })
    //   }
    // }
  }
}
</script>

<style scoped>

</style>
