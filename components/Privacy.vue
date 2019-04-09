<template lang="pug">
  div
    div(v-if="$store.getters.visitor")
      div
        span As a visitor your contributions will be
        span.public_text_clr &nbsp{{ $store.state.user_data.defaultPrivacy }}&nbsp
        span after being reviewed
    div(v-else)
      Selector(v-bind:options="privacy_options" v-bind:selection.sync="selection")
</template>

<script>
  import Selector from "./Selector";

  export default {
    name: "Privacy",
    components: {Selector},
    data() {
      return {
        privacy_options: [
          {title: "public"},
          {title: "private"}],
        selection: null
      }
    },
    watch: {
      selection(new_val, old_val) {
        console.log("SEL changed", new_val);
      }
    }
  }
</script>

<style scoped>
  .public_text_clr {
    font-weight: bold;
    color: green;
  }
</style>
