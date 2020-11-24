<template lang="pug">
  .fullSize
    TitledDialog(:title="$t('page.domain.create_entry_dialog_title')" :dialog_open.sync="entrycreate_dialog_open" show_close_btn)
      EntryCreateList(:template_entries="create_templates_options")
    MapWrapper(
      v-if="online"
      height="100%"
      :domain_data="domain_data"
      @force_menu_mode_domain="set_menu_state(1)"
      @create_entry="create_entry_or_open_dialog($event)"
      @map="map=$event")
</template>

<script>

import EntryCreateList from "~/components/EntryCreateList";
import EntryNavMixin from "~/components/EntryNavMixin"
import MapWrapper from "~/components/map/MapWrapper"
import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin"
import {MENU_MODE_DOMAIN, QP_D, QP_F, TEMPLATE} from "~/lib/consts"
import URLParseMixin from "~/components/util/URLParseMixin"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import DomainData_UtilMixin from "~/components/domain/DomainData_UtilMixin"
import FilterMixin from "~/components/FilterMixin"
import TitledDialog from "~/components/dialogs/TitledDialog"
import EnvMixin from "~/components/global/EnvMixin"
import EntryCreateMixin from "~/components/entry/EntryCreateMixin";

export default {
  name: "domain",
  components: {TitledDialog, MapWrapper, EntryCreateList},
  mixins: [DomainData_UtilMixin, HasMainNavComponentMixin, EntryNavMixin,  URLQueryMixin, EntryCreateMixin,
    URLParseMixin, FilterMixin, EnvMixin],
  data() {
    return {
      entrycreate_dialog_open: false
    }
  },
  computed: {
    dialog_width() {
      return this.main_container_with
    },
    domain_data() {
      const language = this.$store.getters["user/settings"].domain_language
      return this.$store.getters["domain/lang_domain_data"](this.domain_name, language)
    },
    domain_name() {
      return this.query_param_domain_name
    }
  },
  created() {
    if (this.is_prod) {
      window.history.replaceState(null, document.title, "/licci")
    }
    if (this.domain_name !== this.$store.getters["domain/act_domain_name"]) {
      this.$store.commit("domain/set_act_domain", this.domain_name)
    }

    if (this.$route.query.f && !this.is_fixed_domain) {
      this.fix_domain(this.$route.query.f)
    }

    this.set_menu_state(MENU_MODE_DOMAIN)
    const config = this.search_config(this.$route.query.s)
    if (config && config[0].name === TEMPLATE) {
      const language = this.$store.getters["user/settings"].domain_language
      this.$store.commit("search/replace_in_act_config", this.config_generate(config[0].name, config[0].value, language))
    }
    // get the default templates of the domain
    this.$bus.$on("domain-create_entry", slug => this.create_entry_or_open_dialog(slug))
  },
  beforeDestroy() {
    this.$bus.$off("domain-create_entry")
  },
  methods: {
    create_entry_or_open_dialog(template_slug = null) {
      if (template_slug) {
        this.create_entry(template_slug)
      } else {
        this.entrycreate_dialog_open = true
      }
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
  beforeRouteLeave(from, to, next) {
    if (this.is_prod) {
      window.history.replaceState(null, document.title, this.$route.fullPath)
    }
    this.set_menu_open(false)
    next()
  },
}
</script>

<style scoped>

.fullSize {
  position: absolute;
  width: 100%;
  height: 100%;
}

</style>
