<template lang="pug">
  div
    div -----------
    Paginate(v-if="has_pages" v-bind:page.sync="i_page"
      :total="entry_type.content.meta.pages.length"
      v-on:lastpage="last_page = $event")
    span(v-if="view")
      v-btn(color="secondary" @click="edit") edit
    span(else)
      v-btn(color="seconday" @click="cancel") cancel

      v-btn(v-if="draft_edit" color="warning" @click="delete_draft") delete draft

      v-btn(v-if="draft")

      v-btn(color="secondary" @click="save_draft()") save draft

      v-btn(v-if="private_local" color="success" @click="save") save
      span(v-else)
        v-btn(v-if="connected" color="success" @click="submit") submit
      v-btn(v-if="private_local"  :href="dl_url" :download="download_title" :disabled="!last_page" color="success" ) download
    div -----------
</template>

<script>

  /*
     License(v-bind:passedLicense.sync="license" v-if="has_license")
    Privacy(v-bind:selectedPrivacy.sync="privacy" v-if="has_privacy")
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

  export default {
    name: "EntryActions",
    components: {Paginate},
    props: {
      parent: {
        type: Object
      },
      mode: {
        type: String // view, create edit
      },
      entry_type: { // TODO maybe doesnt need to be the full thing
        type: Object
      },
      status: {
        type: String // DRAFT, STORED, SUBMIT
      },
      version: {
        type: Number
      },
      aspects_values: {
        type: Object// should have version
      },
      page: {
        type: Number
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
        return this.mode === EDIT && this.status === DRAFT
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
        return "data:text/jsoncharset=utf-8," + encodeURIComponent(JSON.stringify(this.aspects_values))
      },
      download_title() {
        // TODO WHAT?
        return (this.aspects_values.title || "Survey " + this.entry_id).replace(" ", "_") + ".json"
      },
    },
    data() {
      return {
        i_page: 0,
        last_page: false
      }
    },
    methods: {
      edit() {
        // for in mode = view
      },
      cancel() {
        this.$router.push("/");
      },
      delete_draft() {
        this.$store.commit("edrafts/remove_draft", this.entry_id);
        this.cancel()
      },
      save_draft() {

      },
      save() {

      },
      submit() {

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
