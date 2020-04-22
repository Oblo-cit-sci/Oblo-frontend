<template lang="pug">
  div {{name}}
    div(v-if="select_multiple")
      MultiselectAspect(:options="options")
    div(v-else)
      SingleSelect(:options="options" force_view="select" :selection.sync="selection" :placeholder="placeholder")
</template>

<script>

    import SingleSelect from "./input/SingleSelect";
    import MultiselectAspect from "~/components/aspects/MultiSelectAspect"

    export default {
        name: "FilterSelect",
        components: {MultiselectAspect, SingleSelect},
        props: {
            name: {
                type: String,
                required: true
            },
            label: {

            },
            options: {
                type: String,
                required: true
            },
            select_multiple: Boolean,
            init_selection: Object,
            placeholder: String
        },
        data() {
            return {
                selection: null
            }
        },
        created() {
            if(this.init_selection){
                this.selection = this.init_selection
            }
        },
        computed: {
        },
        methods: {},
        watch: {
            selection(event) {
                this.$emit('update:selection', event)
            }
        }
    }
</script>

<style scoped>

</style>
