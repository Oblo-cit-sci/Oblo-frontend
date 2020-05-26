<template lang="pug">
  div
    AspectDialog(:aspect="domains" :dialog_open="dialog_open" show_aspect @update:ext_value="select($event)")
    Aspect(:aspect="o_a" :ext_value="val")
    v-btn(@click="test") test
</template>

<script>

  import AspectDialog from "~/components/aspect_utils/AspectDialog"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
  import OptionsAspect from "~/components/aspects/OptionsAspect"
  import Aspect from "~/components/Aspect"

  import pkg from "~/package"

  export default {
    name: "Tests",
    mixins: [TriggerSnackbarMixin],
    components: {Aspect, OptionsAspect, AspectDialog},
    created() {
    },
    data() {
      return {
        val: {value: null},
        o_a: {
          name: "OA",
          type: "options",
          attr: {},
          options: [
            {
              name: "A",
              type: "str",
              attr: {max: 90}
            }, {
              name: "B",
              type: "str",
              attr: {max: 90}
            }
          ]
        },
        selected_domain: {value: null},
        dialog_open: true,
        domains: {
          name: "Domains",
          type: "select",
          attr: {
            force_view: "grid",
          },
          items: [
            {value: "licci", text: "LICCI", icon: "images/domains/licci/icon.png"},
            {value: "conecte", text: "Conecte", icon: "images/domains/conecte/icon.png"},
          ]
        }
      }
    },
    computed: {},
    methods: {
      test() {
        this.ok_snackbar(pkg.version)
      },
      select(domain) {
        console.log("selected", domain)
        this.dialog_open = false
        this.ok_snackbar("cool")
      },
      trigger() {
        this.ok_snackbar("yippi" + (Math.random() * 1000))
      }
    },
    watch: {
      selected_domain(domain) {
        console.log("selected", domain)
        this.dialog_open = false
      }
    }
  }
</script>

<style scoped>

</style>
