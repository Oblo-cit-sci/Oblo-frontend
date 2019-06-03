<template lang="pug">
  div
    Paginate(v-if="has_pages" v-bind:page.sync="i_page"
      :total="entry_type.content.meta.pages.length"
      v-on:lastpage="last_page = $event")
    span(v-if="view")
      v-btn(color="secondary" @click="edit") edit
    span(else)
      v-btn(color="seconday" @click="cancel") cancel

      v-btn(v-if="draft_edit" color="warning" @click="delete_draft") delete draft


      v-btn(color="secondary" @click="save_draft()") save draft

      v-btn(v-if="private_local" color="success" @click="save") save
      span(v-else)
        v-btn(v-if="connected" color="success" @click="submit") submit
      v-btn(v-if="private_local"  :href="dl_url" :download="download_title" :disabled="!last_page" color="success" ) download
</template>

<script>

  /*
      div(v-if="!ref")
        v-btn(@click="cancel_draft" color="error") cancel
        v-btn(color="secondary" @click="save($event,'/')") save draft
        v-btn(v-if="can_submit" v-bind:disabled="!complete" color="success" :loading="sending" @click="send") submit
        v-btn(:href="dl_url" :download="download_title" v-if="can_download" :disabled="!last_page" color="success" ) Download
      div(v-else)
        div License and Privacy are the same as the reference/parent entry
      div(v-if="ref")
        v-btn(color="secondary" @click="save_back") save & back
  */

  /*
    drafts:
      - cancel
      - delete draft (after version 0)
      - save (for private local or offline)
      - submit (other)
      : if has_pages
        - next, prev

     entries:
      view:
        - edit
      edit:
        - cancel
        - delete entry
        - save (pricate local or offline)
        - submit (other)


create:
	= version: 0
	= status: draft

	! cancel

	! save
	  private-local?
	    save-entry
    else
      offline?
        save draft
  not private-local? offline?
    ! submit

edit:
	status = draft?
    version > 0:
      ! delete draft
  not private local? offline?
    ! delete entry

   */


  import {CREATE, DRAFT, EDIT, PRIVATE_LOCAL, PUBLIC, VIEW} from "../lib/consts";
  import Paginate from "./Paginate";
  import {draft_title} from "../lib/entry";
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
      draft() {

      },
      draft_edit() {
        return this.mode === EDIT && this.entry.status === DRAFT
      },
      for_submit() { // or private local
        return (this.entry_type.content.meta.privacy || PUBLIC) !== PRIVATE_LOCAL
      },
      private_local() {
        return (this.entry_type.content.meta.privacy || PUBLIC) === PRIVATE_LOCAL
      },
      connected() {
        return this.$store.state.connected
      },
      has_pages() {
        return this.entry_type.content.meta.hasOwnProperty("pages")
      },
      dl_url() {
        return "data:text/jsoncharset=utf-8," + encodeURIComponent(JSON.stringify(this.entry.aspects_values))
      },
      download_title() {
        // TODO WHAT?
        return (this.entry.aspects_values.title || "Survey " + this.entry.entry_id).replace(" ", "_") + ".json"
      },
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
        console.log(this.create, this.entry.version)
        if(this.create && this.entry.version === 0) {
          this.$store.commit("edrafts/remove_draft", this.entry.entry_id);
        }
        this.$router.push("/");
      },
      delete_draft() {
        this.$store.commit("edrafts/remove_draft", this.entry.entry_id);
        this.$router.push("/");
        // TODO test later if that is ok, not calling the commit twice
        //this.cancel()
      },
      save_draft(goto) {
        this.autosave(true)
        this.$store.commit("set_snackbar", {message: "Draft saved", ok: true})
        this.$router.push("/")
      },
      save() {

      },
      submit() {

      },
      // HELPER
      autosave(version_increase = false){
        if(version_increase) {
          this.entry.version = this.entry.version + 1;
        }
        this.$store.commit("edrafts/save_draft",  this.entry)
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
