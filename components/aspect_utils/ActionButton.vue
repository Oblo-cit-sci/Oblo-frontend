<template lang="pug">
  v-btn(
    color="warning"
    :loading="in_progress"
    rounded
    @click="trigger") {{action_title}}
    v-icon() {{icon}}
</template>

<script>
    import {get_action} from "../../lib/aspect_actions";

    export default {
        name: "ActionButton",
        props: {
            action_title: {
                type: String,
                required: true
            },
            action_name: {
                type: String,
                required: true
            },
            icon: {
                type: String
            },
            options: {
                type: Object,
                default: () => {
                }
            }
        },
        data() {
            return {
                in_progress: false
            }
        },
        created() {

        },
        computed: {},
        methods: {
            trigger() {
                this.in_progress = true
                get_action(this.action_name)(this.options).then(res => {
                    console.log(res)
                    this.in_progress = false
                }).catch(err => {
                    console.log(err)
                    this.in_progress = false
                })
            }
        },
        watch: {}
    }
</script>

<style scoped>

</style>
