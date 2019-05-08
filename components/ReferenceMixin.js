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
  },
  methods: {
    save_back() {
      // this is for context entries
      // this.save();
      // TODO
      this.$store.commit("set_aspect_value", this.ref.draft_id, null, null);
      this.back_to_ref()
    },
    back_to_ref() {
      if(this.ref.type === "draft") {
        this.$router.push({path: "/create/" + this.ref.entryType, query: {draft_id: this.ref.draft_id}})
      }
    }
  }
}
