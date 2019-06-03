<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    v-form
      v-text-field(v-model='username' label='Username' hint='At least 2 characters' required='')
      v-text-field(v-model='email' :rules='emailRules' label='E-mail' required='')
      v-text-field(v-model='password' type='password' hint='At least 6 characters' label='Password' required='')
      v-text-field(v-model='repeatPassword' type='password' hint='At least 6 characters' label='Repeat Password' required='')
      v-select(v-model='defaultPrivacy' :items='defaultPrivacyOptions' label='Default Privacy')
      v-select(v-model='defaultLicense' :items='defaultLicenseOptions' label='Default License')
      v-img(:src='licenses[defaultLicense].icon' max-width='88')
    v-btn(@click='submit' :disabled="submitStatus === 'PENDING' || $v.$invalid" color='success') Submit!
    v-alert(:value='errorMsg' type='error') {{errorMsg}}
</template>

<script>


  /*
  HTML VERSION OF A LIST ALTERNATIVE FOR LICENSE SELECTION
  JUST NEEDS CLASS FOR THE SELECTED
  Default Privacy
  <v-list dense>
  <v-list-tile
  @click="selectPrivacy('public')"
    >
    <v-list-tile-avatar>
    <v-icon>public</v-icon>
    </v-list-tile-avatar>
    <v-list-tile-content>
    <v-list-tile-title>Public</v-list-tile-title>
    <v-list-tile-sub-title>Anyone can see your entries</v-list-tile-sub-title>
  </v-list-tile-content>
  </v-list-tile>
  <v-list-tile
  @click="selectPrivacy('private')"
  active
  >
  <v-list-tile-avatar>
  <v-icon>lock</v-icon>
  </v-list-tile-avatar>
  <v-list-tile-content>
  <v-list-tile-title>Private</v-list-tile-title>
  <v-list-tile-sub-title>Nobody can see your entries</v-list-tile-sub-title>
  </v-list-tile-content>
  </v-list-tile>
  </v-list>
  {{defaultPrivacy}}
  */
  /*
        :error-messages="nameErrors"
   @input="$v.name.$touch()"
      @blur="$v.name.$touch()"
   */

  import {required, minLength, sameAs} from 'vuelidate/lib/validators'
  import {validationMixin} from 'vuelidate'

  import licenses from '@@/codes/licenses.json'


  function random_String(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  export default {
    name: "Register",
    mixins: [validationMixin],
    data() {
      return {
        username: random_String(10),
        email: random_String(10) + "@gmail.com",
        password: "123456",
        repeatPassword: "123456",
        emailRules: [
          v => !!v || 'E-mail is required',
          v => /.+@.+/.test(v) || 'E-mail must be valid'
        ],
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
    }
    , methods: {
      // use this as a function to select/highlight a privacy from the list
      selectPrivacy(pri) {
        this.defaultPrivacy = pri
      },
      submit() {
        this.$axios.post("/register", {
          registered_name: this.username,
          email: this.email,
          password: this.password,
          defaultPrivacy: this.defaultPrivacy,
          defaultLicense: this.defaultLicense
        }, {
          withCredentials: true
        }).then(({data}) => {
          console.log("some data")
          console.log(data)
          if (data.status) {
            this.$store.commit("user/login",data.result);
            this.$router.push("/")
          } else {
            this.errorMsg = data.msg
            this.$store.commoit("set_snackbar", {msg: data.msg, ok:true})
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
