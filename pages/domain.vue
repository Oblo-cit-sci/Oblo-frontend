<template lang="pug">
  .fullSize()
    .buttongroup.shift_anim(:style="button_group_shift")
      v-btn(dark fab large color="blue" @click="switch_nav_drawer")
        v-icon mdi-menu
      v-btn(dark color="green" fab @click="open_layer_dialog")
        v-icon mdi-layers-outline
    .central_button
      v-btn.shift_anim(large rounded color="success" :style="center_button_shift" @click="create_from_main_template")
        b {{main_template.create_text}}
        v-icon mdi-plus
    MenuContainer(:over="true" :mode.sync="menu_mode" @menu_width="menu_width=$event")
    client-only
      MapWrapper(height="100%" :domain="domain_name")
</template>

<script>

  import Mapbox from 'mapbox-gl-vue'
  import EntryCreateList from "~/components/EntryCreateList";
  import Search from "~/components/global/Search";
  import {entrytype_filter_options} from "~/lib/filter_option_consts";

  import {mapGetters} from "vuex"
  import {DOMAIN, DOMAIN_BY_NAME, SET_DOMAIN} from "~/store";
  import {TEMPLATES_OF_DOMAIN} from "~/store/templates";
  import {USER_LOGGED_IN} from "~/store/user";
  import EntryNavMixin from "~/components/EntryNavMixin"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
  import {object_list2options} from "~/lib/options"
  import LayoutMixin from "~/components/global/LayoutMixin"
  import {get_tags_filter_options} from "~/lib/codes"
  import MapIncludeMixin from "~/components/map/MapIncludeMixin"
  import MapWrapper from "~/components/map/MapWrapper"
  import {dev_env} from "~/lib/util"
  import MainMenu from "~/components/menu/MainMenu"
  import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
  import MenuContainer from "~/components/menu/MenuContainer"
  import DomainMixin from "~/components/DomainMixin"
  import {MENU_MODE_DOMAIN_OVERVIEW} from "~/lib/consts"
  import DomainMapMixin from "~/components/map/DomainMapMixin"

  export default {
    name: "domain",
    layout: "new_map_layout",
    mixins: [DomainMixin, HasMainNavComponentMixin, EntryNavMixin,
      PersistentStorageMixin, LayoutMixin, MapIncludeMixin],
    components: {MenuContainer, MainMenu, MapWrapper, EntryCreateList, Search, Mapbox},
    data() {
      return {
        menu_mode: MENU_MODE_DOMAIN_OVERVIEW,
        menu_width: null
      }
    },
    created() {
      // this.$route.query[QP_D] || this.$route.query[QP_F]
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
      button_group_shift() {
        let shift = "0.5%"
        if (!this.display_mdDown && this.nav_drawer) {
          shift = this.menu_width + "px"
        }
        return {
          "left": shift
        }
      },
      center_button_shift() {
        let shift = "0"
        if (!this.display_mdDown && this.nav_drawer) {
          shift = this.menu_width / 2 + "px"
        }
        return {
          "left": shift
        }
      },
      ...mapGetters({
        domains: DOMAIN_BY_NAME,
        nav_drawer: "app/nav_drawer"
      }),
      filters() {
        const template_filter_options = Object.assign({}, entrytype_filter_options)
        template_filter_options.aspect.items = object_list2options(
          this.$store.getters[TEMPLATES_OF_DOMAIN](this.domain_name), "title", "slug", true)

        const tags_filter_options = get_tags_filter_options(this.$store, this.domain_name)
        return [template_filter_options, tags_filter_options]
      }
    },
    methods: {
      open_layer_dialog() {

      }
    }
  }
</script>

<style scoped>

  .buttongroup {
    position: absolute;
    top: 2%;
    height: 5%;
    z-index: 1;
  }

  .central_button {
    position: absolute;
    top: 2%;
    z-index: 1;
    left: 50%;
    transform: translate(-50%, 0)
  }

  .shift_anim {
    transition: left 0.2s;
    transition-timing-function: ease-out;
  }

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
