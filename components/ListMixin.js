import {aspect_loc_str, remove_entry_loc} from "../lib/aspect";

const PAGINATION_TRESH = 5

import goTo from 'vuetify/lib/services/goto'

export default {
  data() {
    return {
      min: null,
      max: null,
      item_name: this.aspect.attr.itemname || "item",
      // page
      page: 0,
      allow_jump: false,
      default_next_page_text: ">",
      default_prev_page_text: "<"
    }
  },
  methods: {
    set_min_max() {
      const attr = this.aspect.attr
      for (let v of ["min", "max"]) {
        if (attr[v] !== undefined) {
          this[v] = attr[v]
        } else if (attr.number !== undefined) {
          this[v] = attr.number
        }
      }
    },
    set_page(page, goto_id) {
      this.page = page
      this.$store.commit("entries/entries_set_local_list_page", {aspect_loc: this.aspect_loc, page: this.page})
      try {
        if (goto_id) {
          setTimeout(() => {
            goTo("#" + goto_id, {
              duration: 200,
              easing: "easeOutCubic"
            })
          }, 50)
        }
      } catch (e) {
        console.log(e)
      }
    },
    aspect_is_on_page(index) {
      return index >= this.page * this.pagination_tresh && index < (this.page + 1) * this.pagination_tresh
    },
    goto_delayed_last_page(goto_id) {
      setTimeout(() => {
        this.set_page(this.pages.length - 1, goto_id)
      }, 10)
    }
  },
  computed: {
    more_allowed() {
      return (!this.max || this.value.length < this.max) && !this.disabled && !this.aspect.attr.ref_size
    },
    requieres_more_color() {
      return this.min && this.value.length < this.min ? "success" : undefined
    },
    //
    has_pagination() {
      return this.value.length > this.pagination_tresh || this.aspect.attr.pagination
    },
    pagination_tresh() {
      if (this.aspect.attr.items_per_page) {
        return this.aspect.attr.items_per_page
      } else {
        return PAGINATION_TRESH
      }
    },
    pages() {
      let pages = []
      for (let i = 0; i < this.value.length / this.pagination_tresh; i++) {
        pages.push({})
      }
      return pages
    }
  }
}
