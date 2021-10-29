<template lang="pug">
  div
    EntriesDownloadDialog(v-model="dialog_open")
    v-btn(@click="dialog_open=true") open
    DialogPage
</template>

<script>

import EnvMixin from "~/components/global/EnvMixin";
import OfflineMixin from "~/lib/OfflineMixin";
import Aspect from "~/components/Aspect"
import DialogPage from "~/minimal_working_tests/dialog/DialogPage"
import EntriesDownloadDialog from "~/components/dialogs/EntriesDownloadDialog"

export default {
  name: "tests",
  mixins: [EnvMixin, OfflineMixin],
  components: {EntriesDownloadDialog, DialogPage, Aspect},
  data() {
    return {
      dialog_open: false
    }
  },
  created() {

  },
  watch: {
  },
  computed: {
    // build_time() {
    //   return process.env.BUILD_TIME || "no build time"
    // },
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
