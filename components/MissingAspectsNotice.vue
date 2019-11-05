<template lang="pug">
  div
    b Missing or incomplete aspects:
    .required_aspect.red--text(v-for="(aspect, i) in missing" :key="i") {{aspect}}
</template>

<script>
    import EntryMixin from "./EntryMixin";
    import {aspect_raw_default_value} from "../lib/aspect";
    import {pack} from "../node_modules_/csso/lib/replace/Number";
    import {COMPOSITE, ENTRYLIST, LIST} from "../lib/consts";
    import {item_count_name} from "../lib/listaspects";


    const OK = 0
    const MISSING = 1
    const LIST_NOT_ENOUGH = 2
    const COMPOSITE_INCOMPLETE = 3

    export default {
        name: "MissingAspectsNotice",
        props: {
            entry: {
                type: Object,
                required: true
            }
        },
        mixins: [EntryMixin],
        components: {},
        data() {
            return {}
        },
        computed: {
            missing() {
                const aspects = this.entry_type.content.aspects
                let missing = []
                for (let aspect of aspects) {
                    let required = aspect.attr.required || true
                    if (required) {
                        // todo, value thing not so elegant...
                        const a_w_value = this.entry.aspects_values[aspect.name] || pack(null)
                        const a_value = a_w_value.value
                        const validation = this.validate_aspect(aspect, a_value)
                        let add_text = ""
                        if (validation === MISSING) {
                            add_text = aspect.name + " missing"
                        } else if (validation === LIST_NOT_ENOUGH) {
                            add_text = aspect.name + " requires more " + item_count_name(aspect, a_value.length) + " (" + a_value.length + "/" + aspect.attr.min + ")"
                        } else if (validation === COMPOSITE_INCOMPLETE) {
                            add_text = aspect.name + " is not complete"
                        }
                        if(add_text) {
                            if(this.has_pages) {
                                let page = (aspect.attr.page || 0) + 1
                                add_text += `, page: ${page}`
                            }
                            missing.push(add_text)
                        }
                    }
                }
                return missing
            }
        },
        methods: {
            validate_aspect(aspect, raw_value) {
                const a_default = aspect_raw_default_value(aspect)
                if (raw_value === a_default) {
                    return MISSING
                } else if ([LIST, ENTRYLIST].includes(aspect.type)) {
                    if (aspect.attr.min !== null && raw_value.length < aspect.attr.min) {
                        return LIST_NOT_ENOUGH
                    }
                } else if (aspect.type === COMPOSITE) {
                    let component_validations = {}
                    for (let component of aspect.components) {
                        component_validations[component.name] = this.validate_aspect(component, raw_value[component.name].value || null)
                    }
                    if (this.$_.find(Object.values(component_validations), c => c !== OK)) {
                        return COMPOSITE_INCOMPLETE
                    }
                }
                // default
                return OK
            }
        },
        watch: {}
    }
</script>

<style scoped>

  .required_aspect {
    margin: 1% 0 0 0;
  }
</style>
