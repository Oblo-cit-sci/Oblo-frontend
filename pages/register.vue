<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    h2.mb-2 Registration
    v-form
      Aspect(v-for="a of aspects"
        :aspect="a"
        :key="a.name"
        :ext_value.sync="a.value"
        @update:error="a.error = $event"
        :extra="{clearable:false}"
        mode="edit")
      span learn more about &nbsp;
      a(href="https://creativecommons.org/choose/" target="_blank") creative commons licences
    v-btn.m-4(@click='submit' x-large :disabled="any_invalid || submitStatus === 'PENDING'" color='success') Register
    v-alert(:value='errorMsg !== null' type='error' prominent) {{errorMsg}}
</template>

<script>

  import {validationMixin} from 'vuelidate'

  import Aspect from "../components/Aspect";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import {license_aspect, privacy_aspect} from "../lib/typical_aspects";
  import LoginMixin from "../components/actor/LoginMixin";

  export default {
    name: "register",
    components: {Aspect},
    mixins: [validationMixin, TriggerSnackbarMixin, LoginMixin],
    data() {
      const default_license = this.$_.cloneDeep(license_aspect(this.$store, ["cc_licenses"]))
      default_license.name = "default_licence"
      default_license.label = "Default licence"
      default_license.value = "CC-BY"
      default_license.attr.unpacked = true
      return {
        aspects: {
          registered_name: {
            type: "str",
            name: "Username",
            attr: {
              max: 30,
              unpacked: true,
              extra: {
                rules: [
                  v => v && v.length >= 4 || 'Username must have at 4 characters',
                ]
              }
            },
            value: "",
            error: true
          },
          email: {
            type: "str",
            name: "email",
            attr: {
              max: 40,
              unpacked: true,
              extra: {
                rules: [
                  v => !!v || 'E-mail is required',
                  v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
                ]
              }
            },
            value: "",
            error: true
          },
          password: {
            type: "str",
            name: "password",
            label: "Password",
            attr: {
              max: 40,
              unpacked: true,
              component_type: "password",
              extra: {
                rules: [
                  v => !!v || 'Password is required',
                  v => v && (v.length >= 8) || 'Password must have at least 8 characters'
                ]
              }
            },
            value: "",
            error: true
          },
          password_confirm: {
            type: "str",
            name: "repeat password",
            label: "Repeat password",
            attr: {
              max: 40,
              unpacked: true,
              component_type: "password",
              extra: {
                rules: [
                  v => v === this.aspects.password.value || "Passwords do not match"
                ]
              }
            },
            value: "",
            error: true
          },
          default_privacy: Object.assign(privacy_aspect(),
            {value: "public", description: "Choose a default privacy for all your entries"}),
          default_license: Object.assign(license_aspect(this.$store,["cc_licenses"]),
            {value:"CC-BY", description:"Choose a default license for your entries"})
        },
        submitStatus: null,
        errorMsg: null
      }
    },
    computed: {
      any_invalid() {
        // todo could also have  '|| !a.value'  but we should then be able to pass down the rules to the selectes
        return this.$_.some(this.aspects, (a) => a.hasOwnProperty("error") && a.error)
      }
    },
    methods: {
      // use this as a function to select/highlight a privacy from the list
      submit() {
        this.$api.post_actor({
          registered_name: this.aspects.registered_name.value,
          email: this.aspects.email.value,
          password: this.aspects.password.value,
          password_confirm: this.aspects.password_confirm.value,
          default_privacy: this.aspects.default_privacy.value,
          default_license: this.aspects.default_license.value
        }).then(({data}) => {
          if (data.data) {
            this.$router.push("/login")
            this.ok_snackbar("Registration successful")
            this.process_login(data.data)
            this.$router.push("/")
          } else {
            this.errorMsg = data.error.msg
          }
        }).catch((err) => {
          console.log("err", err)
        })
      }
    }
  }
</script>

<style scoped>
  .selectedItem {
    background-color: aqua;
  }
</style>
