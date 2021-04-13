<template lang="pug">
  div
    TitledDialog(:title="$t('page.domain.create_entry_dialog_title')" :dialog_open.sync="entrycreate_dialog_open" show_close_btn)
      EntryCreateList(:template_entries="create_templates_options")
    MapWrapper(
      v-if="!is_offline"
      height="100%"
      :domain_data="domain_data"
      @force_menu_mode_domain="set_menu_state(1)"
      @create_entry="create_entry_or_open_dialog($event)"
      @map="map=$event")
</template>

<script>
import TitledDialog from "~/components/dialogs/TitledDialog";
import EntryCreateList from "~/components/EntryCreateList";
import MapWrapper from "~/components/map/MapWrapper";
import HasMainNavComponentMixin from "~/components/global/HasMainNavComponentMixin";
import EntryNavMixin from "~/components/EntryNavMixin";
import URLQueryMixin from "~/components/util/URLQueryMixin";
import EntryCreateMixin from "~/components/entry/EntryCreateMixin";
import URLParseMixin from "~/components/util/URLParseMixin";
import FilterMixin from "~/components/FilterMixin";
import EnvMixin from "~/components/global/EnvMixin";
import {MENU_MODE_DOMAIN, QP_D, QP_F, TEMPLATE} from "~/lib/consts";
import DomainDataMixin from "~/components/domain/DomainDataMixin";
import OfflineMixin from "~/lib/OfflineMixin"

export default {
  name: "DomainComponent",
  components: {TitledDialog, EntryCreateList, MapWrapper},
  mixins: [DomainDataMixin, HasMainNavComponentMixin, EntryNavMixin, URLQueryMixin, EntryCreateMixin, OfflineMixin,
    URLParseMixin, FilterMixin, EnvMixin],
  data() {
    return {
      entrycreate_dialog_open: false
    }
  },
  computed: {
    dialog_width() {
      return this.main_container_with
    }
  },
  created() {
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
  }
}
</script>

<style scoped>

</style>
