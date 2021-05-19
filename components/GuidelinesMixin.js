import {BUS_DIALOG_OPEN} from "~/plugins/bus";

export default {
  name: "GuidelinesMixin",
  data() {
    return {
      current_guideline: null
    }
  },
  computed: {
    guidelines() {
      return this.$store.getters["domain/act_lang_domain_data"].guidelines || {}
    },
    has_guideline_for_page() {
      return this.guidelines.hasOwnProperty(this.$route.name)
    }
  },
  methods: {
    show_guidelines(guideline_name = "welcome") {
      if (this.has_guideline_for_page &&
        !this.$store.getters["guidelines/is_guideline_closed"](`${this.$route.name}.${guideline_name}`)) {
        // console.log(this.get_page_guidelines_as_dialog_data("welcome"))
        this.$bus.$emit(BUS_DIALOG_OPEN, this.get_page_guidelines_as_dialog_data("welcome"))
      }
    },
    get_page_guidelines(guideline_name = "welcome") {
      const guidelines = this.$_.get(this.guidelines[this.$route.name], guideline_name)
      if (!guidelines) {
        console.error(`more than 1 page guidelines for page ${this.$route.name}`)
      }
      return guidelines
    },
    get_page_guidelines_as_dialog_data(guideline_name) {
      const guidelines = this.get_page_guidelines(guideline_name)
      this.current_guideline = `${this.$route.name}.${guideline_name}`
      return {
        data: {
          title: guidelines[0],
          html_text: guidelines.slice(1),
          show_cancel: false
        },
        confirm_method: () => {
          this.$store.commit("guidelines/close_guideline", this.current_guideline)
          this.current_guideline = null
        }
      }
    }
  }
}
