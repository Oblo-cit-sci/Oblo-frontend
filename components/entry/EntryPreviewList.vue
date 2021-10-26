<template lang="pug">
  #pwlist-container
    v-row.col-sm-12#pwlist-top(v-if="results_received")
      v-row.pl-3(v-if="!requesting_entries")
        v-col.pa-0(cols=6) {{$tc("comp.previewlist.num_entries", num_entries)}}
        v-col.pa-0(cols=12 v-if="show_no_entries_hint") {{$t("comp.previewlist.filter_change_hint")}}
        v-col.pa-0(cols=4)
          span(@click="$emit('download')") download
      div(v-else) ...
    #pwlist-wrapper
      v-row.mx-1(v-for="entry in visible_entries"
        :key="entry.uuid")
        v-col(cols=12)
          EntryPreview(
            :entry="entry"
            v-bind="preview_options"
            @delete_e="delete_e($event)")
    v-row.mx-0.mt-3(v-if="requesting_entries && !next_loading")
      v-col(offset="5" cols=2)
        v-progress-circular(indeterminate center size="55" color="info")
    v-row.mx-0.px-4(v-show="has_entries")
      v-col.pa-0(cols=9)
        SimplePaginate(v-if="entries_uuids.length > entries_per_page" v-model="page" :total_pages="total_pages" :has_next="has_more_pages" :next_loading="next_loading")
      v-spacer.pa-0
      v-col.pa-0(ref="to_top_button")
        v-btn(v-if="show_to_top_button" @click="scroll_to_top" fab x-small outlined)
          v-icon mdi-format-vertical-align-top
</template>

<script>
import EntryPreview from "~/components/entry/EntryPreview";
import SimplePaginate from "../SimplePaginate";


import {mapGetters} from "vuex"
import {PAGE_DOMAIN} from "~/lib/pages"

export default {
  name: "EntryPreviewList",
  components: {SimplePaginate, EntryPreview},
  props: {
    entries_uuids: {
      type: Array,
      required: true
    },
    // this can be more then in entries, but will allow to navigate further with next, so another fetch is triggered
    total_count: {
      type: Number
    },
    entries_per_page: {
      type: Number,
      default: 20
    },
    preview_options: {
      type: Object
    },
    requesting_entries: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      page: 1,
      deleted: [],
      show_to_top_button: null
    }
  },
  beforeUpdate() {
    this.deleted = this.$_.filter(this.deleted, uuid => !this.has_entry(uuid))
    // console.log("update", this.$refs, this.entries.length)
    // console.log(this.$refs.to_top_button)
    // entries are not immediately there, so the offsetTop is 0
    setTimeout(() => {
      if (this.$refs.to_top_button) {
        this.show_to_top_button = this.$refs.to_top_button.offsetTop > window.innerHeight
      } else {
        console.log("no $refs.to_top_button")
      }
    }, 100)
  },
  computed: {
    ...mapGetters({"has_entry": "entries/has_entry"}),
    results_received() {
      return this.entries_uuids !== undefined
    },
    next_loading() {
      return this.requesting_entries && this.entries_uuids.length > 0
    },
    visible_entries() {
      // console.log("offline- all entries",  this.entries)
      let from_index = (this.page - 1) * this.entries_per_page
      let to_index = from_index + this.entries_per_page
      const entries = this.entries_uuids.slice(from_index, to_index)
      // todo unique is just required cuz the server does often sent less (actor rows problem when querying entries)
      const uuids = this.$_.uniq(this.$_.filter(entries, e => !this.deleted.includes(e)))
      console.log(this.$_.map(uuids, uuid => this.$store.getters["entries/get_entry"](uuid)).filter(e => e !== undefined))
      return this.$_.map(uuids, uuid => this.$store.getters["entries/get_entry"](uuid)).filter(e => e !== undefined)
    },
    has_entries() {
      return this.num_entries > 0
    },
    num_entries() {
      // console.log("num_entries", this.total_count)
      if (this.total_count !== undefined)
        return this.total_count
      else
        return this.entries_uuids.length - this.deleted.length
    },
    show_no_entries_hint() {
      return this.num_entries === 0 && this.$route.name === PAGE_DOMAIN
    },
    // could be in some mixin
    // set_of_types() {
    //   //console.log("num entries", this.entries.length)
    //   return Array.from(
    //     new Set(
    //       this.$_.map(
    //         this.entries,
    //         e => this.$store.getters["templates/entry_type"](e.template.slug))).values())
    // },
    total_pages() {
      return Math.ceil(this.num_entries / this.entries_per_page)
    },
    has_more_pages() {
      return this.page * this.entries_per_page < this.num_entries
    },
    can_request_more() {
      return this.entries_uuids.length < this.num_entries
    }
  },
  methods: {
    delete_e(uuid) {
      this.deleted.push(uuid)
    },
    request_more() {
      this.$emit("request_more")
    },
    scroll_to_top() {
      const options = {
        duration: 1200,
        easing: "easeOutCubic",
      }
      if (this.$route.name === PAGE_DOMAIN) {
        options.container = "#menu_head" //".v-navigation-drawer__content"
      }
      setTimeout(() => this.$vuetify.goTo(0, options), 20)
    }
  },
  watch: {
    // entries: {
    //   immediate: true,
    //   handler(entries) {
    //     const entry_types = Array.from(new Set(this.$_.map(entries,
    //       uuid => this.$store.getters["entries/get_entry"](uuid).template.slug)))
    //     console.log(entry_types)
    //   }
    // },
    requesting_entries(val) {
      /**
       * val: boolean
       */
      // TODO, why does it not work with !this.has_entries
      if (val && !(this.entries_uuids.length > 0)) {
        this.page = 1
      }
    },
    page(page) {
      this.scroll_to_top()
      if (this.can_request_more) {
        if (page * this.entries_per_page >= this.entries_uuids.length) {
          this.$emit("request_more")
          // console.log("time for more")
        }
      }
    }
  }
}
</script>

<style scoped>

#pwlist-container {
  width: 100%;
}

</style>
