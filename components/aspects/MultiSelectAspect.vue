<template lang="pug">
  div
    v-select(
      :items="options"
      v-model="selection"
      :readonly="readOnly"
      single-line outlined chips multiple)
</template>

<script>
    import AspectMixin from "./AspectMixin";
    import SelectMixin from "./SelectMixin";

    // //@change="change($emit)"
    export default {
        name: "MultiselectAspect",
        mixins: [AspectMixin, SelectMixin],
        data() {
            return {init: true}
        },
        created() {
            //this.set_selection()
            this.set_selection()
        },
        methods: {
            set_selection() {
                console.log(this.value)
                if (this.value !== null) {
                    this.selection = this.$_.filter(this.options, (o) => {
                        return this.value.indexOf(o.value) > -1
                    })
                }
                console.log("Set sel", this.value)
            },
            toString(value) {
                return value.join(", ") || ""
            }
        },
        watch: {
            selection() {
                console.log("multi-select", this.selection)
                if(this.init) {
                    this.init = false
                    return
                }
                if (this.selection === null)
                    this.value_change(null)
                else {
                    this.value_change(this.selection)
                }
            }
        }
    }
</script>

<style scoped>

</style>
