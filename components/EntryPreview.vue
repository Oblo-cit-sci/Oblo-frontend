<template lang="pug">
  v-card(class="mx-auto custom-card" outlined)
    v-row(class="ma-2")
      v-col(class="entry-meta" cols=12 v-bind:class="[show_image ? 'col-md-10' : 'col-md-12']")
        div.caption(v-if="show_date") {{entry_date}}
        p.subtitle-1.mb-2 {{typename}}:
          span.subtitle-1 &nbsp; {{entry.title}}
          v-btn(v-if="show_title_action" @click="goto()" depressed small)
            v-icon(:class="default_action_icon")
        MetaChips(v-if="show_meta_aspects" :meta_aspects="meta_aspects")
        Taglist(v-if="show_tags" :tags="tags")
        .red--text(v-if="outdated")
          v-icon(color="red") mdi-alert-outline
          span Created from an outdated version. Some values might change. Download the entry if update does not work
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
    div(v-if="show_botton_actions")
      v-divider(light)
      v-card-actions
        div
          v-btn(small text outlined @click="goto(entry)") {{goto_text}}
          v-btn(small text outlined @click="goto_location" v-if="has_action_goto_location")
            v-icon mdi-map-marker
          v-btn(small text outlined v-if="to_download" @click="download()") Download
</template>

<script>

    import {app_version, license_icon} from "../lib/client"
    import EntryNavMixin from "./EntryNavMixin";
    import {ENTRIES_HAS_ENTRY, ENTRIES_USER_RIGHTS, TYPE_NAME} from "../lib/store_consts";
    import {privacy_icon, printDate, static_file_path} from "../lib/util"
    import {VIEW} from "../lib/consts"
    import MetaChips from "../components/MetaChips"
    import Taglist from "../components/Taglist"
    import {get_proper_mode} from "../lib/entry"
    import {CREATOR, entry_actor_relation} from "../lib/actors";
    import MapJumpMixin from "./MapJumpMixin";
    import EntryMixin from "./EntryMixin";

    export default {
        name: "Entrypreview",
        components: {MetaChips, Taglist},
        mixins: [EntryNavMixin, MapJumpMixin, EntryMixin],
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
              return get_proper_mode(this.$store, this.entry)
            },
            to_download() {
                return this.outdated
            },
            goto_text() {
                // assuming, we call it edit and view
                return this.proper_mode
            },
            creator() {
                const public_name = this.entry.actors.creator.public_name
                //console.log(public_name)
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
                return static_file_path(this.$store, 'images/entry_images/' + this.entry.image)
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

