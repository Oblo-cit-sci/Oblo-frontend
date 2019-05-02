<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    TreleafPicker2(:tree="$store.state.liccis")

    v-dialog(width="500")
      template(v-slot:activator="{ on }")
        v-btn(color="red lighten-2" dark v-on="on") Click Me
      TreleafPicker2(:tree="$store.state.liccis" v-on:selected="selected")
</template>

<script>

  import TreleafPicker2 from "../components/TreleafPicker";

  export default {
    name: "Tests",
    components: {
      TreleafPicker2
    },
    methods: {
      selected(selected_val) {
        console.log("YIPPI", selected_val);
      }
    }
  }
</script>

<style scoped>

</style>
