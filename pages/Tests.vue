<template lang="pug">
  div
    //EntriesDownloadDialog(:dialog_open.sync="dialog_open")
    //v-btn(@click="open_dialog") open
    DialogPage
</template>

<script>

import EnvMixin from "~/components/global/EnvMixin";
import OfflineMixin from "~/lib/OfflineMixin";
import Aspect from "~/components/Aspect"
import DialogPage from "~/minimal_working_tests/DialogPage"

export default {
  name: "tests",
  mixins: [EnvMixin, OfflineMixin],
  components: {DialogPage, Aspect},
  data() {
    return {
    }
  },
  created() {

  },
  watch: {
  },
  computed: {
    build_time() {
      return process.env.BUILD_TIME || "no build time"
    },
    dev_offline_switch_button_label() {
      return this.is_offline ? "S/ON" : "S/OFF"
    },
  },
  methods: {
    switch_offline() {
      this.$store.commit("dev_switch_offline")
    }
  }
}
</script>

<style scoped>

</style>
