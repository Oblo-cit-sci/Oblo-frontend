<template lang="pug">
  div
    h3 Validation
    b(v-if="has_missing") Missing or incomplete aspects:
    div(v-else) All values in this entryseem ok
    .required_aspect.red--text(v-for="(aspect, i) in missing" :key="i") {{aspect}}
</template>

<script>
    import EntryMixin from "./EntryMixin";
    import {aspect_raw_default_value, disabled_by_condition, label, loc_append, pack_value} from "../lib/aspect";
    import {ASPECT, COMPONENT, COMPOSITE, EDIT, ENTRYLIST, LIST} from "../lib/consts";
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
                    let required = true
                    if (aspect.attr.hasOwnProperty("required")) {
                        required = aspect.attr.required
                    }
                    if (required) {
                        // todo, value thing not so elegant...
                        const a_w_value = this.entry.aspects_values[aspect.name] || pack_value(null)
                        //console.log(a_w_value)
                        const a_value = a_w_value.value
                        const base_aspect_loc = loc_append([[EDIT, this.entry.uuid]], ASPECT, aspect.name)
                        const validation = this.validate_aspect(aspect, a_w_value, base_aspect_loc)
                        let add_text = ""
                        const aspect_label = label(aspect)
                        if (validation === MISSING) {
                            add_text = aspect_label + " missing"
                        } else if (validation === LIST_NOT_ENOUGH) {
                            add_text = aspect_label + " requires more " + item_count_name(aspect, a_value.length) + " (" + a_value.length + "/" + aspect.attr.min + ")"
                        } else if (validation === COMPOSITE_INCOMPLETE) {
                            add_text = aspect_label + " is not complete"
                        }
                        if (add_text) {
                            if (this.has_pages) {
                                let page = (aspect.attr.page || 0) + 1
                                add_text += `, page: ${page}`
                            }
                            missing.push(add_text)
                        }
                    }
                }
                return missing
            },
            has_missing() {
                return this.missing.length > 0
            }
        },
        methods: {
            validate_aspect(aspect, a_w_value, aspect_loc) {
                //console.log(aspect.name, a_w_value)
                const raw_value = a_w_value.value
                //console.log(raw_value)
                if (a_w_value.hasOwnProperty("regular") && a_w_value.regular === false) {
                    aspect = aspect.attr.alternative
                }
                //console.log("val", aspect.name, aspect_loc)
                const a_default = aspect_raw_default_value(aspect)
                if (aspect.attr.IDAspect) {
                    return OK
                }
                if (disabled_by_condition(this.$store, aspect, aspect_loc)) {
                    return OK
                }
                if (!raw_value) {
                    return MISSING
                }
                if (raw_value === a_default) {
                    return MISSING
                } else if ([LIST, ENTRYLIST].includes(aspect.type)) {
                    if (aspect.attr.min !== null && raw_value.length < aspect.attr.min) {
                        return LIST_NOT_ENOUGH
                    }
                } else if (aspect.type === COMPOSITE) {
                    let component_validations = {}
                    for (let component of aspect.components) {
                        const comp_loc = loc_append(aspect_loc, COMPONENT, component.name)
                        //console.log("-> comp", component.name, raw_value[component.name])
                        component_validations[component.name] = this.validate_aspect(component, raw_value[component.name] || pack_value(null), comp_loc)
                    }
                    //console.log(component_validations)
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
