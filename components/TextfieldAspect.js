import {EDIT} from "~/lib/consts";

export default {
  name: "TexfieldAspect",
  data() {
    return {
      hideDetails: true,
    }
  },
  created() {

  },
  computed: {
    clearIcon() {
      //console.log("AspMix - ", this.aspect.name, this.aspect.type, this.extra)
      return ((this.extra.listitem && this.mode === EDIT) || false) ? "mdi-close" : undefined //this.extra
    },
  },
  methods: {
  }
}

