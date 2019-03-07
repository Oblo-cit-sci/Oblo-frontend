<template lang="pug">
  div
    div {{welcome}}
    v-list
      v-list-tile(v-for="entry in recent", :key="entry.id")
        div
          span By {{entry.creator}}
          br
          div  data {{entry.data}}
          v-divider
</template>

<script>
  import {recent_entries} from "../lib/common"

  export default {
    name: "Entrylist",
    created() {
      recent_entries().then((res) => {
        this.recent = res.result;
      });
    },
    data: function () {
      return {
        welcome: "Welcome " +this.$store.state.user["public name"],
        recent: {},
        date: new Date().toISOString().substr(0, 10),
        somedate: false
      }
    }
  }
</script>

<style scoped>

</style>
