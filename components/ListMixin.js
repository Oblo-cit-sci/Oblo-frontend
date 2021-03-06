import {aspect_default_value} from "../lib/aspect";

const PAGINATION_TRESH = 5

import goTo from 'vuetify/lib/services/goto'

export default {
  data() {
    return {
      min: null,
      max: null,

      // page
      page: 0,
      allow_jump: false,
      default_next_page_text: ">",
      default_prev_page_text: "<"
    }
  },
  methods: {
    set_min_max() {
      for (let v of ["min", "max"]) {
        if (this.attr[v] !== undefined) {
          this[v] = this.attr[v]
        } else if (this.attr.number !== undefined) {
          this[v] = this.attr.number
        }
      }
    },
    goto_stored_page() {
      // const entry = this.get_entry()
      // const loc_str = aspect_loc_str(remove_entry_loc(this.aspect_loc))
      // return this.$_.get(entry, "local.list_pages." + loc_str, 0)
    },
    set_page(page, goto_id) {
      // console.log("set page", page)
      if (page >= this.pages.length) {
        page = this.pages.length - 1
      } else if (page < 0) {
        page = 0;
      }
      if (page !== this.page) {
        this.page = page
        // if (this.aspect_loc) {
        //   this.$store.commit("entries/entries_set_local_list_page", {aspect_loc: this.aspect_loc, page: this.page})
        // }
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
      }
    },
    aspect_is_on_page(index) {
      //console.log("checking page", index, this.page * this.pagination_tresh, (this.page + 1) * this.pagination_tresh)
      return index >= this.page * this.pagination_tresh && index < (this.page + 1) * this.pagination_tresh
    },
    goto_delayed_last_page(goto_id) {
      setTimeout(() => {
        this.set_page(this.pages.length - 1, goto_id)
      }, 10)
    },
    guarantee_page() {
      // console.log(this.aspect.name, "guarantee page, ", this.page, this.pages.length)
      if (this.page >= this.pages.length) {
        this.set_page(this.pages.length - 1)
      }
    }
  },
  computed: {
    item_default_value() {
      return aspect_default_value(this.item_aspect)
    },
    has_one_empty() {
      return this.$_.some(this.value, iv => this.$_.isEqual(iv, this.item_default_value))
    },
    item_label() {
      return this.item_aspect.label
    },
    more_allowed() {
      return (!this.max || this.value.length < this.max) && !this.disabled && !this.attr.ref_size && !this.has_one_empty
    },
    requieres_more_color() {
      return this.min && this.value.length < this.min ? "success" : undefined
    },
    //
    has_pagination() {
      return this.value.length > this.pagination_tresh || this.attr.pagination
    },
    pagination_tresh() {
      return this.attr.items_per_page || PAGINATION_TRESH
    },
    pages() {
      let pages = []
      for (let i = 0; i < this.value.length / this.pagination_tresh; i++) {
        pages.push({})
      }
      return pages
    },
    pagination_props() {
      return {
        total: Math.ceil(this.value.length / this.pagination_tresh),
        page: this.page,
        pages: this.pages,
        allow_jump: this.allow_jump,
        default_next_page_text: this.default_next_page_text,
        default_prev_page_text: this.default_prev_page_text,
      }
    }
  }
}
