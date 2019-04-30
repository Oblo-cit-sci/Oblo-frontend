<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    v-form
      v-text-field(v-model='username' label='Username' required='')
      v-text-field(v-model='password' type='password' label='Password' required='')
      v-btn(@click='login' color='success') Login
    v-alert(:value='errorMsg' type='error') {{errorMsg}}
</template>

<script>
  import {initialize} from "../lib/client";

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
          //console.log("login-data", data);
          this.$store.commit("set_snackbar", {message: "You are logged in", ok: true});
          if(data.ok === true) {
            initialize(this.$axios, this.$store).then((res) => {});
            this.$store.commit("login", data.user_data);
            this.$router.push("/")
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

</style>
