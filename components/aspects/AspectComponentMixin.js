import {VIEW} from "~/lib/consts";

export default {
  name: "AspectComponentMixin",
  props: {
    value: {
      required: true
    },
    aspect: {
      type: Object,
      required: true
    },
    mode: { // todo well, this is gonna be messy
      type: String,
      default: VIEW
    },
    disabled: {
      type: Boolean,
      default: false
    },
    aspect_loc: { // when not passed on, it is somew kind of anonymous aspect, probably defined on that page (e.g. register)
      type: Array, // for composites and lists pass it down...
    },
    extra: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    readOnly() {
      return this.mode === VIEW
    },
  }
}
