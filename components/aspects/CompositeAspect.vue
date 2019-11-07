<template lang="pug">
  div
    v-layout(wrap)
      v-flex(
        v-for="(comp_type, index) in aspect.components" :key="index"
        :class="layoutClasses")
        Aspect(
          :aspect="comp_type"
          :aspect_loc="aspect_locs[comp_type.name]"
          :mode="mode"
          :disabled="disabled"
          :extra="comp_extras(comp_type)"
          v-on:entryAction="$emit('entryAction',$event)")
</template>

<script>

    import AspectMixin from "./AspectMixin";
    import Aspect from "../Aspect";
    import {INT, FLOAT, COMPONENT} from "../../lib/consts";
    import {loc_append} from "../../lib/aspect";

    export default {
        name: "CompositeAspect",
        components: {Aspect},
        mixins: [AspectMixin],
        data() {
            return {
                aspect_locs: {}
            }
        },
        created() {
            for (let component of this.aspect.components) {
                this.aspect_locs[component.name] = loc_append(this.aspect_loc, COMPONENT, component.name)
            }
        },
        methods: {
            update_value($event, index) {
                // TODO x
                this.value[index] = $event
                // todo use TitleAspect in meta
                this.value_change(this.value)
            },
            comp_extras(comp_type) {
                let xtra_copy = JSON.parse(JSON.stringify((this.extra || {})))
                // composites in lista dont have title descriptions, their kids should
                // todo not sure what we still need!!
                if (xtra_copy.hasOwnProperty("clear")) {
                    delete xtra_copy.clear
                }
                if (xtra_copy.hasOwnProperty("no_title")) {
                    delete xtra_copy.no_title
                }
                if (xtra_copy.hasOwnProperty("listitem")) {
                    delete xtra_copy.listitem
                }
                return xtra_copy
            }
        },
        computed: {
            layoutClasses() {
                if (this.aspect.components.length === 2 && this.aspect.mode === 'edit') {
                    const comp_types = this.aspect.components.map(c => c.type)
                    if ((comp_types[0] === INT || comp_types[0] === FLOAT) && comp_types[0] === comp_types[1]) {
                        return "xs12 sm6 lg6"
                    }
                }
                return "xs12 lg12"
            }
        }
    }
</script>

<style scoped>
</style>



