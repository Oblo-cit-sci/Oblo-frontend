<template lang="pug">
      v-card(
        class="mx-auto"
        outlined)
        v-row(class="ma-2")
          v-col(cols="12" class="col-md-8 col-sm-12 entry-meta")
            div(class="overline") {{entry_date}}
            p(class="headline mb-4") {{entry.title}}
            div
              v-chip(v-if="entry.actors.creator.public_name" 
              :ripple="false" 
              small 
              class="mr-2 mb-2"
              label) 
                v-avatar(left) 
                  v-icon(small class="fa fa-user")
                p(class="ma-0" ) {{entry.actors.creator.public_name}}
              v-chip(v-if="entry.actors.location" 
              :ripple="false" 
              small 
              class="mr-2 mb-2"
              label) 
                v-avatar(left) 
                  v-icon(small class="fa fa-map-marker")
                p(class="ma-0" ) {{entry.actors.location}}
              v-chip(v-if="entry.privacy" 
              :ripple="false" 
              small 
              class="mr-2 mb-2"
              label) 
                v-avatar(center) 
                  v-icon(
                    small) {{privacy_icon(entry.privacy)}}
              v-chip(v-if="entry.license" 
              :ripple="false" 
              small 
              class="mr-2 mb-2"
              label) {{entry.license}}
              v-chip(v-if="entry.license" 
              :ripple="false" 
              small
              label
              class="mr-2 mb-2") {{entry.type_slug}}
          v-col(cols="12" class="col-md-4 col-sm-12 entry-image")
            div(class="float-md-right float-sm-left entry-display-size")
              v-avatar(
                v-if="entry.image"
                tile
                color="grey"
                class="entry-image-size")
                v-img(
                  src="https://article.images.consumerreports.org/f_auto/prod/content/dam/CRO%20Images%202018/Health/June/CR-Health-InlineHero-Foods-That-Are-Healthier-Cooked-09-17"
                  alt="item")
        v-row(class="ma-2")
          div(class="ml-4 mb-2")
            span(class="pr-4 text-truncate caption") # {{entry.type_slug}}
            span(class="pr-4 text-truncate caption") # {{entry.status}}

        v-divider(light)

        v-card-actions
          div
            v-btn(small text outlined @click="show(entry)") Details
            v-btn(small text outlined @click="show(entry)") Edit
            v-btn(small text outlined) Download
</template>

<script>
  import {license_icon} from "../lib/client"
  import EntryNavMixin from "./EntryNavMixin";
  import {ENTRIES_HAS_ENTRY} from "../lib/store_consts";
  import {CREATOR, entry_actor_relation} from "../lib/actors";
  import {privacy_icon, printDate} from "../lib/util";

  export default {
    name: "Entrypreview",
    props: {
      entry: {}
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
    },
    computed: {
      entry_date() {
        return printDate(this.entry.creation_datetime)
      } 
    }
  }
</script>

<style scoped>
  .entry-display-size {
    width: 100%;
  }
  .entry-image-size {
    width: 100% !important;
    height: auto !important;
  }

  @media (max-width: 959px) { /* adjust to your needs */
    .entry-meta {
      order: 1
    }
    .entry-image {
      order: -1;
      width: 50px;
    }
  }
</style>

