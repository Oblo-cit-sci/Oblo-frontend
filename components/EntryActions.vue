<template lang="pug">
  div
    Paginate(v-if="has_pages" v-bind:page.sync="i_page"
      :total="entry_type.content.meta.pages.length"
      :page_select="entry_type.content.meta.pages"
      v-on:lastpage="last_page = ($event)")
    span(v-if="owner")
      span(v-if="view")
        v-btn(color="secondary" @click="edit") edit
      span(v-else)
        v-btn(color="seconday" @click="cancel") cancel

      // TODO for the training we just DISABLE, otherwise it would be: :disabled="init"
      v-btn(v-if="!private_local && !in_context" :disabled="true" color="warning" @click="show_delete") delete draft
      v-btn(v-else color="warning" :disabled="true" @click="show_delete") delete

      span(v-if="!submitted")
        v-btn(v-if="!private_local && !in_context" color="secondary" @click="save_draft") save draft
        v-btn(v-else color="success" @click="save") save

      v-btn(v-if="!private_local && !view && !in_context" color="success" @click="submit" :disable="connected" :loading="sending") {{submitted ? 'update' : 'submit'}}
      v-btn(v-if="private_local"  :href="dl_url" :download="download_title" :disabled="disable_download" color="success" @click="dl") download
    DecisionDialog(v-bind="remove_dialog_data" :open.sync="show_remove" v-on:action="delete_this")
</template>

<script>


  import {CONTEXT_ENTRY, CREATE, DRAFT, GLOBAL, PRIVATE_LOCAL, PUBLIC, VIEW} from "../lib/consts";
  import Paginate from "./Paginate";
  import {
    current_user_is_owner,
    delete_draft,
    delete_entry, fill_in_child_refs_for_sending,
    get_edit_route_for_ref, get_ref_entries,
    save_draft,
    save_entry
  } from "../lib/entry";

  import {complete_activities} from "../lib/client";
  import DecisionDialog from "./DecisionDialog";

  export default {
    name: "EntryActions",
    components: {DecisionDialog, Paginate},
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
      is_draft() {
        return this.entry.status === DRAFT
      },
      private_local() {
        return (this.entry_type.content.meta.privacy || PUBLIC) === PRIVATE_LOCAL
      },
      in_context() {
        console.log("Entry Action -  context? ", this.entry_type.content.meta)
        return this.entry_type.content.meta.context !== GLOBAL
      },
      connected() {
        return this.$store.state.connected
      },
      has_pages() { // todo duplicate
        return this.entry_type.content.meta.hasOwnProperty("pages")
      },
      dl_url() {
        if (this.private_local && (!this.has_pages || this.last_page))
          return "data:text/jsoncharset=utf-8," + encodeURIComponent(JSON.stringify({
            value: this.entry.aspects_values,
            template: {
              name: this.entry_type.slug,
              version: this.entry_type.version,
              language: this.entry_type.language
            }}))
        else
          return ""
      },
      download_title() {
        // TODO WHAT?
        return (this.entry.aspects_values.title.value || this.entry.type_slug + " " + this.entry.title).replace(" ", "_") + ".json"
      },
      disable_download() {
        return this.has_pages && !this.last_page
      },
      owner() {
        return current_user_is_owner(this.$store, this.entry)
      },
      submitted() {
        return this.entry.uuid !== undefined
      }
    },
    data() {
      return {
        i_page: 0,
        last_page: false,
        show_remove: false,
        remove_dialog_data: {
          id: "",
          title: "Delete entry",
          text: "Are you sure you want to delete this entry?"
        },
        sending: false
      }
    },
    methods: {
      // BUTTONS
      edit() {
        // for in mode = view
        const route = get_edit_route_for_ref(this.$store, this.entry)
        console.log(route)
        this.$router.push(route)
      },
      cancel() {
        if (this.init && !this.submitted) {
          this.delete_draft()
        } else {
          this.back()
        }
      },
      show_delete() {
        this.show_remove = true
      },
      delete_this() {
        // TODO make use of entry.delete_local_entry
        if (this.entry.status === DRAFT)
          this.delete_draft()
        else {
          this.delete_entry()
        }
      },
      delete_draft() {
        delete_draft(this.$store, this.entry)
        this.$store.commit("set_snackbar", {message: "Draft deleted", ok: true})
        // todo
        if (this.entry.ref) {

        }
        this.back()
      },
      delete_entry() {
        delete_entry(this.$store, this.entry)
        this.$store.commit("set_snackbar", {message: "Entry deleted", ok: true})
        if (this.entry.ref) {
          // or entry
          // todo
          //this.$store.commit("edrafts/set_draft_aspect_value", data);
        }
        this.back()
      },
      save_draft() {
        save_draft(this.$store, this.entry, true)
        this.add_entry_aspect()
        this.$store.commit("set_snackbar", {message: "Draft saved", ok: true})
        this.back()
      },
      save() {
        // todo not if it is an aspect page
        save_entry(this.$store, this.entry)
        this.add_entry_aspect()
        //
        this.back()
      },
      add_entry_aspect() {
        if (this.entry.ref) {
          let ref = this.entry.ref
          if (ref.hasOwnProperty("draft_id")) {
            // TODO, here we actually need to know if we are in a AspectPage or ContextEntry
            if (ref.aspect_name) {
              let data = {
                draft_id: ref.draft_id,
                aspect_name: ref.aspect_name,
                value: {
                  type: CONTEXT_ENTRY,
                  local_id: this.entry.local_id
                }
              };
              if (ref.hasOwnProperty("index")) {
                data.index = ref.index;
              }
              // todo or entry...
              this.$store.commit("edrafts/set_draft_aspect_value", data);
            }
            // TODO this would break for aspect-pages
            // well AspectPage dont really have any query params,
          }
        }
      },
      submit() {
        console.log("entryAction submit")
        // todo bring back in after testing
        //this.sending = true
        // would be the same as checking submitted
        if(this.entry.status === DRAFT) {

          let sending_entry = JSON.parse(JSON.stringify(this.entry))

          // todo before. try out to pack multiple entries into one send
          //sending_entry = fill_in_child_refs_for_sending(this.$store, sending_entry)
          const all_entries = this.$_.concat([this.entry], get_ref_entries(this.$store, this.entry.refs.children))

          console.log("ref entries", all_entries)
          //return
          //console.log("sending entry- ref update", sending_entry)

          this.$axios.post("/create_entry", all_entries).then((res) => {
            this.sending = false
            //console.log(res.data)
            this.$store.commit("set_snackbar", {message: res.data.msg, ok: res.data.status})

            // just call function
            //console.log(this.entry)
            save_entry(this.$store, this.entry)
            /*
            if (this.entry.hasOwnProperty("draft_id")) {
              delete_draft(this.$store, this.entry)

              //this.$store.commit("edrafts/remove_draft", this.draft_id)
              this.$store.commit("entries/save_entry", this.entry)
            }*/
            //this.back()
          }).catch((err) => {
            console.log("error", err)
          })
        } else {
          // todo
          console.log("updating entry")
          this.sending = false
          this.$store.commit("set_error_snackbar", "not yet implemented")
        }
      },
      dl() {
        // todo. again, abstract this away...
        if (this.entry.status === DRAFT) {
          this.$store.commit("edrafts/set_downloaded", this.entry.draft_id)
        } else { // private local
          this.$store.commit("entries/set_downloaded", this.entry.local_id)
        }
      },
      back() {
        if (this.entry.ref) {
          // draft or entry....
          this.$router.push("/create/" + this.entry.ref.type_slug + "/" + this.entry.ref.draft_id)
        } else {
          this.$router.push("/")
        }
      },
      lastpage_reached($event) {
        console.log("en action lastpage_reached", $event)
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
