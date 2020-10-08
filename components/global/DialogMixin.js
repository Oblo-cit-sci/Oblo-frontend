import LayoutMixin from "~/components/global/LayoutMixin";

export default {
  name: "DialogMixin",
  mixins: [LayoutMixin],
  props: {
    dialog_open: {
      type: Boolean,
      required: true
    },
    fix_width: Number,
  },
  computed: {
    width() {
      if (this.fix_width)
        return this.fix_width
      else
        return this.main_container_with
    }
  }
}
