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
    v-btn(color="success" :href="dl_url" :download="download_title") export
</template>

<script>

  import {get_from_store_location} from "../lib/client";
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
            location: ["user","user_data"]
          },
          {
            text: "Fetched entries",
            value: "fetched",
            description: "entries of your timeline that you viewed",
            location: ["entries", "fetched_entries"]
          },
          {
            text: "Local entries",
            value: "local",
            description: "local/private entries",
            location: ["entries", "own_entries"]
          },
          {
            text: "drafts",
            value: "drafts",
            description: "drafted entries",
            location: ["edrafts", "drafts"]
          }
        ],
        selected: []
      }
    },
    created() {
      if(this.$store.state.user.user_data.global_role === "visitor"){
        this.disabled.push("profile")
        // kindof dangerous to use array index
        this.options[0].description = "You are a visitor"
      }
    },
    methods: {
      export_data() {
        let data = {}
        for(let select of this.selected) {
          console.log(select)
          const option = ld.find(this.options, (o) => {return o.value === select})
          data = get_from_store_location(this.$store, option.location)
          console.log(data)
        }
      }
    },
    computed: {
      dl_url() {
        console.log("UUU")
        let data = {}
        for(let select of this.selected) {
          const option = ld.find(this.options, (o) => {return o.value === select})
          data[select] = get_from_store_location(this.$store, option.location)
        }
        console.log(data)
        // TODO eventually: other method then encodeURIComponent https://stackoverflow.com/questions/695151/data-protocol-url-size-limitations
        // since some browser limit the size
        return "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
      }
    }
  }
</script>

<style scoped>

</style>
