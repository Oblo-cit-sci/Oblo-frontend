<template lang="pug">
  div
    v-checkbox(
      v-for="(option, index) in options"
      :key="option.value"
      :disabled="disabled.indexOf(option.value) !== -1"
      v-model="selected"
      :label="option.text"
      :value="option.value"
      :messages   ="option.description")
    v-btn(color="success" @click="blob_dl") export
</template>

<script>

  import {export_data} from "../lib/import_export";
  import {get_from_store_location} from "../lib/aspect";
  import {mapToJson, printDate} from "../lib/util";

  const ld = require("lodash")


  export default {
    name: "export",
    data() {
      return {
        disabled: [],
        download_title: "export.json",
        options: [
          {
            text: "Profile",
            value: "profile",
            description: "user profile data",
            location: ["user", "user_data"]
          },
          {
            text: "Entry types",
            value: "types",
            description: "entry types for creating entries",
            location: ["entry_types"]
          },
          {
            text: "Codes",
            value: "codes",
            description: "codes that are used in entry creations",
            location: ["codes"]
          },
          /*{
            text: "Fetched entries",
            value: "fetched",
            description: "entries of your timeline that you viewed",
            location: ["entries", "fetched_entries"]
          },*/
          {
            text: "Local entries",
            value: "local",
            description: "local/private entries",
            location: ["entries", "entries"]
          },
        ],
        selected: ["local"]
      }
    },
    created() {
      if (this.$store.state.user.user_data.global_role === "visitor") {
        this.disabled.push("profile")
        // kindof dangerous to use array index
        this.options[0].description = "You are a visitor"
      } else {
        this.selected.push("profile")
      }
    },
    methods: {
      export_data() {
        let data = {}
        for (let select of this.selected) {
          const option = ld.find(this.options, (o) => {
            return o.value === select
          })
          //console.log("export.", option, select)
          let store_data = get_from_store_location(this.$store, option.location)
          if (store_data.constructor === Map) {
            store_data = mapToJson(store_data)
          }
          data[select] = store_data
        }
        return data
      },
      blob_dl() {
        const filename = "export_" + printDate(new Date()) + ".json"
        export_data(this.export_data(), filename)
        //console.log(this.export_data())
      }
    },
  }
</script>

<style scoped>

</style>
