<template lang="pug">
  div
    Paginate(v-if="has_pages" v-bind:page.sync="i_page"
      :total="entry_type.content.meta.pages.length"
      :page_select="entry_type.content.meta.pages"
      v-on:lastpage="last_page = ($event)")
    v-divider(class="wide_divider")
    span(v-if="owner")
      span(v-if="view")
        v-btn(color="secondary" @click="edit") edit
      span(v-else)
        v-btn(color="seconday" @click="cancel") cancel

      // TODO for the training we just DISABLE, otherwise it would be: :disabled="init"
      v-btn(v-if="!private_local && !in_context && !view" :disabled="true" color="warning" @click="show_delete") delete draft
      v-btn(v-else color="warning" :disabled="true" @click="show_delete") delete

      v-btn(color="success" @click="save") {{save_word}}
      v-btn(
        v-if="!private_local && !view && !in_context"
        color="success"
        @click="submit"
        :disable="connected"
        :loading="sending") {{submitted ? 'update' : 'submit'}}
      // v-if="private_local" todo for now, download for everyone
      v-btn(:disabled="disable_download"  @click="download") download
    DecisionDialog(v-bind="remove_dialog_data" :open.sync="show_remove" v-on:action="delete_this")
</template>

<script>


  import {CONTEXT_ENTRY, DRAFT, GLOBAL, PRIVATE_LOCAL, PUBLIC, SUBMITTED, VIEW} from "../lib/consts";
  import Paginate from "./Paginate";
  import { current_user_is_owner, delete_entry, aspect_loc_str, get_edit_route_for_ref, save_entry } from "../lib/entry";

  import {export_data} from "../lib/client";
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
      is_draft() {
        return this.entry.status === DRAFT
      },
      submitted() {
        return this.entry.status === SUBMITTED
      },
      private_local() {
        return (this.entry_type.content.meta.privacy || PUBLIC) === PRIVATE_LOCAL
      },
      in_context() {
        return this.entry_type.content.meta.context !== GLOBAL
      },
      connected() {
        return this.$store.state.connected
      },
      has_pages() { // todo duplicate
        return this.entry_type.content.meta.hasOwnProperty("pages")
      },
      disable_download() {
        return this.has_pages && !this.last_page
      },
      owner() {
        return current_user_is_owner(this.$store, this.entry)
      },
      save_word() {
        if (this.in_context) {
          return "save and back"
        } else if (this.private_local) {
          return "save"
        } else {
          return "save draft"
        }
      }
    }
    ,
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
    }
    ,
    methods: {
      // BUTTONS
      edit() {
        // for in mode = view
        const route = get_edit_route_for_ref(this.$store, this.entry)
        console.log(route)
        this.$router.push(route)
      }
      ,
      cancel() {
        if (this.init && !this.submitted) {
          this.delete_draft()
        } else {
          this.back()
        }
      }
      ,
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
      /*delete_draft() {
        delete_draft(this.$store, this.entry)
        this.$store.commit("set_snackbar", {message: "Draft deleted", ok: true})
        // todo
        if (this.entry.ref) {

        }
        this.back()
      } , */
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
      save() {
        // todo not if it is an aspect page
        save_entry(this.$store, this.entry)
        //this.$store.commit("set_snackbar", {message: "Draft saved", ok: true})
        // let aspect_name = this.add_entry_aspect()
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
             // this.$store.commit("edrafts/set_draft_aspect_value", data);
            }
            // TODO this would break for aspect-pages
            // well AspectPage dont really have any query params,
          }
          return ref.aspect_name
        }
        return null
      },
      submit() {
        //console.log("entryAction submit")
        // todo bring back in after testing
        //this.sending = true
        // would be the same as checking submitted
        if (this.entry.status === DRAFT) {

          let sending_entry = JSON.parse(JSON.stringify(this.entry))

          // todo before. try out to pack multiple entries into one send
          //sending_entry = fill_in_child_refs_for_sending(this.$store, sending_entry)
          const all_entries = this.$_.concat([this.entry], this.$store.getter["entries/get_children"](this.entry))

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
            this.back()
          }).catch((err) => {
            console.log("error", err)
          })
        } else {
          // todo
          //console.log("updating entry")
          this.sending = false
          this.$store.commit("set_error_snackbar", "not yet implemented")
        }
      },
      download_data() {
        return {
          entry: this.entry,
          name: this.entry_type.slug,
          version: this.entry_type.version,
          language: this.entry_type.language
        }
      },
      download_title() {
        return (this.entry.type_slug + " " + this.entry.title).replace(" ", "_") + ".json"
      },
      download() {
        export_data(this.download_data(), this.download_title())
        this.$store.commit("entries/set_downloaded", this.entry.uuid)
      },
      back() {
        if (this.in_context) {
          const aspect_id = aspect_loc_str(this.entry.refs.parent.aspect_loc)
          this.$router.push("/entry/" + this.entry.refs.parent.uuid + (aspect_loc_str ? "?goTo=" + aspect_id : ""))
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
  .wide_divider {
    margin-top: 2%;
    margin-bottom: 2%;
  }
</style>
