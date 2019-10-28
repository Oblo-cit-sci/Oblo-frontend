<template lang="pug">
  v-container(fluid)
    ActionButton(v-bind="loc")
    Footer
</template>

<script>

    import ActionButton from "../components/aspect_utils/ActionButton";
    import Footer from "../components/Footer"

    const dev_loc_action_btn = {
        action_title: "device location",
        action_name: "get_device_location",
        icon: "mdi-crosshairs-gps"
    }


    const ld = require("lodash")

    export default {
        name: "Tests",
        components: {ActionButton, Footer},
        mounted () {
        },
        created() {
        },
        data() {
            return {
                loc: dev_loc_action_btn
            }
        },
        computed: {
        },
        methods: {}
    }
</script>

<style scoped>

</style>
