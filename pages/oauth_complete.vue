<template lang="pug">
  v-container
    //AspectSet
</template>

<script>

import {mapMutations} from "vuex"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";
import LanguageMixin from "~/components/LanguageMixin";
import NavBaseMixin from "~/components/NavBaseMixin";
import {BUS_HIDE_OVERLAY, BUS_OVERLAY, BUS_TRIGGER_SEARCH} from "~/plugins/bus";
import AspectSet from "~/components/AspectSet"
import Aspect from "~/components/Aspect";

export default {
  name: "oauth_complete",
  mixins: [TriggerSnackbarMixin, LanguageMixin, NavBaseMixin],
  components: {AspectSet, Aspect},
  props: {
    go_home: {
      type: Boolean,
      default: true
    }
  },
  async created() {
    this.$bus.$emit(BUS_OVERLAY)
    // const {code, access_token} = this.$route.query
    let user_settings  = null
    try {
      const {data: response_data} = await this.$api.basic.oauth_complete(this.$route.query)
      this.ok_snackbar(response_data.msg)

      this.clear_search()
      this.clear_entries({keep_drafts: true, keep_uuid: this.query_entry_uuid})
      this.map_clear()
      const user_data = response_data.data
      // console.log("user_data", user_data)
      user_settings = user_data.settings
      this.$store.dispatch("user/login", user_data)
      this.persist_user_data()
    } catch (err) {
      this.err_error_snackbar(err)
      this.$bus.$emit(BUS_HIDE_OVERLAY)
      // this.home()
      // return
    }
    try {
      await this.change_language(user_settings.ui_language, false, user_settings.domain_language)
      if (user_settings.fixed_domain) {
        await this.init_specifics(user_settings.fixed_domain, user_settings.domain_language)
      }

      this.$bus.$emit(BUS_HIDE_OVERLAY)
      if (this.go_home) {
        // this.home()
      } else {
        // watched by Search.vue and MapWrapper
        this.$bus.$emit(BUS_TRIGGER_SEARCH)
      }
    } catch (err) {
      console.log(err)
      // this.home()
    }
    this.$emit("logged_in")
  },
  methods: {
    ...mapMutations({
      "clear_search": "search/clear",
      clear_entries: "entries/clear",
      map_clear: "map/clear"
    })
  }

}
</script>

<style scoped>

</style>
