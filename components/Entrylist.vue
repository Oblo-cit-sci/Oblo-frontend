<template lang="pug">
  v-layout(column)
    v-flex(xs12 md6 lg4 justify-center)
      v-list(three-line subheader dense)
        v-list-item(v-for="entry in entries"
          :key="entry.id"
          @click="show(entry)")
          v-list-item-avatar
            v-icon {{privacy_icon(entry.privacy)}}
          v-list-item-content
            v-list-item-title {{entry.title}}
            v-list-item-subtitle {{creator(entry)}}
            v-list-item-subtitle {{type_name(entry)}}
          v-list-item-action
            v-img.license-image(:src="get_license_icon(entry.license)")
      v-divider
</template>

<script>
    import {license_icon} from "../lib/client"
    import EntryNavMixin from "./EntryNavMixin";
    import {ENTRIES_HAS_ENTRY} from "../lib/store_consts"
    import {CREATOR, entry_actor_relation} from "../lib/actors";
    import {privacy_icon} from "../lib/util";

    export default {
        name: "Entrylist",
        props: {
            entries: Array,
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
                if (this.$store.getters[ENTRIES_HAS_ENTRY](entry.uuid))
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
                // todo this should be a getter. and eventually include a fetch,... never know...
                let entry_type = this.$store.getters.entry_type(entry.type_slug)
                if(entry_type) {
                  return entry_type.title
                }  else {
                  return entry.type_slug
                }
            }
        }
    }
</script>

<style scoped>

  .license-image {
    width: 60px;
    overflow: visible;
  }
</style>
