import {ASPECT, EDIT, ENTRY} from "~/lib/consts"

export default {
  name: "TemplateAccessMixin",
  methods: {
    aspect_from_location(aspect_loc) {
      let select = null
      for (let loc of aspect_loc) {

        const A_TYPE = loc[0]
        const A_VALUE = loc[1]

        const aspects_from_entry = (e) => this.$store.getters["templates/entry_type"](e.template.slug).aspects

        if (A_TYPE === EDIT) {
          //console.log(EDIT, entries_mod)
          const entry = this.$store.getters["entries/get_edit"]()
          select = aspects_from_entry(entry)
        } else if (A_TYPE === ENTRY) {
          const entry = this.$store.getters["entries/get_entry"](A_VALUE)
          select = aspects_from_entry(entry)
        } else if (A_TYPE === ASPECT) {
          select = this.$_.find(select, aspect => aspect.name === A_VALUE)
        } else {
          console.log("warning: TODO, getting aspect_description for", A_TYPE)
        }
      }

      return select
    }
  }
}
