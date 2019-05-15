/*
  This is for pages that have a back to parent button
  normal create pages have it, since they can be context-entries

  but also aspect-pages
  ....

 */

import { CONTEXT_ENTRY } from "~~/lib/consts";

export default {
  created() {
    // mixin create comes before the component create, btw. or does it depend on the order of the mixin array and create fct?
    // check if the query has ref_draft_id or ref_uuid
    if (this.$route.query.hasOwnProperty("draft_id")) {
      const parent = this.$store.state.edrafts.drafts[this.$route.query.draft_id];
      this.ref = {
        type: "draft",
        type_slug: parent.type_slug,
        draft_id: this.$route.query.draft_id,
        parent_title: parent.title
      }
    } else if (this.$route.query.hasOwnProperty("entry_id")) {
      // TODO
      this.ref = {
        type: "entry",
        aspect_name: this.$route.query.aspect_name,
        parent_title: ""
      }
    }
    // This is certain
    if (this.$route.query.hasOwnProperty("index"))
      this.ref.index = this.$route.query.index;
    // TODO and key... in case of a dict
  }
  ,
  data() {
    return {
      ref: null, // reference to a parent entry (draft or uuid) see "created"
    }
  },
  methods: {
    save_back() {
      this.autosave();
      if(this.ref.type === "draft") {
        // TODO, here we actually need to know if we are in a AspectPage or ContextEntry
        // we use "aspect_name" cuz this must always be there
        let is_context_entry = this.$route.query.hasOwnProperty("aspect_name");
        //console.log("is_context_entry", is_context_entry);
        if(is_context_entry) {
          //let aspect_name = this.$route.query.param.aspect_name;
          let data = {
            draft_id: this.ref.draft_id,
            aspect_name: this.$route.query.aspect_name,
            value: {
              type: CONTEXT_ENTRY,
              draft_id: this.entry_id
            }
          };
          if(this.ref.hasOwnProperty("index")) {
            data.index = this.ref.index;
          }
          this.$store.commit("edrafts/set_draft_aspect_value", data);
        }
        // TODO this would break for aspect-pages
        // well AspectPage dont really have any query params,
      }
      this.back_to_ref()
    },
    back_to_ref() {
      if(this.ref.type === "draft") {
        this.$router.push("/create/" + this.ref.type_slug + "/" + this.ref.draft_id)
      }
    }
  },
}