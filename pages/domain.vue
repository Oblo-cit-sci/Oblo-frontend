<template lang="pug">
  .fullSize()
    MenuContainer(
      :over="true"
      :domain_navigation_mode="navigation_mode")
    v-dialog(v-model="entrycreate_dialog_open")
      EntryCreateList(:template_entries="domain_templates")
    MapWrapper(
      height="100%"
      :domain="domain_name"
      @force_menu_mode_domain="set_menu_state(1)"
      @create_entry="create_entry($event)"
      @map="map=$event")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'
  import EntryCreateList from "~/components/EntryCreateList";
  import {entrytype_filter_options} from "~/lib/filter_option_consts";

  import {DOMAIN, SET_DOMAIN} from "~/store";
  import {TEMPLATES_OF_DOMAIN} from "~/store/templates";
  import EntryNavMixin from "~/components/EntryNavMixin"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
  import {object_list2options} from "~/lib/options"
  import LayoutMixin from "~/components/global/LayoutMixin"
  import {get_tags_filter_options} from "~/lib/codes"
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import MapWrapper from "~/components/map/MapWrapper"
  import {dev_env} from "~/lib/util"
  import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
  import MenuContainer from "~/components/menu/MenuContainer"
  import DomainMixin from "~/components/DomainMixin"
  import {QP_D, QP_F} from "~/lib/consts"
  import FixDomainMixin from "~/components/global/FixDomainMixin"
  import EntryCreateMixin from "~/components/entry/EntryCreateMixin"

  export default {
    name: "domain",
    layout: "new_map_layout",
    mixins: [DomainMixin, HasMainNavComponentMixin, EntryNavMixin, EntryCreateMixin,
      PersistentStorageMixin, LayoutMixin, MapIncludeMixin, FixDomainMixin],
    components: {MenuContainer, MapWrapper, EntryCreateList, Mapbox},
    data() {
      return {
        entrycreate_dialog_open: false
      }
    },
    beforeRouteEnter(to, from, next) {
      if (!(to.query[QP_D] || to.query[QP_F])) {
        // todo somehow doesn't load...
        next("/")
      } else {
        next()
      }
    },
    created() {
      // console.log("domain page created", this.$route.fullPath)
      if (!dev_env()) {
        window.history.replaceState(null, document.title, "/licci")
      }
      if (this.domain_data.name !== this.$store.getters[DOMAIN]) {
        this.$store.commit(SET_DOMAIN, this.domain_data)
      }

      if (this.$route.query.f && !this.is_fixed_domain) {
        this.fix_domain(this.$route.query.f)
      }
    },
    beforeRouteLeave(from, to, next) {
      if (!dev_env()) {
        window.history.replaceState(null, document.title, this.$route.fullPath)
      }
      next()
    },
    computed: {
      filters() {
        // todo I think depracated since it comes in the domainmenu
        const template_filter_options = Object.assign({}, entrytype_filter_options)
        template_filter_options.aspect.items = object_list2options(
          this.$store.getters[TEMPLATES_OF_DOMAIN](this.domain_name), "title", "slug", true)

        const tags_filter_options = get_tags_filter_options(this.$store, this.domain_name)
        return [template_filter_options, tags_filter_options]
      }
    },
    methods: {
      create_entry(template_slug = null) {
        if (template_slug) {
          this.create_entry(template_slug)
        } else {
          this.entrycreate_dialog_open = true
        }
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

  .fullWidth {
    width: 100%;
  }

  .fullSize {
    width: 100%;
    height: 100%;
  }
</style>
