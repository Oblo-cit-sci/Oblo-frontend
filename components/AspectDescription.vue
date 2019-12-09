<template lang="pug">
  div
    Title_Description(
      v-if="show_title_description"
      v-bind="title_description")
    AsectDescr_NoteInput(:aspect_descr_loc="loc")
    .pl-3
      AspectDescription(v-for="aspect in children" :key="aspect.name"
      :aspect="aspect" :loc="aspect_descr_loc(aspect)")
</template>

<script>
    import Title_Description from "./Title_Description";
    import {label} from "../lib/aspect";
    import {COMPOSITE, EDIT, LIST} from "../lib/consts";
    import AsectDescr_NoteInput from "./AsectDescr_NoteInput";

    export default {
        name: "AspectDescription",
        mixins: [],
        components: {AsectDescr_NoteInput, Title_Description},
        props: {
            aspect: {
                type: Object,
                required: true
            },
            loc: {
                type: Array,
                required: true
            },
            show_title_description: {
                type: Boolean,
                default: true
            },
            additional_component: {
                type: String
            }
        },
        data() {
            return {}
        },
        computed: {
            title_description() {
                return {
                    title: label(this.aspect),
                    description: this.aspect.description || "",
                    mode: EDIT
                }
            },
            children() {
                if(this.aspect.type === LIST) {
                    return [this.aspect.items]
                } else if(this.aspect.type === COMPOSITE) {
                    return this.aspect.components
                } else return []
            }
        },
        methods: {
            aspect_descr_loc(component) {
                return this.loc.concat(component.name)
            }
        },
        watch: {}
    }
</script>

<style scoped>

</style>
