<template lang="pug">
  v-flex(xs12='' sm8='' md6='')

    v-text-field(v-model="searchLicci" flat clearable)
    v-treeview(:items="options.children" item-key="name" :search="searchLicci" open-on-click activatable)
</template>

<script>

  import TreleafPicker2 from "../components/TreleafPicker";
  import Licci from "../components/aspectInput/special/Licci";

  export default {
    name: "Tests",
    components: {
      Licci,
      TreleafPicker2
    },
    created() {
      this.options = this.$store.state.codes["liccis"];
    },
    data() {
      return {
        searchLicci: ""
      }
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
