<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    h2.mb-2 Registration
    v-form
      Aspect(v-for="a of aspects" :aspect="a" :ext_value.sync="a.value" mode="edit" :key="a.name")
      v-select(v-model='defaultPrivacy' :items='defaultPrivacyOptions' label='Default Privacy')
      v-select(v-model='defaultLicense' :items='defaultLicenseOptions' label='Default License')
      v-img(:src='licenses[defaultLicense].icon' max-width='88')
      a(href="https://creativecommons.org/choose/" target="_blank") learn more
    v-btn(@click='submit' :disabled="submitStatus === 'PENDING'" color='success') Submit!
    v-alert(:value='errorMsg' type='error') {{errorMsg}}
</template>

<script>

  import {validationMixin} from 'vuelidate'

  import licenses from '@@/codes/licenses.json'
  import Aspect from "../components/Aspect";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";

  export default {
    name: "register",
    components: {Aspect},
    mixins: [validationMixin, TriggerSnackbarMixin],
    data() {
      return {
        aspects: {
          registered_name: {
            type: "str",
            name: "Username",
            attr: {
              max: 30,
              unpacked:true,
              extra: {
                rules: [
                  v => v && v.length >= 4 || 'Username must have at 4 characters',
                ]
              }
            },
            value: {
              value: ""
            }
          },
          email: {
            type: "str",
            name: "email",
            attr: {
              max: 40,
              unpacked:true,
              extra: {
                rules: [
                  v => !!v || 'E-mail is required',
                  v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
                ]
              }
            },
            value: {
              value: ""
            }
          },
          password: {
            type: "str",
            name: "password",
            attr: {
              max: 40,
              unpacked:true,
              component_type: "password",
              extra: {
                rules: [
                  v => !!v || 'Password is required',
                  v => v && (v.length >= 8) || 'Password must have at least 8 characters'
                ]
              }
            },
            value: {
              value: ""
            }
          },
          password_confirm: {
            type: "str",
            name: "repeat password",
            attr: {
              max: 40,
              unpacked:true,
              component_type: "password",
              extra: {
                rules: [
                  v => v === this.aspects.password.value || "Passwords do not match"
                ]
              }
            },
            value: {
              value: ""
            }
          }
        },
        // MUST MATCH THE ENUM values app.models.Privacy.Privacy
        defaultPrivacyOptions: ["public", "private"], // "followers_only",
        defaultPrivacy: "public",
        defaultLicense: "BY-NC",
        licenses: licenses,
        defaultLicenseOptions: Object.keys(licenses),
        submitStatus: null,
        errorMsg: null
      }
    },
    methods: {
      // use this as a function to select/highlight a privacy from the list
      selectPrivacy(pri) {
        this.defaultPrivacy = pri
      },
      submit() {
        this.$axios.post("/actor", {
          registered_name: this.aspects.registered_name.value,
          email: this.aspects.email.value,
          password: this.aspects.password.value,
          password_confirm: this.aspects.password_confirm.value,
          // defaultPrivacy: this.defaultPrivacy,
          // defaultLicense: this.defaultLicense
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
