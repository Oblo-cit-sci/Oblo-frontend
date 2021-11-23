import {has_pages} from "~/lib/entry"
import {attr} from "~/lib/aspect"

export default {
  name: "EntryPagesMixin",
  data() {
    return {
      page: this.$route.query.page | 0
    }
  },
  computed: {
    has_pages() {
      return has_pages(this.template)
    },
    named_pages() {
      return this.template.rules.hasOwnProperty("named_pages") || false
    },
    pages() {
      return this.template.rules.pages || []
    },
    is_first_page() {
      return this.page === 0
    },
    is_last_page() {
      return !this.has_pages || this.page === this.pages.length - 1
    },
    shown_aspects() {
      // console.log("has_pages", this.has_pages)
      if (this.has_pages) {
        return this.$_.filter(this.aspects, (a) => {
          return (this.page === 0 && (attr(a).page === 0 || attr(a).page === undefined) ||
            (this.page > 0 && attr(a).page === this.page))
        })
      }
      return this.template.aspects
    },
  }
}
