import {has_pages} from "~/lib/entry"

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
    last_page() {
      return !this.has_pages || this.page === this.pages.length - 1
    },
    shown_aspects() {
      if (this.has_pages) {
        return this.$_.filter(this.aspects, (a) => {
          return (this.page === 0 && (a.attr.page === 0 || a.attr.page === undefined) ||
            (this.page > 0 && a.attr.page === this.page))
        })
      }
      return this.template.aspects
    },
  }
}
