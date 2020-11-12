<template lang="pug">
  div
    v-row(v-if="!is_fixed_domain" :style="{'background-color':'#00A0A080'}")
      v-list-item
        v-list-item-content {{$t('comp.domain_menu.fix_label', {domain_title})}}
        v-list-item-action
          v-btn(small @click="fix_domain(domain_name)")
            v-icon mdi-book-lock
    Search(v-show="nav_mode_search"
      :preview_options="preview_options"
      :search_config="search_config"
      :include_filters="filters"
      :domain_data="actual_lang_domain_data"
      @all_received_uuids="$emit('all_received_uuids', $event)"
      :prominent_filters="prominent_filters"
      @preview_action="preview_action($event)")
    div(v-if="nav_mode_entry")
      v-row
        v-col.py-0
          v-btn(@click="unselect_entry" text small)
            v-icon mdi-arrow-left-thick
      v-row
        v-col.py-0
          Entry(:entry="selected_entry" :navigation_props="entry_navigation_props")
</template>

<script>
import Search from "~/components/global/Search"
import MapNavigationMixin from "~/components/map/MapNavigationMixin"
import Entry from "~/components/entry/Entry"
import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
import {object_list2options} from "~/lib/options"
import DomainMixin from "~/components/DomainMixin"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import FilterMixin from "~/components/FilterMixin"
import DomainLanguageMixin from "~/components/domain/DomainLanguageMixin";

export default {
  name: "DomainMenu",
  mixins: [MapNavigationMixin, HasMainNavComponentMixin, DomainMixin, FixDomainMixin, FilterMixin, DomainLanguageMixin],
  components: {Entry, Search},
  props: {
    domain_name: {
      type: String,
      required: true
    }
  },
  computed: {
    filters() {
      const template_filter_options = this.get_template_filter_options()
      template_filter_options.aspect.items = object_list2options(
        this.$store.getters["templates/templates_of_domain"](this.domain_name), "title", "slug", true)
      console.log(template_filter_options.aspect.items)
      const tags_filter_options = this.get_tags_filter_options(this.domain_name)
      // const uuids_select_option = get_uuids_select_option()
      return [template_filter_options, tags_filter_options]
    },
    actual_lang_domain_data() {
      return this.ui_lang_domain_data(this.domain_name)
    },
    prominent_filters() {
      // console.log(this.$_.get(this.domain_data, "filters.prominent_filters"))
      return this.$_.get(this.ui_lang_domain_data(this.domain_name), "filters.prominent_filters")
    },
    selected_entry() {
      if (this.$route.query.uuid)
        return this.$store.getters["entries/get_entry"](this.$route.query.uuid)
    },
    search_config() {
      return this.$_.concat(this.domain_pre_filter, this.get_drafts_filter())
    }
  }
}
</script>

<style scoped>

</style>
