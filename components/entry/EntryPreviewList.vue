<template lang="pug">
  #pwlist-container(:style="list_style")
    v-row.col-sm-12#pwlist-top(v-if="results_received")
      div {{$tc("comp_entries_pw_list.num_entries", num_entries)}}
    v-row.mx-1(v-for="uuid in visible_entries"
      :key="uuid")
      v-col(cols=12)
        Entrypreview(
          :passed_uuid="uuid"
          v-bind="preview_options"
          @delete_e="delete_e($event)"
          @preview_action="$emit('preview_action',$event)")
    v-row(v-if="requesting_entries && !next_loading")
      v-col(offset="5" cols=2)
        v-progress-circular(indeterminate center size="35" color="success")
    v-row.mx-0.px-4(v-if="has_entries")
      SimplePaginate(v-if="entries.length>entries_per_page" v-model="page" :has_next="has_more_pages" :next_loading="next_loading")
</template>

<script>
  import Entrypreview from "~/components/entry/EntryPreview";
  import goTo from 'vuetify/lib/services/goto'
  import SimplePaginate from "../SimplePaginate";
  import {ENTRIES_HAS_ENTRY} from "~/store/entries";
  import {TEMPLATES_TYPE} from "~/store/templates";

  export default {
    name: "EntryPreviewList",
    components: {SimplePaginate, Entrypreview},
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
        start_y: 0
      }
    },
    beforeUpdate() {
      this.deleted = this.$_.filter(this.deleted, uuid => !this.$store.getters[ENTRIES_HAS_ENTRY](uuid))
    },
    mounted() {
      this.start_y = document.getElementById('pwlist-container').offsetTop
    },
    computed: {
      on_overflow_page() {
        return this.$route.name === "domain"
      },
      list_style() {
        return {
          'overflow-y': this.on_overflow_page ? 'auto' : 'visible',
          'max-height': window.innerHeight - this.start_y
        }
      },
      results_received() {
        return this.entries !== undefined
      },
      next_loading() {
        return this.requesting_entries && this.entries.length % this.entries_per_page === 0
        //if()
      },
      visible_entries() {
        let from_index = (this.page - 1) * this.entries_per_page
        let to_index = from_index + this.entries_per_page
        const entries = this.entries.slice(from_index, to_index)
        return this.$_.filter(entries, e => !this.deleted.includes(e.uuid))
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
      }
    },
    watch: {
      page(page) {
        console.log(this.on_overflow_page)
        const options = {
          duration: 1200,
          easing: "easeOutCubic",
        }
        if (this.on_overflow_page) {
          options.container = "#pwlist-container"
        }
        setTimeout(() => goTo("#pwlist-top", options), 80)
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
    max-height: 600px;
  }

</style>
