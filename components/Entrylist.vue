<template lang="pug">
  div
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
        this.recent = res.entries;
        console.log("grabbed entries", this.recent);
      });
    },
    data: function () {
      return {
        recent: {},
        date: new Date().toISOString().substr(0, 10),
        somedate: false
      }
    }
  }
</script>

<style scoped>

</style>
