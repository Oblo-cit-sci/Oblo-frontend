<template lang="pug">
  div
    div(v-if="view")
      v-btn(color="secondary" @click="edit") edit
    div(else)
      v-btn(color="seconday" @click="cancel") cancel
      v-btn(v-if="draft_edit" color="warning" @click="delete_draft") delete draft
      v-btn(v-if="draft")
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

  const VIEW = "view"
  const CREATE = "create"
  const EDIT = "edit"

  const DRAFT = "draft"

  export default {
    name: "EntryActions",
    props: {
      ref: {
        type: Object
      },
      mode: {
        type: String // view, create edit
      },
      entry_type: { // TODO maybe doesnt need to be the full thing
        type: Object
      },
      status: {
        type: String
      },
      data: {
        type: Object // should have version
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
      for_submit() {
        return true
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
      }
    }
  }
</script>

<style scoped>

</style>
