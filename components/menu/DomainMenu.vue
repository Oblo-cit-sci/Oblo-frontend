<template lang="pug">
  div
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
  import {QP_D, QP_F} from "~/lib/consts"
  import {entrytype_filter_options} from "~/lib/filter_option_consts"
  import {object_list2options} from "~/lib/options"
  import {TEMPLATES_OF_DOMAIN} from "~/store/templates"
  import {get_tags_filter_options} from "~/lib/codes"

  export default {
    name: "DomainMenu",
    mixins: [MapNavigationMixin, HasMainNavComponentMixin],
    components: {Entry, Search},
    computed: {
      domain_name() {
        return this.$route.query[QP_D] || this.$route.query[QP_F]
      },
      filters() {
        const template_filter_options = Object.assign({}, entrytype_filter_options)
        template_filter_options.aspect.items = object_list2options(
          this.$store.getters["templates/templates_of_domain"](this.domain_name), "title", "slug", true)

        const tags_filter_options = get_tags_filter_options(this.$store, this.domain_name)
        return [template_filter_options, tags_filter_options]
      },
    },
    methods: {},
    watch: {
      // domain_navigation_mode(mode, old_mode) {
      //   console.log("DomainMenu.watch.domain_navigation_mode", mode)
      // }
    }
  }
</script>

<style scoped>

</style>
