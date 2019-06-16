<template lang="pug">
  div
    v-list(two-line subheader)
      v-list-tile(v-for="entry in entries", :key="entry.id" @click="show(entry)")
        v-list-tile-avatar
          v-icon {{privacy_icon(entry.privacy)}}
        v-list-tile-content
          v-list-tile-title {{entry.creator}}
          v-list-tile-sub-title {{entry.title}}
        v-list-tile-action
          v-img(:src="get_license_icon(entry.license)" height="30px" width="100px" style="margin-left:20px")
      v-divider
</template>

<script>
  import { license_icon } from "../lib/client"
  import {current_user_is_owner, fetch_entry} from "../lib/entry";

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
        console.log(entry)
        if(entry.local_id){
          console.log("going to local entry")
          this.$router.push("entry/"+entry.local_id)
        } else {
          // todo this is bad... overall refactoring of the own_entries, timeline entry stuff.
          if(current_user_is_owner(this.$store, entry)) {
            // todo hacky shortcut
            console.log("hacky shortcut")
            console.log(entry.uuid)
            this.$router.push("/entry/"+entry.uuid)
          } else {
            console.log("fetching")
            fetch_entry(this.$store, this.$axios, entry.uuid).then(entry => {
              this.$router.push("/entry/"+entry.uuid)
            }).catch(res => {
              console.log(res)
              // todo ENH: could also be an error msg from the server
              this.$store.commit("set_error_snackbar", "Couldn't fetch entry")
            })
          }
        }
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
