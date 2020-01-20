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
    div(v-if="entry")
      div Select mode
        SingleSelect(:options="mode_options"  :select_sync="true" :selection.sync="mode" force_view="radiogroup" :only_value="true")
      div(v-if="mode==='view'")
        EntryAspectView(:entry="entry")
      div(v-else-if="mode==='edit'")
        div(v-for="(a, index) in aspects" :key="a.aspect.name")
          Title_Description(:title="a.aspect.name + ' (' + a.aspect.type + ')'")
          v-btn(@click="delete_aspect(a)" small icon)
            v-icon {{a.del ? 'mdi-undo' : 'mdi-delete-outline'}}
          v-textarea(v-if="!a.del"
            :rules="[jsonparse]"
            @click:append="undo(index)"
            append-icon="mdi-undo"
            outlined auto-grow
            v-model="a.value"
            :background-color="dirty[index] ? 'amber lighten-1' : ''")
</template>

<script>
    import Title_Description from "../components/Title_Description";
    import SingleSelect from "../components/input/SingleSelect";
    import {create_entry} from "../lib/entry";
    import EntryAspectView from "../components/EntryAspectView";
    import {mapGetters} from "vuex"
    import {object_list2options, string_list2options} from "../lib/options";
    import {ENTRYTYPES_TYPE} from "../lib/store_consts";


    export default {
        name: "CreateEntryType",
        components: {EntryAspectView, SingleSelect, Title_Description},
        mixins: [],
        data() {
            return {
                existing_types: [],
                mode_options: string_list2options(['edit', 'view', 'mixed']),
                mode: "view",
                entry: null,
                aspects: []
            }
        },
        created() {
            this.existing_types = object_list2options(Array.from(this.$store.state.entry_types.values()), "title", "slug", true)
        },
        methods: {
            select_exisisting(event) {
                this.entry = create_entry(this.$store, event)
                this.aspects = this.$_.map(this.entry_type.content.aspects, a => {
                    return {
                        aspect: a,
                        value: JSON.stringify(a, null, 2),
                        orig_ref: JSON.stringify(a).replace(/\s/g, ""),
                        del: false
                    }
                })
            },
            undo(index) {
                this.aspects[index].value = JSON.stringify(this.entry_type.content.aspects[index], null, 2)
            },
            jsonparse(value) {
                try {
                    JSON.parse(value)
                } catch (e) {
                    return e.message
                }
                return true
            },
            delete_aspect(aspect) {
              aspect.del = !aspect.del
            }
        },
        computed: {
            entry_type() {
                return this.$store.getters[ENTRYTYPES_TYPE](this.entry.type_slug)
            },
            dirty() {
                return this.$_.map(this.aspects, a => {
                    return a.value.replace(/\s/g, "") !== a.orig_ref
                })
            }
        }
    }
</script>

<style scoped>

</style>
