<template lang="pug">
  v-layout(row wrap justify-start)
    v-flex(row v-for="entry in entries"
      :key="entry.id" 
      xs12 lg6)
      //- TODO: fill the card with the correct entry attributes
      v-card(class="previewCard")
        v-layout()
          v-flex(xs6)
            v-img(
              src="http://c1.peakpx.com/wallpaper/704/532/870/vegetables-fresh-food-tomato-red-wallpaper-preview.jpg"
              height="auto"
              width="auto"
              alt="cover-image")
          v-flex(xs6) 
            v-card-text(class="pa-0 text-sm-right")
              p(class="text-xs-right ma-0 pa-0 pr-2 pt-1") {{date}}
            v-card-title(primary-title)
              div(class="title") {{entry.title}}
            v-card-text(class="pt-0")
              v-icon(
                large
                left) {{privacy_icon(entry.privacy)}}
              span(class="font-weight-light") {{entry.license}}
        v-layout()
          v-flex(xs12)
            v-card-actions(class="pb-3")
              v-chip(outlined color="green darken-3") {{entry.software_version}}
              v-chip(outlined color="green darken-3") {{entry.type_slug}}
              v-chip(outlined color="green darken-3") {{entry.status}}
        
            v-divider(light) 

            v-card-actions(class="pa-3")
              v-spacer
              div(class="text-xs-right")
                v-btn(outlined class="ma-2" color="grey darken-1" @click="show(entry)") Details
                v-btn(outlined class="ma-2" color="grey darken-1" @click="show(entry)") Edit
                v-btn(outlined class="ma-2" color="grey darken-1") Download
</template>

<script>
  import {CREATOR, entry_actor_relation, license_icon, privacy_icon} from "../lib/client"
  import EntryNavMixin from "./EntryNavMixin";

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
        if(this.$store.getters["entries/has_entry"](entry.uuid))
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

