<template lang="pug">
  div
    h3 License
    div(v-if="edit")
      div(v-if="$store.getters.visitor")
        div as a visitor your contributions will be licensed under {{selectedLicense.title}}.
      div(v-else)
        div you selected the license: {{selectedLicense.title}}.
      img.license-image(:src="licenseImagePath")
      div(v-if="!$store.getters.visitor")
        v-switch(v-model="use_alternative_license" :label="license_selection" color="red")
        SingleSelect(
          v-if="use_alternative_license"
          :options="licenseOptions"
          :selection.sync="selectedLicense")
    div(v-else)
      div {{selectedLicense.title}}
      img.license-image(:src="licenseImagePath" )
</template>

<script>
  import TextShort from "./aspectInput/TextShort";
  import SingleSelect from "./SingleSelect";

  import {license_icon} from "../lib/client";
  import {EDIT} from "../lib/consts";

  const ld = require('lodash');

  export default {
    name: "License",
    props: {
      passedLicense: {
        type: String
      },
      mode: {
        type: String,
        default: EDIT
      }
    },
    components: {SingleSelect, TextShort},
    data() {
      return {
        set_name: "",
        use_alternative_license: false,
        selectedLicense: null,
        licenseOptions: ld.map(this.$store.state.codes.licenses, (l) => Object.assign({
          text: l.title,
          value: l.short
        }, l))
      }
    },
    created() {
      if (!this.passedLicense)
        this.set_to_default();
      else { // for drafts
        this.selectedLicense = this.find_from_options(this.passedLicense)
        this.use_alternative_license = this.selectedLicense.value !== this.$store.state.user.user_data.defaultLicense;
      }
    },
    computed: {
      licenseImagePath() {
        return this.selectedLicense ?
          license_icon(this.$axios, this.selectedLicense.svg, this.$store)
          :
          null;
      },
      license_selection() {
        return this.use_alternative_license ? "use different license" : "default license";
      },
      edit() {
        return this.mode === EDIT
      }
    },
    methods: {
      set_to_default() {
        this.selectedLicense = this.find_from_options(this.$store.state.user.user_data.defaultLicense)
      },
      find_from_options(value) {
        return this.$_.find(this.licenseOptions, (l) => l.value === value)
      }
    },
    watch: {
      use_alternative_license(val) {
        if (!val) { // set back to default
          this.set_to_default();
        }
      },
      selectedLicense(new_val) {
        this.$emit("update:passedLicense", new_val.value)
      }
    },
  }
</script>

<style scoped>

  .license-image {
    display: block;
    height: 40px;
    margin: 2% auto;
  }
</style>
