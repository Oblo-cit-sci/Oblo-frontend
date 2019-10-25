<template lang="pug">
  v-card(class="mx-auto custom-card" outlined)
    v-row(class="ma-2")
      v-col(cols="12" class="col-md-8 col-sm-12 entry-meta")
        div.caption {{entry_date}}
        p.title.mb-2 {{typename}}:
          span.title &nbsp; {{entry.title}}
          
        MetaChips(:meta_aspects="meta_aspects")
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
      Taglist

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
    import {CREATOR, entry_actor_relation} from "../lib/actors"
    import {privacy_icon, printDate} from "../lib/util"
    import {EDIT} from "../lib/consts"
    import MetaChips from "../components/MetaChips"
    import Taglist from "../components/Taglist"
    import {get_proper_mode} from "../lib/entry"

    export default {
        name: "Entrypreview",
        components: {MetaChips, Taglist},
        props: {
            entry: {type: Object, required: true}
        },
        mixins: [EntryNavMixin],
        created() {
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
              return(get_proper_mode(this.$store, this.entry))
            },
            to_download() {
                return false
            },
            goto_text() {
                // assuming, we call it edit and view
                return this.proper_mode
            },
            show_image() {
              if(this.entry.image) {
                return true
              } else {
                return false
              }
            },
            show_tags() {
                return true
            },
            meta_aspects() {
                let result = []
                result.push({icon: privacy_icon(this.entry.privacy), name: this.entry.privacy})
                result.push({name: "License: "+ this.entry.license})
                return result
            },
            typename() {
                return this.$store.getters["get_type_name"](this.entry.type_slug)
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

