<template lang="pug">
  div
    v-divider(class="wide_divider")
    Paginate(
      v-if="has_pages"
      :page="page"
      @update:page="update_page($event)"
      :total="entry_type.content.meta.pages.length"
      :named_pages="named_pages"
      :entry="entry"
      :pages="entry_type.content.meta.pages"
      @lastpage="more_follow_page = ($event)")
      // todo this can come back
    span(v-if="can_edit")
      span(v-if="view && can_edit")
        v-btn(color="secondary" @click="edit") edit
      span(v-else-if="can_edit")
        v-btn(color="warning" @click="show_delete") delete
        v-btn( color="success" @click="save") {{save_word}}
        v-btn(
          v-if="!private_local && !view && !in_context"
          color="success"
          @click="submit"
          :disabled="!connected"
          :loading="sending") {{submitted ? 'update' : 'submit'}}
        v-btn(v-if="upload_option" @click="upload_to_repo") Upload to the repo
          v-icon.ml-2 mdi-send-circle
      // v-if="private_local" todo for now, download for everyone
      v-btn(v-if="can_download" :disabled="disable_download"  @click="download") download
        v-icon.ml-2 mdi-download
    span(v-else)
      v-btn(@click="back") back
    DecisionDialog(v-bind="dialog_data" :open.sync="dialog_visible" v-on:action="dialog_action($event)")
</template>

<script>


  import {
    DRAFT, EDIT, LICCI_PARTNERS,
    PRIVATE_LOCAL,
    PUBLIC,
    SUBMITTED,
    VIEW
  } from "../lib/consts";
  import Paginate from "./Paginate";
  import {current_user_is_owner, has_pages} from "../lib/entry";

  import DecisionDialog from "./DecisionDialog";
  import EntryNavMixin from "./EntryNavMixin";

  import axios from "axios"
  import {
    ENTRIES_DELETE_ENTRY,
    ENTRIES_GET_CHILDREN,
    ENTRIES_GET_RECURSIVE_ENTRIES, ENTRIES_SAVE_ENTRY,
    ENTRIES_SET_EDIT_CLEAN
  } from "../lib/store_consts";
  import TriggerSnackbarMixin from "./TriggerSnackbarMixin";
  import {CREATOR, entry_actor_relation} from "../lib/actors";
  import {get_release_mode} from "../lib/util";
  import EntryMixin from "./EntryMixin";
  import PersistentStorageMixin from "./PersistentStorageMixin";
  import {upload} from "../lib/client";

  export default {
    name: "EntryActions",
    components: {DecisionDialog, Paginate},
    mixins: [EntryNavMixin, TriggerSnackbarMixin, EntryMixin, PersistentStorageMixin],
    props: {
      mode: {
        type: String // view, create edit
      },
      entry: {
        type: Object
      },
    },
    data() {
      return {
        NOT_TRAINING: false,
        dialog_visible: false,
        delete_dialog_data: {
          id: "delete",
          title: "Delete entry",
          text: "Are you sure you want to delete this entry?",
          cancel_color: "",
          confirm_color: "error",
          confirm_text: "delete"
        },
        cancel_dialog_data: {
          id: "cancel",
          title: "Dismiss changes",
          text: "Are you sure you want to dismiss your changes?",
          cancel_color: "",
          confirm_color: "error",
          cancel_text: "keep on editing",
          confirm_text: "dismiss"
        },
        dialog_data: {id: "none"},
        sending: false
      }
    },
    methods: {
      update_page(page) {
        this.page = page
        this.$emit('update:page', page)
      },
      edit() {
        this.$emit(EDIT)
      },
      // BUTTONS
      upload_to_repo() {
        const url = this.entry_type.content.activities.upload.url
        const user_key = this.$store.getters.user_key
        if (!user_key) {
          this.error_snackbar("No user key. Go to the settings and paste the user key given by the LICCI core team")
          return
        }
        const entries = this.$store.getters[ENTRIES_GET_RECURSIVE_ENTRIES](this.entry.uuid)
        let export_data = {entries: entries, user_key: user_key}
        //console.log(url, user_key, export_data)
        upload(this.$axios, url, export_data).then(res => {
          this.snackbar(res.data.status, res.data.msg)
        }).catch(err => {
          console.log(err)
          this.error_snackbar("Something went horribly wrong")
        })
      },
      show_cancel() {
        if (this.dirty) {
          this.show_dialog(this.cancel_dialog_data)
        } else {
          this.cancel_edit()
        }
      },
      show_delete() {
        this.show_dialog(this.delete_dialog_data)
      },
      show_dialog(dialog_data) {
        this.dialog_data = dialog_data
        this.dialog_visible = true
      },
      dialog_action(event) {
        if (event.confirm) {
          if (event.id === this.cancel_dialog_data.id) {
            if (this.entry.version === 0) {
              this.delete_entry()
            }
            this.back()
          } else if (event.id === this.delete_dialog_data.id) {
            this.delete_entry()
          }
        }
      },
      cancel_edit() {
        if (this.entry.version === 0) {
          this.$store.dispatch(ENTRIES_DELETE_ENTRY, this.entry.uuid)
          this.ok_snackbar("Creation canceled")
          this.back()
        }
      },
      delete_entry() {
        this.$store.dispatch(ENTRIES_DELETE_ENTRY, this.entry.uuid)
        this.ok_snackbar("Entry deleted")
        this.$emit("entryAction", "delete")
        this.back()
      },
      save() {
        // todo not if it is an aspect page
        //save_entry(this.$store, this.entry)
        this.$store.dispatch(ENTRIES_SAVE_ENTRY)
        this.persist_entries()
        this.ok_snackbar("Entry saved")
        this.back()
      },
      submit() {
        //console.log("entryAction submit")
        this.sending = true
        // would be the same as checking submitted
        if (this.entry.status === DRAFT) {
          const all_entries = this.$_.concat([this.entry], this.$store.getters[ENTRIES_GET_CHILDREN](this.entry))
          this.$axios.post("/create_entry", all_entries).then((res) => {
            this.sending = false
            this.snackbar(res.data.status, res.data.msg)
            this.entry.status = SUBMITTED
            this.$store.dispatch(ENTRIES_SAVE_ENTRY)
            this.back()
          }).catch((err) => {
            console.log("error", err)
          })
        } else {
          this.error_snackbar("not yet implemented")
        }
        this.sending = false
      },
      /*download_data() {
        return {
          entry: this.entry,
          name: this.entry_type.slug,
          version: this.entry_type.version,
          language: this.entry_type.language
        }*/
      lastpage_reached($event) {
        console.log("en action lastpage_reached", $event)
      },
      back() {
        //this.$emit("update:dirty", false)
        this.$store.commit(ENTRIES_SET_EDIT_CLEAN, this.entry.uuid)
        this.$router.back()
      }
    },
    computed: {
      view() {
        return this.mode === VIEW
      },
      dirty() {
        return this.entry.local.dirty
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
      has_pages() {
        return has_pages(this.entry_type)
      },
      disable_download() {
        return false; // this.has_pages && !this.last_page
      },
      owner() {
        console.log(current_user_is_owner(this.$store, this.entry))
        return current_user_is_owner(this.$store, this.entry)
      },
      save_word() {
        // todo
        if (this.in_context) {
          return "save and back"
        } else if (this.private_local) {
          return "save"
        } else {
          return "save draft"
        }
      },
      can_edit() {
        if (get_release_mode(this.$store) === LICCI_PARTNERS)
          return true
        let relation = entry_actor_relation(this.entry, this.$store.getters.user)
        return relation === CREATOR.key
      },
      upload_option() {
        return this.entry_type.content.activities.hasOwnProperty("upload")
      },
      initial_version() {
        return this.entry.version === 0
      },
      can_download() {
        //console.log(this.entry_type.content.meta.download)
        return get_release_mode(this.$store) === LICCI_PARTNERS && this.entry_type.content.meta.download
      }
    }
  }

</script>
