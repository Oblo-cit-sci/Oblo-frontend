<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    v-form
      Aspect(v-for="a of aspects" :aspect="a" :value="a.value" mode="edit" :key="a.name")
      v-select(v-model='defaultPrivacy' :items='defaultPrivacyOptions' label='Default Privacy')
      v-select(v-model='defaultLicense' :items='defaultLicenseOptions' label='Default License')
      v-img(:src='licenses[defaultLicense].icon' max-width='88')
    v-btn(@click='submit' :disabled="submitStatus === 'PENDING'" color='success') Submit!
    v-alert(:value='errorMsg' type='error') {{errorMsg}}
    div {{this.aspects.registered_name.value}}
</template>

<script>

  import {required, minLength, sameAs} from 'vuelidate/lib/validators'
  import {validationMixin} from 'vuelidate'

  import licenses from '@@/codes/licenses.json'
  import Aspect from "../components/Aspect";


  function random_String(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  const register_aspects = {
    registered_name: {
      type: "str",
      name: "Username",
      attr: {
        max: 30,
        extra: {
          "hint": 'At least 2 characters'
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
        extra: {
          rules: [
            v => !!v || 'E-mail is required',
            v => /.+@.+/.test(v) || 'E-mail must be valid'
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
        extra: {
          hint: "At least 6 characters",
          type: "password"
        }
      },
      value: {
        value: ""
      }
    },
    password_repeat: {
      type: "str",
      name: "repeat password",
      attr: {
        max: 40,
        extra: {
          type: "password"
        }
      },
      value: {
        value: ""
      }
    }
  }
  export default {
    name: "Register",
    components: {Aspect},
    mixins: [validationMixin],
    data() {
      return {
        aspects: register_aspects,
        /*input: this.$_.map(register_aspects, (r) => {
          return {value: r.name}
        }),*/
        // MUST MATCH THE ENUM values app.models.Privacy.Privacy
        defaultPrivacyOptions: ["public", "private"], // "followers_only",
        defaultPrivacy: "public",
        defaultLicense: "BY-NC",
        licenses: licenses,
        defaultLicenseOptions: Object.keys(licenses),
        submitStatus: null,
        errorMsg: ""
      }
    },
    validations: {
      username: {
        required,
        minLength: minLength(2),
        // isUnique
      },
      email: {
        isUnique: true
      },
      password: {
        required,
        minLength: minLength(6)
      },
      repeatPassword: {
        sameAsPassword: sameAs('password')
      }
    },
    methods: {
      randomize() {
        this.user = random_String(10)
        this.email = random_String(10) + "licci.eu"
        this.password = "123456"
        this.repeatPassword = "123456"
      },
      // use this as a function to select/highlight a privacy from the list
      selectPrivacy(pri) {
        this.defaultPrivacy = pri
      },
      submit() {
        console.log()
        this.$axios.post("/register", {
          registered_name: this.aspects.registered_name.value.value,
          email: this.aspects.email.value.value,
          password: this.aspects.password.value.value,
          defaultPrivacy: this.defaultPrivacy,
          defaultLicense: this.defaultLicense
        }).then(({data}) => {
          console.log("some data")
          console.log(data)
          if (data.status) {
            this.$store.commit("user/login", data.result);
            this.$router.push("/")
          } else {
            this.errorMsg = data.msg
            this.$store.commoit("set_snackbar", {msg: data.msg, ok: true})
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
