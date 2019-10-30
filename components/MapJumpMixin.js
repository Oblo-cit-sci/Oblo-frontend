
export default {
      name: "MapJumpMixin",
      mixins: [],
      components: {},
      props: {

      },
      data() {
          return {

          }
      },
      created() {

      },
      computed: {
        // works only for entries, not aspects
        has_action_goto_location() {
          return this.entry.location && this.actions.includes('goto_location')
        },
      },
      methods: {

      },
      watch: {

      }
}
