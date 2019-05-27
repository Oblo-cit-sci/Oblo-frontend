<template lang="pug">
  div
    h3 License
    div(v-if="$store.getters.visitor")
      div as a visitor your contributions will be licensed under {{selectedLicense.title}}.
    div(v-else)
      div you selected the license: {{selectedLicense.title}}.
    div(v-if=selectedLicense)
      img.license-image(:src="licenseImagePath")
    v-switch(v-model="use_alternative_license" :label="license_selection" color="red")
    SingleSelect(v-if="use_alternative_license" v-bind:options="licenseOptions"
      v-bind:selection.sync="selectedLicense")
</template>

<script>
  import TextShort from "./aspectInput/TextShort";
  import SingleSelect from "./SingleSelect";

  import { license_icon } from "~~/lib/client";

  const ld = require('lodash');

  export default {
    name: "License",
    props: {
      overwrite_default: { // for drafts
        type: Object,
        required: false
      },
      passedLicense: {
        type: String
      }
    },
    components: {SingleSelect, TextShort},
    data() {
      return {
        set_name: "",
        use_alternative_license: false,
        selectedLicense: null,
        licenseOptions: []
      }
    },
    created() {
      if(!this.overwrite_default)
        this.set_to_default();
      else { // for drafts
        this.selectedLicense = this.overwrite_default;
        this.use_alternative_license = this.selectedLicense.short !== this.$store.state.user.user_data.defaultLicense;
      }
      this.licenseOptions = ld.map(this.$store.state.codes.licenses, (l) => Object.assign({
        text: l.title,
        value: l.short
      },l));
    },
    computed: {
      licenseImagePath() {
        //console.log("update img with", this.selectedLicense);
        if(this.selectedLicense) {
          return license_icon(this.selectedLicense.short, this.$store);
        } else {
          return null;
        }
      },
      license_selection() {
        return this.use_alternative_license ? "use different license" : "default license" ;
      }
    },
    methods: {
      set_to_default() {
        this.selectedLicense = this.$store.state.codes.licenses[this.$store.state.user.user_data.defaultLicense];
      }
    },
    watch: {
      use_alternative_license(new_val) {
        if(!new_val) { // set back to default
          this.set_to_default();
        }
      },
      selectedLicenseShort() {
        this.selectedLicense = this.$store.state.codes.licenses[this.selectedLicenseShort];
        this.$emit("update:passedLicense", this.selectedLicenseShort)
      }
    }
  }
</script>

<style scoped>

  .license-image {
    display: block;
    height: 40px;
    margin: 2% auto;
  }
</style>
