import {attr} from "~/lib/aspect"
import AspectConditionChecker from "~/components/aspect_utils/AspectConditionChecker"

export default {
  name: "EntryPagesMixin",
  mixins: [AspectConditionChecker],
  data() {
    return {
      page: this.$route.query.page | 0
    }
  },
  computed: {
    one_aspect_per_page() {
      return this.$_.get(this.template.rules, "one_aspect_per_page", false)
    },
    has_defined_pages() {
      if (this.one_aspect_per_page) {
        console.warn("one_aspect_per_page is set. ignores defined pages")
        return false
      }
      return (this.template.rules?.pages || []).length > 0
    },
    has_pages() {
      return this.has_defined_pages || this.one_aspect_per_page
    },
    active_aspects() {
      return this.$_.filter(this.aspects, a => !this.aspect_disabled(a))
    },
    current_page_info() {
      if (this.has_defined_pages) {
        return this.template.rules.pages[this.page]
      } else {
        return null
      }
    },
    named_pages() {
      return this.template.rules.hasOwnProperty("named_pages") || false
    },
    pages() {
      if (this.one_aspect_per_page) {
        const aspect_pages = this.$_.map(this.active_aspects, a => ({"title" : a.label}))
        aspect_pages.push({title: this.$_.capitalize(this.$t("w.metadata"))})
        return aspect_pages
      }
      return this.template.rules.pages || []
    },
    total_pages() {
      // console.log("EntryAction total_pages", this.template.rules.one_aspect_per_page)
      if (this.one_aspect_per_page) {
        // console.log("total pages,", this.active_aspects.length)
        return this.active_aspects.length
      } else {
        return this.pages.length
      }
    },
    is_first_page() {
      return this.page === 0
    },
    is_last_page() {
      return !this.has_pages || this.page === this.pages.length - 1
    },
    shown_aspects() {
      // console.log("has_pages", this.has_pages)
      if (this.one_aspect_per_page) {
        if (this.is_last_page) {
          return []
        }
        return [this.active_aspects[this.page]]
      }
      if (this.has_defined_pages) {
        return this.$_.filter(this.aspects, (a) => {
          return (this.page === 0 && (attr(a).page === 0 || attr(a).page === undefined) ||
            (this.page > 0 && attr(a).page === this.page))
        })
      }
      return this.template.aspects
    },
  },
  methods: {
    aspect_disabled(aspect) {
      // console.log("aspect_disabled", aspect.name, this._condition_fail(aspect, this.aspect_locs[aspect.name],
      //     this.mode, this.uuid, this.regular_values) ||
      //   (attr(aspect).disabled || false))
      return this._condition_fail(aspect, this.aspect_locs[aspect.name],
          this.mode, this.uuid, this.regular_values) ||
        (attr(aspect).disabled || false) || ((attr(aspect).visible === false) || false)
    }
  }
}
