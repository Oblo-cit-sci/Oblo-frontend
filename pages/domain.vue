<template lang="pug">
  .fullSize()
    MenuContainer(
      :over="true"
      :domain_navigation_mode="navigation_mode")
    MapWrapper(height="100%" :domain="domain_name" @force_menu_mode_domain="menu_mode=1" @map="map=$event")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'
  import EntryCreateList from "~/components/EntryCreateList";
  import Search from "~/components/global/Search";
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
  import {MENU_MODE_DOMAIN_OVERVIEW, QP_D, QP_F} from "~/lib/consts"
  import TemplateLegend from "~/components/menu/TemplateLegend"

  export default {
    name: "domain",
    layout: "new_map_layout",
    mixins: [DomainMixin, HasMainNavComponentMixin, EntryNavMixin,
      PersistentStorageMixin, LayoutMixin, MapIncludeMixin],
    components: {TemplateLegend, MenuContainer, MapWrapper, EntryCreateList, Search, Mapbox},
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
    },
    beforeRouteLeave(from, to, next) {
      if (!dev_env()) {
        window.history.replaceState(null, document.title, this.$route.fullPath)
      }
      next()
    },
    computed: {
      filters() {
        const template_filter_options = Object.assign({}, entrytype_filter_options)
        template_filter_options.aspect.items = object_list2options(
          this.$store.getters[TEMPLATES_OF_DOMAIN](this.domain_name), "title", "slug", true)

        const tags_filter_options = get_tags_filter_options(this.$store, this.domain_name)
        return [template_filter_options, tags_filter_options]
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
