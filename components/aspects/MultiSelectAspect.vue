<template lang="pug">
  div(v-if="!readOnly")
    v-select(
      :items="options"
      v-model="selection"
      :readonly="readOnly"
      single-line outlined chips multiple clearable)
  div(v-else)
    v-chip(
        v-for="(item, index) in selection" :key="index"
        class="mr-2 mt-2 mb-4"
      )
      span {{item.text}}
</template>

<script>
    import AspectMixin from "./AspectMixin";
    import SelectMixin from "./SelectMixin";

    export default {
        name: "MultiselectAspect",
        mixins: [AspectMixin, SelectMixin],
        data() {
            return {init: true}
        },
        created() {
            this.set_selection()
        },
        methods: {
            set_selection() {
                if (this.value !== null) {
                    this.selection = this.$_.filter(this.options, (o) => {
                        return this.value.indexOf(o.value) > -1
                    })
                } else {
                    this.init = false
                }
            },
            toString(value) {
                return value.join(", ") || ""
            }
        },
        watch: {
            selection() {
                //console.log("multi-select", this.selection, this.init)
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
