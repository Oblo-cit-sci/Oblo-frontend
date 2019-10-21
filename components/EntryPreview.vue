<template lang="pug">
  v-card(class="mx-auto custom-card" outlined)
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
      v-col(v-if="show_image" cols="12" class="col-md-4 col-sm-12 entry-image")
        div(class="float-md-right float-sm-left entry-display-size")
          v-avatar(
            v-if="entry.image"
            tile
            color="grey"
            class="entry-image-size")
            v-img(
              src="https://article.images.consumerreports.org/f_auto/prod/content/dam/CRO%20Images%202018/Health/June/CR-Health-InlineHero-Foods-That-Are-Healthier-Cooked-09-17"
              alt="item")
    v-row(v-if="show_tags" class="ma-2")
      div(class="ml-4 mb-2")
        span(class="pr-4 text-truncate caption") # {{entry.type_slug}}
        span(class="pr-4 text-truncate caption") # {{entry.status}}

    v-divider(light)

    v-card-actions
      div
        v-btn(small text outlined @click="goto(entry)") {{goto_text}}
        v-btn(small text outlined v-if="to_download") Download
</template>

<script>
    import {license_icon} from "../lib/client"
    import EntryNavMixin from "./EntryNavMixin";
    import {ENTRIES_HAS_ENTRY, ENTRIES_USER_RIGHTS} from "../lib/store_consts";
    import {CREATOR, entry_actor_relation} from "../lib/actors";
    import {privacy_icon, printDate} from "../lib/util";
    import {EDIT} from "../lib/consts";

    export default {
        name: "Entrypreview",
        props: {
            entry: {type: Object, required: true}
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
            goto(entry) {
                if (this.$store.getters[ENTRIES_HAS_ENTRY](entry.uuid))
                    this.to_entry(entry.uuid, this.proper_mode)
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
            },
            proper_mode() {
                return this.$store.getters["entries/get_proper_mode"](this.entry.uuid)
            },
            to_download() {
                return false
            },
            goto_text() {
                // assuming, we call it edit and view
                return this.proper_mode
            },
            show_image() {
                return true
            },
            show_tags() {
                return true
            }
        }
    }
</script>

<style scoped>

  .custom-card {
    height: 100%
  }
  
  .entry-display-size {
    width: 100%;
  }

  .entry-image-size {
    width: 100% !important;
    height: auto !important;
  }

  @media (max-width: 959px) {
    /* adjust to your needs */
    .entry-meta {
      order: 1
    }

    .entry-image {
      order: -1;
      width: 50px;
    }
  }
</style>

