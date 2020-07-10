<template lang="pug">
  v-expansion-panels(:style="{width:'300px', opacity:'0.8'}" v-model="panel_state")
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

  export default {
    name: "TemplateLegend",
    mixins: [],
    components: {},
    props: {
      domain_name: String
    },
    data() {
      // this would add name: "template" to the selected
      // const template_filter_options = Object.assign({}, entrytype_filter_options)
      const templates = object_list2options(
        this.$store.getters["templates/templates_of_domain"](this.domain_name), "title", "slug", true, [{"color": "rules.map.marker_color"}])
      return {
        templates,
        panel_state: false
      }
    },
    computed: {
      selected: {
        get: function () {
          return this.$store.getters["map/get_filter_config"]
            .map(f => this.$_.findIndex(this.templates, t => t.value === f.value))
        },
        set(selected_templates) {
          selected_templates = selected_templates.map(i =>
            Object.assign(
              this.templates[i], {name: "template", "label": "Entrytype"})
          )
          const act_config = this.$store.getters["map/get_filter_config"]
          const new_conf = act_config.filter(conf => conf.name !== "template")
          for (let t of selected_templates) {
            new_conf.push(t)
          }
          this.$store.commit("map/set_filter_config", new_conf)
          this.template2filterlist_config(new_conf)
        }
      }
    },
    created() {
      if (this.$_.isEmpty(this.selected.length === 0)) {
        const domain_data = this.$store.getters["domain_by_name"](this.domain_name)
        const overlay_menu = this.$_.get(domain_data, "map.overlay_menu")
        if (overlay_menu) {
          const legend = this.$_.find(overlay_menu, m => m.name === "legend")
          if (legend) {
            const default_value = this.$_.get(legend, "attr.default")
            this.selected = default_value.map(v => (this.$_.findIndex(this.templates, t => t.value === v)))
          }
        }
      }
    },
    methods: {
      change(selected_templates) {
        // console.log(selected_templates)
        selected_templates = selected_templates.map(i =>
          Object.assign(
            this.templates[i], {name: "template", "label": "Entrytype"})
        )
        const act_config = this.$store.getters["map/get_filter_config"]
        const new_conf = act_config.filter(conf => conf.name !== "template")
        for (let t of selected_templates) {
          new_conf.push(t)
        }
        this.$store.commit("map/set_filter_config", new_conf)
        this.template2filterlist_config(new_conf)
      },
      force_close() {
        this.panel_state = false
      },
      template2filterlist_config(config) {
        console.log(config)
        const act_config = this.$store.getters["search/get_act_config"].filter(cf => cf.name !== "template")
        // console.log(act_config)
          act_config.push({
            name:"template",
            t_label:"w.entrytype",
            value: config.map(cf => cf.value),
            text: config.map(cf => cf.text).join(", ")
          })
        this.$store.commit("search/set_act_config", act_config)
        // [{"name":"template","t_label":"w.entrytype","value":["local_observation"],"text":"Local Observation"}]
      }
    }
  }
</script>

<style scoped>

</style>
