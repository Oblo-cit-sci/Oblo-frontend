import {aspect_raw_default_value, attr, unpack} from "~/lib/aspect"
import AspectConditionChecker from "~/components/aspect_utils/AspectConditionChecker"
import {named_pages, one_aspect_per_page, pages, view_mode_hide_unset_values} from "~/lib/template"

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
      return one_aspect_per_page(this.template)
    },
    has_defined_pages() {
      if (this.one_aspect_per_page) {
        return false
      }
      return pages(this.template).length > 0
    },
    has_pages() {
      console.log("HAS pages?", this.mode, this.is_editable_mode, this.has_defined_pages)
      return this.is_editable_mode && (this.has_defined_pages || this.one_aspect_per_page)
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
      return named_pages(this.template)
    },
    pages() {
      if (this.one_aspect_per_page) {
        const aspect_pages = this.$_.map(this.active_aspects, a => ({"title": a.label}))
        aspect_pages.push({title: this.$_.capitalize(this.$t("w.metadata"))})
        return aspect_pages
      }
      return pages(this.template)
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
      // console.log("shown_aspects: has_pages?", this.has_pages, "is_view_mode?",this.is_view_mode)
      // not set on view-mode
      // console.log("shown-aspects. pages?", this.has_pages)
      if (this.has_pages) {
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
      } else {
        // console.log(this.$_.map(this.aspects, a => attr(a).page || 0))
        if (this.is_view_mode && view_mode_hide_unset_values(this.template)) {
          // filter aspects, which have a value
          return this.$_.filter(this.aspects, a => !this.$_.isEqual(
            unpack(this.regular_values[a.name]),
            aspect_raw_default_value(a)))
        } else {
          return this.aspects
        }
      }
    }
  },
  methods: {
    aspect_disabled(aspect) {
      // console.log("aspect_disabled", aspect.name, this._condition_fail(aspect, this.aspect_locs[aspect.name],
      //     this.mode, this.uuid, this.regular_values) ||
      //   (attr(aspect).disabled || false))
      return this._condition_fail(aspect, this.regular_values) ||
        (attr(aspect).disabled || false) || ((attr(aspect).visible === false) || false)
    }
  }
}
