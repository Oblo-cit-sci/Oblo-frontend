<template lang="pug">

</template>

<script>

import {mapMutations} from "vuex"

export default {
  name: "oauth_complete",
  async created() {
    // const {code, access_token} = this.$route.query
    try {
      const {data: response_data} = await this.$api.basic.oauth_complete(this.$route.query)


      this.ok_snackbar(response_data.msg)

      this.clear_search()

      this.clear_entries({keep_drafts: true, keep_uuid: this.query_entry_uuid})

      this.map_clear()
      const user_data = response_data.data
      // console.log("user_data", user_data)
      const user_settings = user_data.settings
      this.$store.dispatch("user/login", user_data)
      this.persist_user_data()
      return
    } catch (err) {
      this.err_error_snackbar(err)
    }

    try {
      await this.change_language(user_settings.ui_language, false, user_settings.domain_language)
      if (user_settings.fixed_domain) {
        await this.init_specifics(user_settings.fixed_domain, user_settings.domain_language)
      }

      if (this.go_home) {
        this.home()
      } else {
        // watched by Search.vue and MapWrapper
        this.$bus.$emit("trigger_search")
      }
    } catch (err) {
      console.log(err)
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
