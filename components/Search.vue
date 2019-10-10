<template lang="pug">
    div
        v-autocomplete(
            label="Components"
            :items="components")
</template>

<script>
    export default {
        name: "Search",
        props:{},
        data() {
            return {
                components: [
                    'Autocompletes', 'Comboboxes', 'Forms', 'Inputs', 'Overflow Buttons', 'Selects', 'Selection Controls', 'Sliders', 'Textareas', 'Text Fields',
                ],
            }
        },
        created() {},
        mounted() {},
        methods: {},
        watch: {},
        computed: {},
    }
</script>
<style scoped>

</style>