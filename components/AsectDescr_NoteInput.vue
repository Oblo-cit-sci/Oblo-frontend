<template lang="pug">
  div
    div(v-if="has_note")
      v-textarea(
        :value="note"
        outlined
        single-line
        auto-grow
        @input="update_note($event)")

    v-btn(v-else icon @click="update_note('')")
      v-icon() mdi-pencil
</template>

<script>
    import TextLongAspect from "./aspects/TextLongAspect";
    import {ENTRYTYPES_NOTES} from "../lib/store_consts";

    export default {
        name: "AsectDescr_NoteInput",
        mixins: [],
        components: {TextLongAspect},
        props: {
            aspect_descr_loc: {
                type: Array
            }
        },
        data() {
            return {}
        },
        created() {

        },
        computed: {
            note() {
                console.log("update")
                return this.$store.getters[ENTRYTYPES_NOTES](this.aspect_descr_loc)
            },
            has_note() {
                return this.note !== null
            }
        },
        methods: {
            add_note() {
                this.show_input = true
            },
            update_note(note) {
                this.$store.commit("entrytypes/add_note", {
                    note_location: this.aspect_descr_loc,
                    note: note
                })
            }
        },
        watch: {}
    }
</script>

<style scoped>

</style>
