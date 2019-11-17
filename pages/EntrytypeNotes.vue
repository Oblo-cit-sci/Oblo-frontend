<template lang="pug">
  v-layout(justify-center)
    v-flex(xs12 md8)
      SingleSelect(
        v-if="type_select"
        :options="options"
        force_view="list"
        @selection="selection($event)"
        :select_sync="false"
        :highlight="false"
        :create="true")
      div(v-if="entry_notes")
        div(v-for="(aspect,index) in entry_aspects" :key="aspect.key")
          div(v-if="divider_after(index)")
            v-divider
            h2 {{page_title(index)}}
          AspectDescription(:aspect="aspect" :loc="aspect_descr_loc(aspect)")

</template>

<script>

    import SingleSelect from "../components/SingleSelect";
    import AspectDescription from "../components/AspectDescription";
    import {ENTRY_TYPE} from "../lib/store_consts";

    const TYPE_SELECT = "type_select"
    const ENTRY_NOTES = "entry_notes"

    export default {
        name: "EntrytypeNotes",
        mixins: [],
        components: {AspectDescription, SingleSelect},
        props: {},
        data() {
            return {
                state: TYPE_SELECT,
                selectec_type: null
            }
        },
        created() {

        },
        computed: {
            options() {
                return this.$_.map(this.$store.getters.global_entry_types_as_array, o => {
                    return {
                        text: o.title,
                        value: o.slug,
                        description: o.description,
                    }
                })
            },
            type_select() {
                return this.state === TYPE_SELECT
            },
            entry_notes() {
                return this.state === ENTRY_NOTES
            },
            entry_type() {
              return this.$store.getters[ENTRY_TYPE](this.selectec_type)
            },
            entry_aspects() {
                return this.entry_type.content.aspects
            },
            has_pages() {
                // todo duplicate entryMixin
                return this.entry_type.content.meta.hasOwnProperty("pages")
            }
        },
        methods: {
            selection(type) {
                this.selectec_type = type.value
                this.state = ENTRY_NOTES
                this.init_typenotes(this.selectec_type)
            },
            init_typenotes(type_slug) {
                let notes = this.$store.getters["entrytypes/type_notes"](type_slug)
                if(!notes) {
                    this.$store.dispatch("entrytypes/init_notes", type_slug)
                }
            },
            page(index) {
                return this.entry_aspects[index].attr.page || 0
            },
            divider_after(index) {
                return this.has_pages && index === 0 || (index > 1 &&
                    this.page(index) !== this.page(index - 1))
            },
            page_title(index) {
                return this.entry_type.content.meta.pages[this.page(index)].title
            },
            aspect_descr_loc(aspect) {
                console.log([this.selectec_type, aspect.name])
                return [this.selectec_type, aspect.name]
            }
        },
        watch: {}
    }
</script>

<style scoped>

</style>
