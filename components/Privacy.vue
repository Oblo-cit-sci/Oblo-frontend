<template lang="pug">
  div
    h3 Privacy
    div(v-if="$store.getters.visitor")
      div
        span As a visitor your contributions will be
        span.public_text_clr &nbsp{{ $store.state.user_data.defaultPrivacy }}&nbsp
        span after being reviewed
    div(v-else)
      div you selected the privacy: {{selectedPrivacy.title}}.
      v-switch(v-model="use_alternative_privacy" :label="privacy_selection" color="red")
      Selector(v-if="use_alternative_privacy"  v-bind:options="privacy_options" v-bind:selection.sync="selectedPrivacy")
</template>

<script>
  import Selector from "./Selector";

  export default {
    name: "Privacy",
    props: {
      overwrite_default: { // for drafts
        type: Object,
        required: false
      }
    },
    components: {Selector},
    data() {
      return {
        privacy_options: [
          {title: "public"},
          {title: "private"}],
        selectedPrivacy: null,
        use_alternative_privacy: false
      }
    },
    created() {
      if(!this.overwrite_default)
        this.set_to_default();
      else { // for drafts
        this.selectedPrivacy = this.overwrite_default;
        this.use_alternative_privacy = this.selectedPrivacy.title !==  this.$store.state.user_data.defaultPrivacy;
      }
    },
    computed: {
      privacy_selection() {
        return this.use_alternative_privacy ? "use different privacy" : "default privacy" ;
      }
    },
    methods: {
      set_to_default() {
        this.selectedPrivacy = {title: this.$store.state.user_data.defaultPrivacy};
      }
    },
    watch: {
      selectedPrivacy(new_val) {
        //console.log("selection privacy", new_val);
        this.$emit("update:selectedPrivacy", new_val.title);
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
