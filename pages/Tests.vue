<template lang="pug">
  div
    TextCompare
</template>

<script>

import EnvMixin from "~/components/global/EnvMixin";
import OfflineMixin from "~/lib/OfflineMixin";
import Aspect from "~/components/Aspect"
import DialogPage from "~/minimal_working_tests/dialog/DialogPage"
import EntriesDownloadDialog from "~/components/dialogs/EntriesDownloadDialog"
import DateAspect from "~/components/aspects/DateAspect"
import {pack_value} from "~/lib/aspect"
import MonthAspect from "~/components/aspects/MonthAspect"
import TextCompare from "~/components/util/TextCompare"

export default {
  name: "tests",
  mixins: [EnvMixin, OfflineMixin],
  components: {TextCompare, MonthAspect, EntriesDownloadDialog, DialogPage, Aspect},
  data() {
    return {
      dialog_open: false,
      i_value: null,
      month: pack_value(null)
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
    },
    until_today(d) {
      return new Date(d)  <= new Date();
    }
  }
}
</script>

<style scoped>

</style>
