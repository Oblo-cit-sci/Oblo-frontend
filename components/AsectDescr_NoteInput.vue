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
    import {ENTRYTYPES_ADD_NOTE, ENTRYTYPES_INIT_ASPECT_NOTE, ENTRYTYPES_NOTE} from "../store/entrytypes";

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
                //console.log("update")
                const note = this.$store.getters[ENTRYTYPES_NOTE](this.aspect_descr_loc)
                if(note === undefined) {
                    this.$store.commit(ENTRYTYPES_INIT_ASPECT_NOTE, this.aspect_descr_loc)
                    return null
                }
                return note
            },
            has_note() {
                return this.note !== null
            }
        },
        methods: {
            update_note(note) {
                this.$store.commit(ENTRYTYPES_ADD_NOTE, {
                    note_location: this.aspect_descr_loc,
                    note: note
                })
                // ugly fix, for chromi not calling this.note
                // console.log(this.$store.getters[ENTRYTYPES_NOTE](this.aspect_descr_loc))
                // console.log(this.note)
            }
        },
        watch: {}
    }
</script>

<style scoped>

</style>
