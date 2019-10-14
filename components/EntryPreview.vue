<template lang="pug">
  v-row(wrap justify-start)
    v-col(v-for="entry in entries"
      :key="entry.id" class="col-lg-6 col-xs-12")
      v-card(
        class="mx-auto"
        outlined)

        v-list-item(three-line)
          v-list-item-avatar(
            tile
            size= "150"
            color="grey")
            v-img(
              src=""
              alt="item"
              aspect-ratio="1")
          v-list-item-content
            div(class="overline ma-0")
              p(class="ma-0 float-right") {{date}}
            v-list-item-title(class="headline mb-1") {{entry.title}}
            v-list-item-subtitle 
              p(class="mt-2 mb-0") {{entry.actors.creator.public_name}}
              p(class="mt-2 mb-0") location
              v-icon(
                small
                left class="mt-2 mb-0") {{privacy_icon(entry.privacy)}} 
              p(class="mt-2 mb-0 font-weight-light") {{entry.license}}
              p(class="mt-2") {{entry.type_slug}}   

        v-card-actions(class="pb-3")      
          v-chip-group(column)
            v-chip(outlined class="ma-2"
              small color="green darken-3") {{entry.software_version}}
            v-chip(outlined class="ma-2"
              small color="green darken-3") {{entry.type_slug}}
            v-chip(outlined class="ma-2"
              small color="green darken-3") {{entry.status}}
        
        v-divider(light) 

        v-card-actions
          v-btn(text outlined @click="show(entry)") Details
          v-btn(text outlined @click="show(entry)") Edit
          v-btn(text outlined) Download
</template>

<script>
  import {CREATOR, entry_actor_relation, license_icon, privacy_icon} from "../lib/client"
  import EntryNavMixin from "./EntryNavMixin";
  import {ENTRIES_HAS_ENTRY} from "../lib/store_consts";

  export default {
    name: "Entrypreview",
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
        if(this.$store.getters[ENTRIES_HAS_ENTRY](entry.uuid))
          this.$router.push("/entry/" + entry.uuid)
        else
          this.fetch_and_nav(entry.uuid)
      },
      privacy_icon(privacy) {
        return privacy_icon(privacy)
      },
      type_name(entry) {
        return this.$store.getters.entry_type(entry.type_slug).title
      }
    }
  }
</script>

<style scoped>
  .previewCard {
     margin-bottom: 16px;
  }
</style>

