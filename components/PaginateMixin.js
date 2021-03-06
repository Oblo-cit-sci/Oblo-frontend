import {string_list2options} from "~/lib/options";
import AspectConditionChecker from "~/components/aspect_utils/AspectConditionChecker"

export default {
  name: "PaginateMixin",
  mixins: [AspectConditionChecker],
  props: {
    total: Number,
    page: Number,
    named_pages: Boolean,
    pages: {
      type: Array,
      required: false // TODO should be true ?
    },
    allow_jump: {
      type: Boolean,
      default: true
    },
    default_next_page_text: {
      type: String,
      default: "Next page"
    },
    default_prev_page_text: {
      type: String,
      default: "Previous page"
    },
    // only used, when the paginate is on concrete entries. not necessary.
    // It's for conditioning, which depends on aspects of the entry
    entry: {
      type: Object
    },
    conditionals: Object
  },
  computed: {
    more_follow_page() {
      return this.get_active_page_after(this.page).length > 0
    },
    more_prev_pages() {
      return this.get_active_pages_before(this.page).length > 0
    },
    pages_options() {
      return string_list2options(this.$_.map(
        this.active_pages, (p) => {
          return p.title
        }))
    },
    selected_page() {
      return this.pages[this.page].title
    },
    prev_page_text() {
      if (this.named_pages) {
        if (this.page > 0) {
          return this.pages[this.page - 1].title
        } else {
          return this.default_prev_page_text
        }
      }
      return this.default_prev_page_text
    },
    next_page_text() {
      if (this.named_pages) {
        if (this.page < this.pages.length - 1) {
          return this.pages[this.page + 1].title
        } else {
          return this.default_next_page_text
        }
      }
      return this.default_next_page_text
    },
    active_pages() {
      return this.$_.filter(this.pages, p => this.page_disabled(p))
    },
    number_of_pages() {
      return this.active_pages.length
    },
    page_index() {
      return 1 + this.page
    }
  },
  methods: {
    page_disabled(page) {
      if (page.condition && this.entry) {
        return this.simple_check_recursive_condition(page.condition, this.conditionals)
      } else {
        return true
      }
    },
    test_last_page(test_page) {
      return test_page === this.total - 1
    },
    change_page(dir) {
      let next_page = this.page
      //console.log("mask", this.mask_pages_active())
      do {
        next_page = next_page + dir
        if (next_page < 0 || next_page > this.pages.length)
          break
      } while (!this.mask_pages_active()[next_page])
      // console.log("p>", next_page)
      this.$emit("update:page", next_page)
      if (this.test_last_page(this.page) !== this.test_last_page(next_page))
        this.$emit("lastpage", this.test_last_page(next_page))
    },
    page_selected(page_title) {
      // todo, this triggers when page opened. should be just be set and be silent untill ui
      //console.log("page_selected", page_title)
      let page_select = this.$_.findIndex(this.pages, p => p.title === page_title)
      this.$emit("update:page", page_select)
      this.$emit("lastpage", this.test_last_page(page_select))
    },
    get_active_page_after(page) {
      return this.$_.filter(this.$_.slice(this.pages, page + 1), p => this.page_disabled(p))
    },
    get_active_pages_before(page) {
      // return this.$_.filter(this.$_.slice(this.pages, page + 1), p => this.page_disabled(p))
      return this.$_.filter(this.$_.slice(this.pages, null, page), p => this.page_disabled(p))
    },
    mask_pages_active() {
      return this.$_.map(this.pages, p => this.page_disabled(p))
    }
  }
}
