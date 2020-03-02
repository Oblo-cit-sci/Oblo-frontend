<template lang="pug">
  div
    v-row(v-if="results_received" wrap justify-center)
      div {{num_entries}} Entries
    v-row(v-for="entry in visible_entries"
      :key="entry.id" class="col-sm-12 col-xs-6")
      v-col
        Entrypreview(
          :passed_uuid="entry.uuid"
          v-bind="preview_options"
          @delete_e="delete_e($event)"
          @preview_action="$emit('preview_action',$event)")
    v-row(v-if="has_entries")
      v-Pagination(v-if="entries.length>20" v-model="page"
        :length="num_pages"
        total-visible="8")
</template>

<script>
  import Entrypreview from "../components/EntryPreview";
  import {ENTRIES_HAS_ENTRY, ENTRYTYPES_TYPE, ENTRYTYPES_TYPES} from "../lib/store_consts";
  import goTo from 'vuetify/lib/services/goto'

  export default {
    name: "EntryPreviewList",
    components: {Entrypreview},
    mixins: [],
    props: {
      total_number: {
        type: Number
      },
      entries: Array,
      entries_per_page: {
        type: Number,
        default: 20
      },
      preview_options: {
        type: Object
      },
    },
    data: function () {
      return {
        recent: {},
        page: 1,
        deleted: []
      }
    },
    created() {
      console.log("entry preview list created")
    },
    beforeUpdate() {
      this.deleted = this.$_.filter(this.deleted, uuid => !this.$store.getters[ENTRIES_HAS_ENTRY](uuid))
    },
    computed: {
      results_received() {
        return this.entries !== undefined
      },
      visible_entries() {
        let from_index = (this.page - 1) * this.entries_per_page
        let to_index = from_index + this.entries_per_page
        const entries = this.entries.slice(from_index, to_index)
        console.log("pwlist 0",entries[0])
        return this.$_.filter(entries, e => !this.deleted.includes(e.uuid))
      },
      num_pages() {
        return Math.ceil(this.num_entries / this.entries_per_page)
      },
      has_entries() {
        return this.num_entries > 0
      },
      num_entries() {
        return this.entries.length - this.deleted.length
      },
      // could be in some mixin
      set_of_types() {
        //console.log("num entries", this.entries.length)
        return Array.from(
          new Set(
            this.$_.map(
              this.entries,
              e => this.$store.getters[ENTRYTYPES_TYPE](e.template.slug))).values())
      }
    },
    methods: {
      delete_e(uuid) {
        this.deleted.push(uuid)
      }
    },
    watch: {
      entries: function () {
        this.page = 1
      },
      page(page) {
        goTo("body", {
          duration: 1200,
          easing: "easeOutCubic"
        })
      }
    }
  }
</script>

<style scoped>
</style>
