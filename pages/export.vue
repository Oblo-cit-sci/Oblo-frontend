<template lang="pug">
  div
    v-checkbox(
      v-for="(option, index) in options"
      :keys="option.value"
      v-model="selected"
      :label="option.text"
      :value="option.value"
      :messages   ="option.description")
    v-btn(color="success" @click="export_data") export
</template>

<script>

  import MultiSelect from "../components/MultiSelect";
  const ld = require("lodash")

  export default {
    name: "export",
    data() {
      return {
        options: [
          {
            text: "Profile",
            value: "profile",
            description: "user profile data",
            location: "user_data"
          },
          {
            text: "Fetched entries",
            value: "fetched",
            description: "entries of your timeline that you viewed",
            location: "entries"
          },
          {
            text: "Local entries",
            value: "local",
            description: "local/private entries"
          },
          {
            text: "drafts",
            value: "drafts",
            description: "drafted entries",
            location: "edrafts"
          }
        ],
        selected: []
      }
    },
    methods: {
      export_data() {
        let data = {}
        for(let select of this.selected) {
          console.log(select)
          const option = ld.find(this.options, (o) => {return o.value === select})
          console.log(option)
        }
      }
    }
  }
</script>

<style scoped>

</style>
