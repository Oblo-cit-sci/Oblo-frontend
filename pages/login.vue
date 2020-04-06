<template lang="pug">
  v-flex(xs12 sm10 md6)
    h2.mb-2 Login
    v-form
      Aspect(v-for="a of aspects"
        :key="a.name"
        :aspect="a"
        :ext_value.sync="a.value"
        mode="edit"
        @update:error="a.error = $event")
    v-btn(@click='login' color='success' autofocus :disabled="any_invalid") Login
    div.mt-3
      a(href="basic/password_reset") Forgot password?
    v-alert(:value='errorMsg != null' type='error' prominent transition="scroll-y-reverse-transition") {{errorMsg}}
</template>

<script>
  import Aspect from "../components/Aspect";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import {STR} from "../lib/consts";
  import PersistentStorageMixin from "../components/PersistentStorageMixin";
  import LoginMixin from "../components/actor/LoginMixin";
  import {check_clear_cache} from "../lib/client";

  export default {
    name: "Login",
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin, LoginMixin],
    components: {Aspect},
    data() {
      return {
        aspects: [{
          type: STR,
          label: "Username",
          name: "registered_name",
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
          {
            type: STR,
            name: "Password",
            attr: {
              max: 40,
              unpacked: true,
              component_type: "password",
              extra: {
                rules: [
                  v => v && v.length >= 8 || 'Password must have at least 8 characters',
                ]
              }
            },
            value: "",
            error: true
          }
        ],
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
      login() {
        this.$api.post_actor__login(
          this.aspects[0].value,
          this.aspects[1].value
        ).then(({data}) => {
          if (data.user) {
            this.ok_snackbar("Login successful")
            this.process_login(data)
            this.$router.back()
            check_clear_cache(this.$store, this.$api)
          } else {
            // console.log("todo handle login error")
            this.errorMsg = data.error.msg
          }
        }).catch((err) => {
          console.log("err", err.response)
          this.errorMsg = err.response.data.error.msg
          setTimeout(() => this.errorMsg = null, 2000)
        })
      }
    }
  }
</script>

<style scoped>

</style>
