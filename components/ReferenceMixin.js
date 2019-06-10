/*
  This is for pages that have a back to parent button
  normal create pages have it, since they can be context-entries

  but also aspect-pages
  ....

 */

import {CONTEXT_ENTRY} from "~~/lib/consts";

export default {

  methods: {
    save_back() {
      if (this.ref.hasOwnProperty("draft_id")) {
        // TODO, here we actually need to know if we are in a AspectPage or ContextEntry
        // we use "aspect_name" cuz this must always be there
        let is_context_entry = this.ref.aspect_name;
        //console.log("is_context_entry", is_context_entry);
        if (is_context_entry) {
          //let aspect_name = this.$route.query.param.aspect_name;
          let data = {
            draft_id: this.ref.draft_id,
            aspect_name: this.ref.aspect_name,
            value: {
              type: CONTEXT_ENTRY,
              draft_id: this.entry_id
            }
          };
          if (this.ref.hasOwnProperty("index")) {
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
      if (this.entry.ref.type === "draft") {
        this.$router.push("/create/" + this.entry.ref.type_slug + "/" + this.entry.ref.draft_id)
      }
    },
  }
}
