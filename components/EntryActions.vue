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
      v-btn(v-if="!private_local && !in_context && !view" color="warning" @click="show_delete") delete draft
      v-btn(v-else color="warning" :disabled="true" @click="show_delete") delete

      v-btn(color="success" @click="save") {{save_word}}
      v-btn(
        v-if="!private_local && !view && !in_context"
        color="success"
        @click="submit"
        :disabled="!connected"
        :loading="sending") {{submitted ? 'update' : 'submit'}}
      // v-if="private_local" todo for now, download for everyone
      v-btn(:disabled="disable_download"  @click="download") download
    DecisionDialog(v-bind="remove_dialog_data" :open.sync="show_remove" v-on:action="delete_entry")
</template>

<script>


  import {CONTEXT_ENTRY, DRAFT, GLOBAL, PRIVATE_LOCAL, PUBLIC, SUBMITTED, VIEW} from "../lib/consts";
  import Paginate from "./Paginate";
  import {current_user_is_owner, delete_entry, aspect_loc_str, get_edit_route_for_ref, save_entry} from "../lib/entry";

  import {export_data} from "../lib/client";
  import DecisionDialog from "./DecisionDialog";
  import EntryNavMixin from "./EntryNavMixin";

  export default {
    name: "EntryActions",
    components: {DecisionDialog, Paginate},
    mixins: [EntryNavMixin],
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
      submit() {
        //console.log("entryAction submit")
        // todo bring back in after testing
        //this.sending = true
        // would be the same as checking submitted
        if (this.entry.status === DRAFT) {
          const all_entries = this.$_.concat([this.entry], this.$store.getters["entries/get_children"](this.entry))
          this.$axios.post("/create_entry", all_entries).then((res) => {
            this.sending = false
            this.$store.commit("set_snackbar", {message: res.data.msg, ok: res.data.status})
            this.entry.status = SUBMITTED
            save_entry(this.$store, this.entry)
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
      lastpage_reached($event) {
        console.log("en action lastpage_reached", $event)
      },
      back() {
        this.to_parent()
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
