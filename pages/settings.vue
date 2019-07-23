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
    h3 Import data
    LoadFileButton(@fileload="load_file($event)")
    h3 Clear entries
    v-btn(@click="show_clear_entries = true") Clear
    DecisionDialog(v-bind="dialog_data" :open="show_clear_entries")
</template>

<script>
  import Aspect from "../components/Aspect";
  import {pack_value} from "../lib/aspect";
  import LoadFileButton from "../components/LoadFileButton";
  import DecisionDialog from "../components/DecisionDialog";

  export default {
    name: "settings",
    components: {DecisionDialog, LoadFileButton, Aspect},
    data() {
      return {
        dialog_data: {
          id: "cc",
          title: "Are you sure you want to clear all entries? Did you make a bakup via Export?"
        },
        user_key_aspect: {
          name: "User key",
          description: "For that purpose, in order to identify each partner, you need to paste your user key here, which you received from the LICCI core team",
          type: "str",
          attr: {
            max: 40
          }
        },
        show_clear_entries: false,
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
      },
      load_file(event) {
        if(event.ok) {
          event.data.forEach(entry => {
            this.$store.commit("entries/save_entry", entry)
          })
        }
      },

      clear_entries() {
        this.$store.commit("entries/clear")
      }
    }
  }
</script>

<style scoped>

</style>
