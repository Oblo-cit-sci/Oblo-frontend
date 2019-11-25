<template lang="pug">
  div
    div(v-if="has_note")
      v-textarea(
        :value="note"
        outlined
        single-line
        auto-grow
        @input="update_note($event)")

    v-btn(v-else icon @click="add_note")
      v-icon(@click="update_note('')") mdi-pencil
</template>

<script>
    import TextLongAspect from "./aspects/TextLongAspect";

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
            return {
            }
        },
        created() {

        },
        computed: {
            note() {
                //console.log(this.$store.getters["entrytypes/note"](this.aspect_descr_loc))
                return this.$store.getters["entrytypes/note"](this.aspect_descr_loc)
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
                //console.log(note)
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
