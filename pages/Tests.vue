<template lang="pug">
  div

</template>

<script>

import EnvMixin from "~/components/global/EnvMixin";
import OfflineMixin from "~/lib/OfflineMixin";

export default {
  name: "tests",
  mixins: [EnvMixin, OfflineMixin],
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
