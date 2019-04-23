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
          v-img(:src="license_icon(entry.license)" height="30px" width="100px" style="margin-left:20px")
      v-divider
</template>

<script>
  //import {recent_entries} from "../lib/common"

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
        somedate: false
      }
    },
    methods: {
      show() {

      },
      privacy_icon(privacy) {
        return "public"
      },
      license_icon(license) {
        if (this.$store.state.codes.hasOwnProperty("licenses")) {
          let license_data = this.$store.state.codes.licenses[license];
          if (license_data !== undefined) {
            return license_data.icon
          } else {
          }
        }
        else return "";
      }
    }
  }
</script>

<style scoped>

</style>
