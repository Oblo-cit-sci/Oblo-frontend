<template lang="pug">
  div
    v-list-item(v-if="can_fix_domain" :style="{'background-color':'#00A0A080'}")
      v-list-item-content {{$t('comp.domain_menu.fix_label', {domain_title:title})}}
      v-list-item-action
        v-btn(small @click="fix_domain(domain_name)")
          v-icon mdi-book-lock
    Search(v-show="nav_mode_search"
      :preview_options="preview_options"
      :search_config="search_config"
      :include_filters="filters"
      :domain_data="domain_data"
      @all_received_uuids="$emit('all_received_uuids', $event)"
      :prominent_filters="prominent_filters"
      @preview_action="preview_action($event)")
    div(v-if="nav_mode_entry && selected_entry")
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
import FixDomainMixin from "~/components/global/FixDomainMixin"
import FilterMixin from "~/components/FilterMixin"
import DomainDataMixin from "~/components/domain/DomainDataMixin";
import {ADMIN, EDITOR, REQUIRES_REVIEW} from "~/lib/consts";
import URLQueryMixin from "~/components/util/URLQueryMixin";
import EntryFetchMixin from "~/components/entry/EntryFetchMixin";

export default {
  name: "DomainMenu",
  mixins: [MapNavigationMixin, URLQueryMixin, HasMainNavComponentMixin, EntryFetchMixin, FixDomainMixin, FilterMixin, DomainDataMixin],
  components: {Entry, Search},
  props: {
    domain_data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selected_entry: undefined
    }
  },
  computed: {
    filters() {
      const template_filter_options = this.get_template_filter_options()
      const lang = this.$store.getters["user/settings"].domain_language

      template_filter_options.aspect.items = object_list2options(
        this.$store.getters["templates/templates_of_domain"](this.domain_name, lang), "title", "slug", true)
      const tags_filter_options = this.get_tags_filter_options(this.domain_name)
      // console.log(tags_filter_options)
      // const uuids_select_option = get_uuids_select_option()
      const language_filter_options = this.get_language_filter_options(this.domain_name)

      const filters = [template_filter_options, tags_filter_options, language_filter_options]
      if ([EDITOR, ADMIN].includes(this.$store.getters["user/global_role"])) {
        filters.push(this.get_requires_review_filter())
      }
      return filters
    },
    // async selected_entry() {
    //
    //   //
    //   //
    //   // if (this.$route.query.uuid)
    //   //   return this.$store.getters["entries/get_entry"](this.$route.query.uuid)
    // },
    search_config() {
      return this.$_.concat(this.domain_pre_filter, this.get_status_filter()) // this.get_drafts_filter()
    },
    can_fix_domain() {
      return !this.is_fixed_domain && !this.$store.getters.is_visitor
    }
  },
  watch: {
    query_entry_uuid: {
      immediate: true,
      handler: async function (uuid) {
        // console.log("watch-query_entry_uuid", uuid)
        if (uuid) {
          try {
            this.selected_entry = await this.guarantee_entry(uuid, this.query_entry_access_key)
            // console.log("ee", this.selected_entry)
            return this.selected_entry
          } catch (e) {
            this.err_error_snackbar(e)
            this.to_no_entry_route()
            // console.log("E", e)
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
