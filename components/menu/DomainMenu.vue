<template lang="pug">
  div
    v-row(v-if="!fixed_domain" :style="{'background-color':'#00A0A080'}")
      v-list-item
        v-list-item-content {{$t('comp.domain_menu.fix_label', {domain_title})}}
        v-list-item-action
          v-btn(small @click="fix_domain(domain_name)")
            v-icon mdi-book-lock
    Search(v-show="nav_mode_search"
      :preview_options="preview_options"
      :fixed_filters="location_pre_filter"
      :include_filters="filters"
      :mixin_domain_drafts="domain_name",
      @all_received_uuids="$emit('all_received_uuids', $event)"
      @preview_action="preview_action($event)")
    div(v-if="nav_mode_entry")
      v-row
        v-btn(@click="unselect_entry" Search)
          v-icon mdi-arrow-left-thick
      v-row
        v-col
          Entry(:navigation_props="entry_navigation_props")
</template>

<script>
  import Search from "~/components/global/Search"
  import MapNavigationMixin from "~/components/map/MapNavigationMixin"
  import Entry from "~/components/entry/Entry"
  import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
  import {entrytype_filter_options} from "~/lib/filter_option_consts"
  import {object_list2options} from "~/lib/options"
  import {get_tags_filter_options} from "~/lib/codes"
  import {mapGetters, mapMutations} from "vuex"
  import DomainMixin from "~/components/DomainMixin"

  export default {
    name: "DomainMenu",
    mixins: [MapNavigationMixin, HasMainNavComponentMixin, DomainMixin],
    components: {Entry, Search},
    computed: {
      ...mapGetters({fixed_domain:"app/fixed_domain"}),
      filters() {
        const template_filter_options = Object.assign({}, entrytype_filter_options)
        template_filter_options.aspect.items = object_list2options(
          this.$store.getters["templates/templates_of_domain"](this.domain_name), "title", "slug", true)

        const tags_filter_options = get_tags_filter_options(this.$store, this.domain_name)
        return [template_filter_options, tags_filter_options]
      }
    },
    methods: {
      ...mapMutations({fix_domain:"app/fixed_domain"})
    }
  }
</script>

<style scoped>

</style>
