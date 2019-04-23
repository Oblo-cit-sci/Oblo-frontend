<template lang="pug">
  div
    h3 License & Visibility
    div(v-if="$store.getters.visitor")
      div as a visitor your contributions will be licensed under {{selectedLicense}}.
      div
        img.license-image(:src="licenseImagePath")
      // div Please set the name you want the attribution to be given to
      // TextShort(:aspect="{name:'Attribution name'}"  v-on:update="aspect_value")
</template>

<script>
  import TextShort from "./aspectInput/TextShort";


  export default {
    name: "License",
    components: {TextShort},
    data() {
      return {
        selectedLicense: null,
        set_name: ""
      }
    },
    created() {
      this.selectedLicense = this.$store.state.user_data.defaultLicense;
    },
    computed: {
      licenseImagePath() {
        return this.$store.state.codes.licenses[this.$store.state.user_data.defaultLicense].icon
      }
    },
    methods: {
      aspect_value(aspect) {
        console.log(aspect)
      }
    }
  }
</script>

<style scoped>

  .license-image {
    display: block;
    margin: 2% auto;
  }
</style>
