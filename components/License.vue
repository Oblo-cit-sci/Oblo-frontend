<template lang="pug">
  div
    h3 License
    div(v-if="$store.getters.visitor")
      div as a visitor your contributions will be licensed under {{selectedLicense}}.
    div(v-else)
      div you selected the license: {{selectedLicense.title}}.
    div(v-if=selectedLicense)
      img.license-image(:src="licenseImagePath")
    v-switch(v-model="use_alternative_license" :label="license_selection" color="red")
    SingleSelect(v-if="use_alternative_license" v-bind:options="licenseOptions"
      v-bind:selection.sync="selectedLicenseShort")
</template>

<script>
  import TextShort from "./aspectInput/TextShort";
  import SingleSelect from "./SingleSelect";

  const ld = require('lodash');

  export default {
    name: "License",
    props: {
      overwrite_default: { // for drafts
        type: Object,
        required: false
      }
    },
    components: {SingleSelect, TextShort},
    data() {
      return {
        selectedLicenseShort: null,
        selectedLicense: undefined,
        set_name: "",
        use_alternative_license: false,
        licenseOptions: []
      }
    },
    created() {
      if(!this.overwrite_default)
        this.set_to_default();
      else { // for drafts
        this.selectedLicense = this.overwrite_default;
        this.use_alternative_license = this.selectedLicense.short !== this.$store.state.user_data.defaultLicense;
      }
      this.selectedLicenseShort = this.selectedLicense.short;
      this.licenseOptions = ld.map(this.$store.state.codes.licenses, (l) => {
        return {
          text: l.title,
          value: l.short
        }
      });
    },
    computed: {
      licenseImagePath() {
        if(this.selectedLicense) {
          return this.$store.state.codes.licenses[this.selectedLicense.short].icon
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
        this.selectedLicense = this.$store.state.codes.licenses[this.$store.state.user_data.defaultLicense];
      }
    },
    watch: {
      use_alternative_license(new_val) {
        if(!new_val) { // set back to default
          this.set_to_default();
        }
      },
      selectedLicenseShort() {
        console.log("License", this.selectedLicense);
        this.selectedLicense = this.$store.state.codes.licenses[this.selectedLicenseShort];
        this.$emit("update:selectedLicense", this.selectedLicense)
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
