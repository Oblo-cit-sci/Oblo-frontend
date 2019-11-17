<template lang="pug">
  div
    div(v-if="has_note") n: {{note}}
    div(v-else)
      v-textarea(v-if="show_input" @input="update_note($event)")
      v-btn(v-else @click="add_note") add note
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
          return {
            show_input: false
          }
      },
      created() {

      },
      computed: {
        note() {
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
              console.log(note)
              this.$store.commit("entrytypes/add_note", {
                  note_location: this.aspect_descr_loc,
                  note: note
              })
          }
      },
      watch: {

      }
}
</script>

<style scoped>

</style>
