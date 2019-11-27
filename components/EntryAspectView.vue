<template lang="pug">
  div(v-if="entry")
    div(v-for="(aspect) in shown_aspects" :key="aspect.name")
      Aspect(
        :aspect="aspect"
        :mode="mode"
        :aspect_loc="aspect_locs[aspect.name]"
        v-on:entryAction="entryAction($event)")
</template>

<script>

    import {ASPECT, ENTRY, VIEW} from "../lib/consts";
    import Aspect from "./Aspect";
    import {ENTRYTYPES_TYPE, ENTRYTYPES_TYPENAME} from "../lib/store_consts";

    export default {
        name: "EntryAspectView",
        components: {Aspect},
        props: {
            entry: {
                type: Object
            },
            mode: {
                type: String,
                default: VIEW
            }
        },
        data() {
            return {
                page: this.$route.query.page | 0,
               // aspect_locs: {}
            }
        },
        computed: {
            entry_type() {
                return this.$store.getters[ENTRYTYPES_TYPE](this.entry.type_slug)
            },
            shown_aspects() {
                if (this.has_pages) {
                    return this.$_.filter(this.entry_type.content.aspects, (a) => {
                        return (this.page === 0 && (a.attr.page === 0 || a.attr.page === undefined) ||
                            (this.page > 0 && a.attr.page === this.page))
                    })
                }
                return this.entry_type.content.aspects
            },
            aspect_locs() {
                let result = {}
                this.entry_type.content.aspects.forEach(aspect => {
                    result[aspect.name] = [[ENTRY, this.entry.uuid], [ASPECT, aspect.name]]
                })
                return result
            },
            has_pages() {
                this.entry_type.content.meta.hasOwnProperty("pages")
            }
        },
        methods: {
            entryAction(event) {
                console.log("unprocessed entryAction", event)
            }
        },
        watch: {
            entry() {
                /*this.aspect_locs = {}
                this.entry_type.content.aspects.forEach(aspect => {
                    this.aspect_locs[aspect.name] = [[ENTRY, this.entry.uuid], [ASPECT, aspect.name]]
                })*/
            }
        }
    }
</script>

<style scoped>

</style>
