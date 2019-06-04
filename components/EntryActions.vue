<template lang="pug">
  div
    Paginate(v-if="has_pages" v-bind:page.sync="i_page"
      :total="entry_type.content.meta.pages.length"
      v-on:lastpage="last_page = $event")
    span(v-if="view")
      v-btn(color="secondary" @click="edit") edit
    span(v-else)
      v-btn(color="seconday" @click="cancel") cancel

      span(v-if="!init")
        v-btn(v-if="!private_local" color="warning" @click="delete_draft") delete draft
        v-btn(v-else color="warning" @click="delete_draft") delete

      v-btn(v-if="!private_local" color="secondary" @click="save_draft()") save draft
      v-btn(v-else color="success" @click="save") save

      v-btn(v-if="!private_local" color="success" @click="submit" :disable="connected") submit
      v-btn(v-if="private_local"  :href="dl_url" :download="download_title" :disabled="disable_download" color="success" ) download

</template>

<script>


  import {CONTEXT_ENTRY, CREATE, DRAFT, EDIT, PRIVATE_LOCAL, PUBLIC, VIEW} from "../lib/consts";
  import Paginate from "./Paginate";
  import {delete_draft, save_draft, save_entry} from "../lib/entry";
  import {complete_activities} from "../lib/client";

  export default {
    name: "EntryActions",
    components: {Paginate},
    props: {
      mode: {
        type: String // view, create edit
      },
      entry_type: { // TODO maybe doesnt need to be the full thing
        type: Object
      },
      page: {
        type: Number
      },
      entry: {
        type: Object
      }
    },
    computed: {
      view() {
        return this.mode === VIEW
      },
      create() {
        return this.mode === CREATE
      },
      init() {
        return this.entry.version === 0
      },
      draft_edit() {
        return this.mode === EDIT && this.entry.status === DRAFT
      },
      private_local() {
        return (this.entry_type.content.meta.privacy || PUBLIC) === PRIVATE_LOCAL
      },
      connected() {
        return this.$store.state.connected
      },
      has_pages() { // todo duplicate
        return this.entry_type.content.meta.hasOwnProperty("pages")
      },
      dl_url() {
        return "data:text/jsoncharset=utf-8," + encodeURIComponent(JSON.stringify(this.entry.aspects_values))
      },
      download_title() {
        // TODO WHAT?
        return (this.entry.aspects_values.title || this.entry.type_slug + " " + this.entry.entry_id).replace(" ", "_") + ".json"
      },
      disable_download() {
        return this.has_pages && !this.last_page
      }
    },
    data() {
      return {
        i_page: 0,
        last_page: false
      }
    },
    methods: {
      // BUTTONS
      edit() {
        // for in mode = view
      },
      cancel() {
        if(this.init) {
          this.delete_draft()
        } else {
          this.back()
        }
      },
      delete_draft() {
        delete_draft(this.$store, this.entry)
        this.$store.commit("set_snackbar", {message: "Draft deleted", ok: true})
        this.back()
      },
      save_draft() {
        save_draft(this.$store, this.entry, true)
        this.$store.commit("set_snackbar", {message: "Draft saved", ok: true})
        this.back()
      },
      save() {
        // todo not if it is an aspect page
        save_entry(this.$store, this.entry)

        if(this.entry.ref){
          let ref = this.entry.ref
          if (ref.hasOwnProperty("draft_id")) {
            // TODO, here we actually need to know if we are in a AspectPage or ContextEntry
            if (ref.aspect_name) {
              let data = {
                draft_id: ref.draft_id,
                aspect_name: ref.aspect_name,
                value: {
                  type: CONTEXT_ENTRY,
                  draft_id: this.entry.entry_id
                }
              };
              if (ref.hasOwnProperty("index")) {
                data.index = ref.index;
              }
              this.$store.commit("edrafts/set_draft_aspect_value", data);
            }
            // TODO this would break for aspect-pages
            // well AspectPage dont really have any query params,
          }
        }
        //
        this.back()
      },
      submit() {
        // todo
        this.back()
      },
      back() {
          if(this.entry.ref) {
            // draft or entry....
            this.$router.push("/create/" + this.entry.ref.type_slug + "/" + this.entry.ref.draft_id)
          } else {
            this.$router.push("/")
          }
      }
    },
    watch: {
      i_page(val) {
        this.$emit("update:page", val)
      }
    }
  }
</script>

<style scoped>

</style>
