<template lang="pug">
  v-card(class="mx-auto custom-card" outlined)
    v-row(class="ma-2")
      v-col(class="entry-meta" cols=12 v-bind:class="[show_image ? 'col-md-10' : 'col-md-12']")
        div.caption(v-if="show_date") {{entry_date}}
        p.title.mb-2 {{typename}}:
          span.title &nbsp; {{entry.title}}
          v-btn(v-if="show_title_action" @click="goto()" depressed small)
            v-icon(:class="default_action_icon")
        MetaChips(v-if="show_meta_aspects" :meta_aspects="meta_aspects")
        div.mt-2(v-if="show_tags")
          Taglist.ml-0
      v-col(v-if="show_image" cols=12 class="col-md-2 col-sm-12 entry-image")
        div(class="float-md-right float-sm-left entry-display-size")
          v-avatar(
            v-if="entry.image"
            tile
            class="entry-image-size")
            v-img(
              :src="entry_image"
              alt="item"
              contain)
    v-row(v-if="show_tags" class="ma-2")
      Taglist(v-if="tags" :tags="tags")

    div(v-if="show_botton_actions")
      v-divider(light)
      v-card-actions
        div
          v-btn(small text outlined @click="goto(entry)") {{goto_text}}
          v-btn(small text outlined @click="goto_location" v-if="has_action_goto_location")
            v-icon mdi-map-marker
          v-btn(small text outlined v-if="to_download") Download
</template>

<script>

    import {license_icon} from "../lib/client"
    import EntryNavMixin from "./EntryNavMixin";
    import {ENTRIES_HAS_ENTRY, ENTRIES_USER_RIGHTS, TYPE_NAME} from "../lib/store_consts";
    import {privacy_icon, printDate, static_file_path} from "../lib/util"
    import {VIEW} from "../lib/consts"
    import MetaChips from "../components/MetaChips"
    import Taglist from "../components/Taglist"
    import {get_proper_mode} from "../lib/entry"
    import {CREATOR, entry_actor_relation} from "../lib/actors";

    export default {
        name: "Entrypreview",
        components: {MetaChips, Taglist},
        props: {
            entry: {type: Object, required: true},
            show_date: {
              type: Boolean,
              default: true
            },
            show_meta_aspects: {
                type: Boolean,
                default: true
            },
            show_botton_actions: {
                type: Boolean,
                default: true
            },
            include_domain_tag: Boolean,
            show_title_action: Boolean,
            actions: {
                type: Array,
                default: () => []
            }
        },
        mixins: [EntryNavMixin],
        methods: {
            goto() {
                const uuid = this.entry.uuid
                if (this.$store.getters[ENTRIES_HAS_ENTRY](uuid))
                    this.to_entry(uuid, this.proper_mode)
                else
                    this.fetch_and_nav(uuid)
            },
            privacy_icon(privacy) {
                return privacy_icon(privacy)
            },
            type_name(entry) {
                return this.$store.getters.entry_type(entry.type_slug).title
            },
            goto_location() {
                if(this.entry.location){
                    this.$store.commit("map/goto_location", this.entry.location[0])
                }
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
            creator() {
                const public_name = this.entry.actors.creator.public_name
                console.log(public_name)
                let relation = entry_actor_relation(this.entry, this.$store.getters.user)
                if (relation === CREATOR.key)
                    return "From yourself"
                return public_name
            },
            show_image() {
              return this.entry.image
            },
            show_tags() {
                return true
            },
            meta_aspects() {
                let result = []
                result.push({icon: privacy_icon(this.entry.privacy), name: this.entry.privacy})
                result.push({name: "License: "+ this.entry.license})
                if(this.include_domain_tag){
                    result.push({name: this.$store.getters["entries/domain"](this.entry.uuid)})
                }
                return result
            },
            typename() {
                return this.$store.getters[TYPE_NAME](this.entry.type_slug)
            },
            default_action_icon() {
                if(this.proper_mode === VIEW)
                    return "fa fa-angle-right"
                else
                    return "fa fa-edit"
            },
            entry_image() {
                return static_file_path(this.$store, '/images/entry_images/' + this.entry.image)
            },
            has_action_goto_location() {
                return this.entry.location && this.actions.includes('goto_location')
            },
            tags() {
              return this.entry.tags || null
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
      max-width: 200px;
    }
  }

</style>

