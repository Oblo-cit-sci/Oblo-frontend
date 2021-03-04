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

  export default {
    name: "TemplateLegend",
    mixins: [FilterMixin],
    components: {},
    props: {
      domain_name: String
    },
    data() {
      // this would add name: "template" to the selected
      // const template_filter_options = Object.assign({}, entrytype_filter_options)
      const language = this.$store.getters["user/settings"].domain_language
      const templates = object_list2options(
        this.$store.getters["templates/templates_of_domain"](this.domain_name, language),
        "title", "slug", true,
        [{"color": "rules.marker_color"}])
      return {
        templates,
        panel_state: false
      }
    },
    computed: {
      selected: {
        get: function () {
          const search_conf = this.$store.getters["search/get_act_config"].find(cf => cf.name === TEMPLATE)
          if(search_conf) {
            return unpack(search_conf.value).map(f => this.$_.findIndex(this.templates, t => t.value === f))
          }
        },
        set(selected_templates) {
          const result = this.$_.map(selected_templates, (sel, index) => this.templates[sel].value)
          this.$store.commit("search/replace_in_act_config", this.config_generate(TEMPLATE, result))
        }
      }
    },
    methods: {
      force_close() {
        this.panel_state = false
      }
    }
  }
</script>

<style scoped>

</style>
