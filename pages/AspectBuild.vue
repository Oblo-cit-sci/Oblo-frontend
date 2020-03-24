<template lang="pug">
  div
    div Entry types
    v-select(:items="etypes" v-model="selection.etype")
    div
      div Aspect
      v-select(:items="aspects_options" :disabled="!selection.etype" v-model="selection.aspect")
    v-textarea(v-model="input" solo autoGrow)
    v-btn(@click="build") build
    div(v-if="testmode")
      Aspect(
        :aspect="aspect"
        v-bind:value.sync="values"
        mode="edit"
        :extra="{}")
</template>

<script>
    import Aspect from "../components/Aspect";
    import {TEMPLATES_TYPE, TEMPLATES_TYPENAME} from "../store/templates";
    export default {
        name: "EntryTypeCreate",
      components: {Aspect},
      data() {
          return {
            input: "",
            aspect: {},
            testmode: false,
            values: {value: null},
            etypes: [],
            selection: {etype: null, aspect:null}
          }
      },
      created() {
          this.etypes= this.$_.map(Array.from(this.$store.state.entry_types.values()),
            (et) => {return {"text":et.title, "value": et.slug}})
      },
      methods: {
        build() {
          try {
            const aspect = JSON.parse(this.input)
            this.aspect = aspect
            this.testmode = true
          } catch(err) {
            console.log(err)
          }
        }
      },
      computed: {
        aspects_options() {
          if(this.selection.etype) {
            const etype = this.$store.getters[TEMPLATES_TYPE](this.selection.etype)
            return this.$_.map(etype.aspects,
              (asp) => {
                return {"text":asp.name, "value": asp.name}
              })
          } else return []
        }
      },
      watch: {
        "selection.aspect"(aspect_name) {
          const aspects = this.$store.getters[TEMPLATES_TYPE](this.selection.etype).aspects
          const aspect_desc = this.$_.find(aspects, (a) => a.name === aspect_name)
          this.input = JSON.stringify(aspect_desc, null, 2)
        }
      }
    }
</script>

<style scoped>

</style>
