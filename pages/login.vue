<template lang="pug">
  v-flex
    h2.mb-2 Login
    v-form
      Aspect(v-for="a of aspects" :aspect="a" :ext_value.sync="a.value" mode="edit" :key="a.name")
    v-btn(@click='login' color='success' autofocus) Login
    v-alert(:value='errorMsg' type='error') {{errorMsg}}
</template>

<script>
  import Aspect from "../components/Aspect";
  import {unpack} from "../lib/aspect";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import {STR} from "../lib/consts";
  import {USER_LOGIN} from "../lib/store_consts";
  import PersistentStorageMixin from "../components/PersistentStorageMixin";

  export default {
    name: "Login",
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin],
    components: {Aspect},
    data() {
      return {
        aspects: [{
          type: STR,
          label: "Username",
          name: "registered_name",
          attr: {
            max: 30,
            unpacked: true
          },
          value: ""
        },
          {
            type: STR,
            name: "Password",
            attr: {
              max: 40,
              unpacked: true,
              component_type: "password"
            },
            value: ""
          }
        ],
        errorMsg: null
      }
    },
    methods: {
      login() {
        this.$api.token(
          this.aspects[0].value,
          this.aspects[1].value
        ).then(({data}) => {
          this.ok_snackbar("Login successful")
          this.$store.dispatch(USER_LOGIN, data)
          this.persist_user_data()
          this.$axios.setToken("Bearer " + data.auth_token.access_token)
          // this.$axios.defaults.headers.common["Authorization"] =
          this.$router.push("/")
        }).catch((err) => {
          console.log("err", err)
        })
      }
    }
  }
</script>

<style scoped>

</style>
