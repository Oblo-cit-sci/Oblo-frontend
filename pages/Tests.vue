<template lang="pug">
  div
    v-footer
      div
        v-btn(to="/test/testStore" name="Test store") Test store
        v-btn(to="/test/testAspect" name="Test aspects") Test aspects
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
import Test_NumberAspect from "~/pages/test/aspects/test_NumberAspect"
import TemplateHelperMixin from "~/components/templates/TemplateHelperMixin"

export default {
  name: "tests",
  mixins: [EnvMixin, OfflineMixin, TemplateHelperMixin],
  components: {},
  data() {
    return {}
  },
  created() {
    // this.guarantee_template_code("cipred", "ko")
  },
  watch: {},
  computed: {
    dev_offline_switch_button_label() {
      return this.is_offline ? "S/ON" : "S/OFF"
    },
  },
  methods: {
    switch_offline() {
      this.$store.commit("dev_switch_offline")
    },
    until_today(d) {
      return new Date(d) <= new Date();
    }
  }
}
</script>

<style scoped>

</style>
