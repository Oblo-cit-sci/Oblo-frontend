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
        this.$store.getters["templates/templates_of_domain"](this.domain_name),
        "title", "slug", true,
        [{"color": "rules.map.marker_color"}])
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
            return search_conf.value.map(f => this.$_.findIndex(this.templates, t => t.value === f))
          }
        },
        set(selected_templates) {
          console.log("setting", selected_templates)
          // todo t_label?
          selected_templates = selected_templates.map(i =>
            Object.assign(
              this.templates[i], {name: TEMPLATE, "t_label": "w.entrytype"})
          )
          const act_config = this.$store.getters["search/get_act_config"]
          const new_conf = act_config.filter(conf => conf.name !== TEMPLATE)
          for (let t of selected_templates) {
            new_conf.push(t)
          }
          // this.$store.commit("map/set_filter_config", new_conf)
          this.template2filterlist_config(new_conf)
        }
      }
    },
    methods: {
      force_close() {
        this.panel_state = false
      },
      template2filterlist_config(config) {
        const act_config = this.$_.cloneDeep(this.$store.getters["search/get_act_config"])
        let template_config = act_config.find(cf => cf.name === "template")
        if (!template_config) {
          act_config.unshift({
            name: "template",
            t_label: "w.entrytype",
            value: config.map(cf => cf.value),
            text: config.map(cf => cf.text).join(", ")
          })
        } else {
          Object.assign(template_config, {
            value: config.map(cf => cf.value),
            text: config.map(cf => cf.text).join(", ")
          })
        }
        console.log("legend update search config")
        this.$store.commit("search/set_act_config", act_config)
      }
    }
  }
</script>

<style scoped>

</style>
