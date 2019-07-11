<template lang="pug">
  div
    Title_Description(title="Create new entrytypes" header_type="h1")
    div
      h4 Load a existing type
      SingleSelect(
        :options="existing_types"
        :select_sync="false"
        @selection="select_exisisting($event)"
        :only_value="true")
    div Select mode
      SingleSelect(:options="mode_options"  :selection="mode" force_view="RADIOGROUP" :only_value="true")
    div(v-for="aspect in aspects" :key="aspect.name")
      Aspect(
        :aspect="aspect"
        v-bind:value="entry.aspects_values[aspect.name]"
        v-on:update:value="update_value(aspect, $event)"
        v-on:entryAction="entryAction($event)"
        :id="aspect_id(aspect.name)"
        mode="edit"
        :extra="extras[aspect.name]"
        :extra_update="extras_update[aspect.name]")
</template>

<script>
  import Title_Description from "../components/Title_Description";
  import SingleSelect from "../components/SingleSelect";
  import {object_list2options, string_list2options} from "../lib/client";
  import Aspect from "../components/Aspect";
  import {create_entry} from "../lib/entry";
  import {ASPECT} from "../lib/consts";

  export default {
    name: "EntryType",
    components: {Aspect, SingleSelect, Title_Description},
    mixins: [],
    data() {
      return {
        existing_types: [],
        mode_options: string_list2options(['edit', 'view', 'mixed']),
        mode: "view",
        dirty: false,
        //
        //
        entry_type: null,
        aspects: [],
        entry: null,
        //aspects_values: {},
        extras: {},
        extras_update: {}
      }
    },
    created() {
      this.existing_types = object_list2options(Array.from(this.$store.state.entry_types.values()), "title", "slug", true)
    },
    methods: {
      update_value(aspect, event) {

      },
      entryAction(event) {

      },
      aspect_id(name) {
        return name
      },
      select_exisisting(event) {
        if(this.dirty) {
          console.log("select_existing -- dirty todo popup ask")
        }
        this.entry_type = this.$store.getters.entry_type(event)
        this.aspects = this.entry_type.content.aspects
        this.entry = create_entry(this.$store, event)

        for (let aspect of this.aspects) {
          let extra_props = {}
          extra_props.aspect_loc = [[ASPECT, aspect.name]]
          /*if (condition_targets.indexOf(aspect.name)) {
            extra_props.condition = {
              value: null
            }
          }*/
          this.extras[aspect.name] = extra_props
          this.extras_update[aspect.name] = false
        }

        console.log(this.entry_type)
      }
    }
  }
</script>

<style scoped>

</style>
