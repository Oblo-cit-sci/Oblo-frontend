<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    v-form
      v-text-field(v-model='username' label='Username' required='' autofocus)
      v-text-field(v-model='password' type='password' label='Password' required='')
      v-btn(@click='login' color='success') Login
    v-alert(:value='errorMsg' type='error') {{errorMsg}}
</template>

<script>
  import {initialize} from "../lib/client";

  import {LOGIN_WRONG_CREDENTIALS, LOGIN_ALREADY_LOGGED_IN} from "~~/lib/consts"

  export default {
    name: "Login",
    data() {
      return {
        username: "",
        password: "",
        errorMsg: ""
      }
    },
    methods: {
      login() {
        this.$axios.post("/login", {
          username: this.username,
          password: this.password,
        }).then(({data}) => {
//console.log(data, data.status)
          if (data.status || data.msg_ === LOGIN_ALREADY_LOGGED_IN) {
            //console.log("LOGGIN DONE")
            initialize(this.$axios, this.$store).then((res) => {
            });
            this.$store.commit("user/login", data.result);
            this.$store.commit("entries/set_own_entries", data.result.own_entries);
            this.$router.push("/");
            this.$store.commit("set_snackbar", {message: "You are logged in", ok: data.status === true});
          } else {
            this.errorMsg = data.msg;
          }
        }).catch((err) => {
          console.log("err", err)
        })
      }
    }
  }
</script>

<style scoped>

</style>
