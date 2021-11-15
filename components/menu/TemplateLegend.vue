<template lang="pug">
  v-expansion-panels(:style="{'width':'250px', opacity:'0.8'}" v-model="panel_state")
    v-expansion-panel
      v-expansion-panel-header.px-3.py-1 {{$t("comp.legend.legend")}}
      v-expansion-panel-content.px-2.py-1.no-wrap
        v-list(dense)
          v-list-item-group(multiple mandatory  v-model="selected")
            v-list-item(v-for="t in templates" :key="t.value" :color="t.color" :ripple="false")
              v-list-item-icon
                v-icon.mr-0(:color="t.color" x-small) mdi-checkbox-blank-circle
              v-list-item-title {{t.text}}
</template>

<script>
import {object_list2options} from "~/lib/options"
import {TEMPLATE} from "~/lib/consts"
import {unpack} from "~/lib/aspect";
import FilterMixin from "~/components/FilterMixin";
import DomainDataMixin from "~/components/domain/DomainDataMixin";

export default {
  name: "TemplateLegend",
  mixins: [FilterMixin, DomainDataMixin],
  components: {},
  data() {
    return {
      templates: [],
      panel_state: false
    }
  },
  computed: {
    selected: {
      get: function () {
        const search_conf_template_value = this.$store.getters["search/get_act_config_value_by_name"](TEMPLATE)
        if (search_conf_template_value) {
          const conf_values  = search_conf_template_value.map(template => template.value)
          const all_templates_values = this.templates.map(template => template.value)
          return conf_values.map(f => this.$_.findIndex(all_templates_values, t => t === f))
        }
      },
      set(selected_templates) {
        const valid_selection = selected_templates.filter(f => f >= 0)
        const result = this.$_.map(valid_selection, (sel, index) => this.templates[sel].value)
        this.$store.commit("search/replace_in_act_config", this.get_filter_config(TEMPLATE, result))
      }
    }
  },
  methods: {
    force_close() {
      this.panel_state = false
    }
  },
  created() {
    // moved here cuz of store access (not working in data)
    this.templates = object_list2options(this.domain_templates(true),
      "title", "slug", true,
      [{"color": "rules.marker_color"}])
    console.log("legend: templates", this.templates)
  }
}
</script>

<style scoped>

</style>
