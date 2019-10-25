<template lang="pug">
  div {{filter_name}}
    div(v-if="select_multiple")
      div
    div(v-else)
      SingleSelect(:options="options" force_view="select" :selection.sync="selection" :placeholder="placeholder")
</template>

<script>

    import SingleSelect from "./SingleSelect";

    export default {
        name: "FilterSelect",
        components: {SingleSelect},
        props: {
            filter_name: {
                type: String,
                required: true
            },
            store_getter: {
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
            options() {
                return this.$store.getters[this.store_getter]
            }
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
