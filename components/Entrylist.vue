<template lang="pug">
  v-layout(column)
    v-flex(xs12 md6 lg4 justify-center)
      v-list(three-line subheader dense)
        v-list-tile(v-for="entry in entries"
          :key="entry.id"
          @click="show(entry)")
          v-list-tile-avatar
            v-icon {{privacy_icon(entry.privacy)}}
          v-list-tile-content
            v-list-tile-title {{entry.title}}
            v-list-tile-sub-title {{creator(entry)}}
            v-list-tile-sub-title {{type_name(entry)}}
          v-list-tile-action
            v-img.license-image(:src="get_license_icon(entry.license)")
      v-divider
</template>

<script>
  import {CREATOR, entry_actor_relation, license_icon, privacy_icon} from "../lib/client"
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
        return privacy_icon(privacy)
      },
      get_license_icon(license) {
        let licence_svg = this.$store.state.codes.licenses[license].svg
        return license_icon(this.$router.options.base, this.$axios, licence_svg, this.$store);
      },
      creator(entry) {
        const public_name = entry.actors.creator.public_name
        let relation = entry_actor_relation(entry, this.$store.getters.user)
        if (relation === CREATOR.key)
          return "From yourself"
        return public_name
      },
      type_name(entry) {
        return this.$store.getters.entry_type(entry.type_slug).title
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
