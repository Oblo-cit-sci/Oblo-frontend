<template lang="pug">
  div
    v-list(two-line subheader)
      v-list-tile(v-for="entry in entries"
        :key="entry.id"
        @click="show(entry)")
        v-list-tile-avatar
          v-icon {{privacy_icon(entry.privacy)}}
        v-list-tile-content
          v-list-tile-title {{creator(entry)}}
          v-list-tile-sub-title {{entry.title}}
        v-list-tile-action
          v-img.license-image(:src="get_license_icon(entry.license)")
      v-divider
</template>

<script>
  import {CREATOR, entry_actor_relation, license_icon} from "../lib/client"
  import {current_user_is_owner} from "../lib/entry";
  import EntryNavMixin from "./EntryNavMixin";

  export default {
    name: "Entrylist",
    props: {
      entries: Array
    },
    mixins: [EntryNavMixin],
    created() {
    },
    data: function () {
      return {
        recent: {},
        date: new Date().toISOString().substr(0, 10)
      }
    },
    methods: {
      show(entry) {
        if(this.$store.getters["entries/has_entry"](entry.uuid))
          this.$router.push("/entry/" + entry.uuid)
        else
          this.fetch_and_nav(entry.uuid)
      },
      privacy_icon(privacy) {
        return "public"
      },
      get_license_icon(license) {
        return license_icon(this.$axios, license, this.$store);
      },
      creator(entry) {
        //console.log("en list. creator", entry)
        const public_name = entry.actors.creator.public_name
        let relation = entry_actor_relation(entry, this.$store.getters.user)
        if (relation === CREATOR.key)
          return "Your Entry"
        return public_name
      }
    }
  }
</script>

<style scoped>

  .catListItem {
    background: lightgrey;
  }

  .license-image {
    width: 20px;
    overflow: visible;
  }
</style>
