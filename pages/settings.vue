<template lang="pug">
  div
    h1 Settings
    br
    h3 Upload to the LICCI Repo (temporary option)
    div During the main data collection period of LICCI partners, partners can upload collected data to the LICCI data repository
    br
    Aspect(:aspect="user_key_aspect"
      :value="user_key"
      v-on:update:value="update_value($event)"
      :edit="true"
      mode="edit")
</template>

<script>
  import Aspect from "../components/Aspect";
  import {pack_value} from "../lib/aspect";

  export default {
    name: "settings",
    components: {Aspect},
    data() {
      return {
        user_key_aspect: {
          name: "User key",
          description: "For that purpose, in order to identify each partner, you need to paste your user key here, which you received from the LICCI core team",
          type: "str",
          attr: {
            max: 40
          }
        },
        user_key: pack_value("")
      }
    },
    methods: {
      update_value(event) {
        this.$store.commit("add_meta", {
          repository: {
            user_key: event.value
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
