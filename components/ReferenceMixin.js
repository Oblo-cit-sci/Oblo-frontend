export default {
  created() {
    // mixin create comes before the component create, btw. or does it depend on the order of the mixin array and create fct?
    // check if the query has ref_draft_id or ref_uuid
    if (this.$route.query.hasOwnProperty("ref_draft_id")) {
      this.ref = {
        type: "draft",
        entryType: this.$store.state.drafts[this.$route.query.ref_draft_id].slug,
        draft_id: this.$route.query.ref_draft_id
      }
    } else if (this.$route.query.hasOwnProperty("ref_uuid")) {
      // TODO
    }
  },
  data() {
    return {
      ref: null, // reference to a parent entry (draft or uuid) see "created"
    }
  }
}
