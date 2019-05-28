<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    DecisionDialog(v-bind="dialog_props" v-bind:open.sync="dialog_props.open" @action="action($event)")
    v-btn(@click="dialog_props.open = true") open
</template>

<script>

  import DecisionDialog from "../components/DecisionDialog";

  const ld = require("lodash")

  export default {
    name: "Tests",
    components: {DecisionDialog},
    created() {
      this.options = ld.map(this.$store.state.codes["liccis_flat"], (l) => {
        return {
          text: l,
          value: l
        }
      })
      this.selected = []
      //this.options =this.$store.state.codes["liccis_flat"]
    },
    data() {
      return {
        options: [],
        dialog_props: {
          name: "delete",
          open: false,
          title: "do something",
          text: "really?",
          confirm_text: "jupp",
          cancel_text: "noooo"
        }
        //selected: []
      }
    },
    methods: {
      action(selected_val) {
        console.log(selected_val)
      }
    }
  }
</script>

<style scoped>

</style>
