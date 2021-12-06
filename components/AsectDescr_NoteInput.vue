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

    export default {
        name: "AsectDescr_NoteInput",
        mixins: [],
        components: {},
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
                const note = this.$store.getters["templates/note"](this.aspect_descr_loc)
                if(note === undefined) {
                    this.$store.commit(TEMPLATES_INIT_ASPECT_NOTE, this.aspect_descr_loc)
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
                this.$store.commit(TEMPLATES_ADD_NOTE, {
                    note_location: this.aspect_descr_loc,
                    note: note
                })
                // ugly fix, for chromi not calling this.note
                // console.log(this.$store.getters["templates/note"](this.aspect_descr_loc))
                // console.log(this.note)
            }
        },
        watch: {}
    }
</script>

<style scoped>

</style>
