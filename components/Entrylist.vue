<template lang="pug">
  div
    v-list(two-line subheader)
      v-list-tile(v-for="entry in entries", :key="entry.id" @click="show(entry)")
        v-list-tile-avatar
          v-icon {{privacy_icon(entry.privacy)}}
        v-list-tile-content
          v-list-tile-title 😁 {{entry.creator}}
          v-list-tile-sub-title {{entry.title}}

        v-list-tile-action
          v-img(:src="get_license_icon(entry.license)" height="30px" width="100px" style="margin-left:20px")
      v-divider
</template>

<script>
  import { license_icon } from "../lib/client"

  export default {
    name: "Entrylist",
    props: {
      entries: Array
    },
    created() {
      /*
      recent_entries().then((res) => {
        this.recent = res.entries;
        console.log("entries", this.recent);
      });
       */
    },
    data: function () {
      return {
        recent: {},
        date: new Date().toISOString().substr(0, 10),
      }
    },
    methods: {
      show(entry) {
        this.$router.push("entry/"+entry.uuid)
      },
      privacy_icon(privacy) {
        return "public"
      },
      get_license_icon(license) {
        return license_icon(this.$axios, license, this.$store);
      }
    }
  }
</script>

<style scoped>

</style>
