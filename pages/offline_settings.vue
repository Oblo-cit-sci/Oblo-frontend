<template lang="pug">
  div
    div Offline Settings
    div {{prompt_set}}
    div(v-if="!is_pwa")
      v-btn(@click="install_pwa") install
</template>

<script>
import {install_pwa, is_prompt_set, is_standalone} from "~/lib/pwa";

export default {
  name: "offline_settings",
  data() {
    return {

    }
  },
  computed: {
    is_pwa() {
      return is_standalone()
    },
    prompt_set() {
      return is_prompt_set()
    }
  },
  methods: {
    install_pwa() {
      install_pwa()
    }
  }
}
</script>

<style scoped>

</style>
