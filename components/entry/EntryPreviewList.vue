<template lang="pug">
  #pwlist-container
    v-row.col-sm-12#pwlist-top(v-if="results_received")
      div {{$tc("comp.previewlist.num_entries", num_entries)}}
    #pwlist-wrapper
      v-row.mx-1(v-for="entry in visible_entries"
        :key="entry.uuid")
        v-col(cols=12)
          EntryPreview(
            :entry="entry"
            v-bind="preview_options"
            @delete_e="delete_e($event)")
    v-row.mx-0(v-if="requesting_entries && !next_loading")
      v-col(offset="5" cols=2)
        v-progress-circular(indeterminate center size="35" color="success")
    v-row.mx-0.px-4(v-if="has_entries")
      v-col.pa-0(cols=8)
        SimplePaginate(v-if="entries.length > entries_per_page" v-model="page" :total_pages="total_pages" :has_next="has_more_pages" :next_loading="next_loading")
      v-spacer.pa-0
      v-col.pa-0
        v-btn(@click="scroll_to_top" fab x-small outlined)
          v-icon mdi-format-vertical-align-top
</template>

<script>
import EntryPreview from "~/components/entry/EntryPreview";
import SimplePaginate from "../SimplePaginate";
import {ENTRIES_GET_ENTRY} from "~/store/entries";
import {TEMPLATES_TYPE} from "~/store/templates";
import {mapGetters} from "vuex"
import {PAGE_DOMAIN} from "~/lib/pages"

export default {
  name: "EntryPreviewList",
  components: {SimplePaginate, EntryPreview},
  props: {
    entries: Array,
    // this can be more then in entries, but will allow to navigate further with next, so another fetch is triggered
    total_count: Number,
    entries_per_page: {
      type: Number,
      default: 20
    },
    preview_options: {
      type: Object
    },
    requesting_entries: {
      type: Boolean
    }
  },
  data: function () {
    return {
      page: 1,
      deleted: [],
    }
  },
  beforeUpdate() {
    this.deleted = this.$_.filter(this.deleted, uuid => !this.has_entry(uuid))
  },
  mounted() {
  },
  computed: {
    ...mapGetters({"has_entry": "entries/has_entry"}),
    results_received() {
      return this.entries !== undefined
    },
    next_loading() {
      return this.requesting_entries && this.entries.length > 0
      //if()
    },
    visible_entries() {
      let from_index = (this.page - 1) * this.entries_per_page
      let to_index = from_index + this.entries_per_page
      const entries = this.entries.slice(from_index, to_index)
      const uuids = this.$_.filter(entries, e => !this.deleted.includes(e.uuid))
      return this.$_.map(uuids, uuid => this.$store.getters[ENTRIES_GET_ENTRY](uuid))
    },
    has_entries() {
      return this.num_entries > 0
    },
    num_entries() {
      // console.log("num_entries", this.total_count)
      if (this.total_count !== undefined)
        return this.total_count
      else
        return this.entries.length - this.deleted.length
    },
    // could be in some mixin
    set_of_types() {
      //console.log("num entries", this.entries.length)
      return Array.from(
        new Set(
          this.$_.map(
            this.entries,
            e => this.$store.getters[TEMPLATES_TYPE](e.template.slug))).values())
    },
    total_pages() {
      return Math.ceil(this.total_count / this.entries_per_page)
    },
    has_more_pages() {
      return this.page * this.entries_per_page < this.total_count
    },
    can_request_more() {
      return this.entries.length < this.total_count
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
        options.container = ".v-navigation-drawer__content"
      }
      setTimeout(() => this.$vuetify.goTo(0, options), 20)
    }
  },
  watch: {
    requesting_entries(val) {
      /**
       * val: boolean
       */
      console.log("q-r", !val, this.next_loading, this.has_entries)
      if(!val && !this.has_entries) {
       this.page = 1
      }
    },
    page(page) {
      this.scroll_to_top()
      if (this.can_request_more) {
        if (page * this.entries_per_page >= this.entries.length) {
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
