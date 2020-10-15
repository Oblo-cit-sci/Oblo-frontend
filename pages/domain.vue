<template lang="pug">
  .fullSize
    v-dialog(v-model="entrycreate_dialog_open" :width="dialog_width")
      v-card
        v-card-title {{$t("page.domain.create_new_entry")}}
        EntryCreateList(:template_entries="create_templates_options")
    MapWrapper(
      height="100%"
      :domain_data="domain_data"
      @force_menu_mode_domain="set_menu_state(1)"
      @create_entry="create_entry_or_open_dialog($event)"
      @map="map=$event")
</template>

<script>

import EntryCreateList from "~/components/EntryCreateList";

import {SET_DOMAIN} from "~/store";
import EntryNavMixin from "~/components/EntryNavMixin"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import LayoutMixin from "~/components/global/LayoutMixin"
import MapIncludeMixin from "~/components/map/MapIncludeMixin"
import MapWrapper from "~/components/map/MapWrapper"
import {dev_env} from "~/lib/util"
import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
import {MENU_MODE_DOMAIN_OVERVIEW, QP_D, QP_F, TEMPLATE} from "~/lib/consts"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import EntryCreateMixin from "~/components/entry/EntryCreateMixin"
import URLParseMixin from "~/components/util/URLParseMixin"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import DomainData_UtilMixin from "~/components/domain/DomainData_UtilMixin"
import FilterMixin from "~/components/FilterMixin"

export default {
  name: "domain",
  // layout: "new_map_layout",
  mixins: [DomainData_UtilMixin, HasMainNavComponentMixin, EntryNavMixin, EntryCreateMixin, URLQueryMixin,
    PersistentStorageMixin, LayoutMixin, MapIncludeMixin, FixDomainMixin, URLParseMixin, FilterMixin, LayoutMixin],
  components: {MapWrapper, EntryCreateList},
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
    if (this.domain_name !== this.$store.getters.domain.name) {
      const language = this.$store.getters["user/settings"].ui_language
      const domain_data = this.$store.getters["domain_data"](this.domain_name, language)
      this.$store.commit(SET_DOMAIN, domain_data)
    }

    if (this.$route.query.f && !this.is_fixed_domain) {
      this.fix_domain(this.$route.query.f)
    }

    this.set_menu_state(MENU_MODE_DOMAIN_OVERVIEW)

    // read template config from query
    // for now just query param template, e.g. : ...&s=template:article_review
    const config = this.search_config(this.$route.query.s)
    if (config && config[0].name === TEMPLATE) {
      // console.log("setting from query")
      this.$store.commit("search/replace_in_act_config", this.config_generate(config[0].name, config[0].value))
    }
    // get the default templates of the domain
    if (this.$store.getters["search/get_act_config"].length === 0) {
      // console.log("setting default")
      const generated = this.config_generate(TEMPLATE, this.$_.get(this.domain_data, "search.default_templates", []))
      this.$store.commit("search/replace_in_act_config", generated)
    }
  },
  beforeRouteLeave(from, to, next) {
    if (!dev_env()) {
      window.history.replaceState(null, document.title, this.$route.fullPath)
    }
    this.set_menu_open(false)
    next()
  },
  computed: {
    domain_name() {
      return this.query_param_domain_name
    },
    domain_data() {
      const language = this.$store.getters["user/settings"].ui_language
      return this.$store.getters["domain_data"](this.domain_name, language)
    },
    dialog_width() {
      return this.main_container_with
    }
  },
  methods: {
    create_entry_or_open_dialog(template_slug = null) {
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

.fullSize {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
