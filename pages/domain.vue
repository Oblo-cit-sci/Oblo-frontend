<template lang="pug">
  v-container(fluid :style="main_container_width_style")
    div(class="header-domain")
      p.display-1 {{domain_data.page_index.title}}
      p.heading {{domain_data.page_index.description}}
    div
      p
        h3 {{domain_data.page_index.action_text}}
      div(v-if="main_template")
        v-card(color='#85DCB0' @click="create_from_main_template")
          v-card-title {{main_template.title}}
          v-card-text {{main_template.description}}
        v-expansion-panels.mt-3(flat dense)
          v-expansion-panel(style="backgroundColor: 'none'")
            v-expansion-panel-header(style="backgroundColor: 'none'") Create other types of entries...
            v-expansion-panel-content
              EntryCreateList(:template_entries="template_entries")
      div(v-else)
        v-divider
        EntryCreateList(:template_entries="template_entries")
    v-divider.wide-divider
    MapWrapper(:height="400")
    Search(
      :init_clear="false"
      :search_config="domain_pre_filter",
      :mixin_domain_drafts="domain_name",
      :include_filters="filters")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'
  import EntryCreateList from "~/components/EntryCreateList";
  import {global_context_filter} from "~/lib/search";
  import Search from "~/components/global/Search";
  import {entrytype_filter_options} from "~/lib/filter_option_consts";

  import {mapGetters} from "vuex"
  import {DOMAIN, DOMAIN_BY_NAME, INIT_PAGE_PATH, SET_DOMAIN} from "~/store";
  import {TEMPLATES_OF_DOMAIN} from "~/store/templates";
  import {USER_LOGGED_IN} from "~/store/user";
  import {create_entry} from "~/lib/entry"
  import {ENTRIES_SAVE_ENTRY} from "~/store/entries"
  import {EDIT, QP_D, QP_F} from "~/lib/consts"
  import EntryNavMixin from "~/components/EntryNavMixin"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
  import {object_list2options} from "~/lib/options"
  import LayoutMixin from "~/components/global/LayoutMixin"
  import {get_tags_filter_options} from "~/lib/codes"
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import MapWrapper from "~/components/map/MapWrapper"
  import EntryCreateMixin from "~/components/entry/EntryCreateMixin"

  export default {
    name: "domain",
    mixins: [EntryNavMixin, PersistentStorageMixin, LayoutMixin, MapIncludeMixin, EntryCreateMixin],
    components: {MapWrapper, EntryCreateList, Search, Mapbox},
    data() {
      return {
        main_template: null
      }
    },
    created() {
      // this.$route.query[QP_D] || this.$route.query[QP_F]
      console.log(document.documentURI)
      window.history.replaceState(null,document.title, "/licci")
      console.log(this.$route)
      if (this.domain_data.name !== this.$store.getters[DOMAIN]) {
        this.$store.commit(SET_DOMAIN, this.domain_data)
      }
      if (this.domain_data.page_index.main_template) {
        this.main_template = this.template_entries.filter(e => e.slug === this.domain_data.page_index.main_template)[0]
      }
    },
    beforeRouteLeave(from, to, next) {
      window.history.replaceState(null,document.title, this.$route.fullPath)
      next()
    },
    computed: {
      ...mapGetters({logged_in: USER_LOGGED_IN, domain_templtes: TEMPLATES_OF_DOMAIN, domains: DOMAIN_BY_NAME}),
      domain_name() {
        return this.$route.query[QP_D] || this.$route.query[QP_F]
      },
      template_entries() {
        let templates = global_context_filter(this.domain_templtes(this.domain_name))
        if (this.main_template) {
          templates = templates.filter(t => t.slug !== this.main_template.slug)
        }
        return templates
      },
      domain_data() {
        return this.domains(this.domain_name)
      },
      filters() {
        const template_filter_options = Object.assign({}, entrytype_filter_options)
        template_filter_options.aspect.items = object_list2options(
          this.$store.getters[TEMPLATES_OF_DOMAIN](this.domain_name), "title", "slug", true)

        const tags_filter_options = get_tags_filter_options(this.$store, this.domain_name)
        return [template_filter_options, tags_filter_options]
      },
      domain_pre_filter() {
        return [{
          name: "meta",
          column: DOMAIN,
          conditional_value: this.domain_data.name
        }]
      }
    },
    methods: {
      create_from_main_template() {
        const entry = this.create_entry(this.main_template.slug)
        this.to_entry(entry.uuid, EDIT)
      }
    }
  }
</script>

<style scoped>
  .header-domain {
    background-color: white;
    padding: 10px;
  }

  .wide-divider {
    margin: 10px 0;
  }

  .fullSize {
    width: 100%;
  }
</style>
