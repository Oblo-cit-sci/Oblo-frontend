<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    h2.mb-2 Registration
    v-form
      Aspect(v-for="a of aspects" :aspect="a" :ext_value.sync="a.value" mode="edit" :key="a.name")
      span learn more about
      a(href="https://creativecommons.org/choose/" target="_blank") creative commons licences
    v-btn(@click='submit' :disabled="submitStatus === 'PENDING'" color='success') Submit!
    v-alert(:value='errorMsg' type='error') {{errorMsg}}
</template>

<script>

  import {validationMixin} from 'vuelidate'

  import licenses from '@@/codes/licenses.json'
  import Aspect from "../components/Aspect";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import {license_aspect} from "../lib/typical_aspects";

  export default {
    name: "register",
    components: {Aspect},
    mixins: [validationMixin, TriggerSnackbarMixin],
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
            value: ""
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
            value: ""
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
            value: ""
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
            value: ""
          },
          default_privacy: {
            name: "default_privacy",
            label: "Default privacy",
            type: "select",
            attr: {
              unpacked: true,
              force_view: "select"
            },
            items: ["public", "private"],
            value: "public"
          },
          default_license: default_license
        },
        submitStatus: null,
        errorMsg: null
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
          if (data.status) {
            this.$router.push("/login")
            this.ok_snackbar("Registration successful")
          } else {
            this.errorMsg = data.msg
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
