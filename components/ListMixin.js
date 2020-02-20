import {aspect_loc_str, remove_entry_loc} from "../lib/aspect";

const PAGINATION_TRESH = 5

import goTo from 'vuetify/lib/services/goto'
import {ENTRIES_ENTRIES_SET_LOCAL_LIST_PAGE} from "~/lib/store_consts";

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
      const attr = this.aspect.attr
      for (let v of ["min", "max"]) {
        if (attr[v] !== undefined) {
          this[v] = attr[v]
        } else if (attr.number !== undefined) {
          this[v] = attr.number
        }
      }
    },
    goto_stored_page() {
      const entry = this.get_entry()
      if(entry) {
        if (entry.local.list_pages) {
          const loc_str = aspect_loc_str(remove_entry_loc(this.aspect_loc))
          if (entry.local.list_pages[loc_str] !== undefined) {
            this.set_page(entry.local.list_pages[loc_str])
          }
        }
      } else
        return 0
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
        this.$store.commit(ENTRIES_ENTRIES_SET_LOCAL_LIST_PAGE, {aspect_loc: this.aspect_loc, page: this.page})
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
    item_name() {
      return this.aspect.attr.itemname || "item"
    },
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
      return this.aspect.attr.items_per_page || PAGINATION_TRESH
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
