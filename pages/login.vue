<template lang="pug">
  v-flex(xs12 sm10 md6)
    h2.mb-2 Login
    v-form
      Aspect(v-for="a of aspects"
        :key="a.name"
        :aspect="a"
        :ext_value.sync="a.value"
        mode="edit"
        @aspectAction="aspect_action($event)"
        @update:error="a.error = $event")
    v-btn(@click='login' color='success' autofocus :disabled="any_invalid" :loading="login_loading") Login
    div.mt-3
      a(href="basic/init_password_reset") Forgot password?
    div.mt-2(v-if="add_verification_resend_link")
      v-btn(@click="request_verification_mail" color="success") Resend verification email
    v-alert(:value='errorMsg != null' type='error' prominent transition="scroll-y-reverse-transition") {{errorMsg}}
</template>

<script>
  import Aspect from "~/components/Aspect";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import {STR} from "~/lib/consts";
  import PersistentStorageMixin from "../components/PersistentStorageMixin";
  import LoginMixin from "../components/actor/LoginMixin";
  import {check_clear_cache} from "~/lib/client";

  export default {
    name: "Login",
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin, LoginMixin],
    components: {Aspect},
    data() {
      return {
        aspects: [{
          type: STR,
          label: "Username or email",
          name: "user_query",
          attr: {
            max: 90,
            unpacked: true,
          },
          value: "",
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
                ],
              }
            },
            value: "",
            extra: {
              enter_pressed: true
            },
            error: true
          }
        ],
        login_loading: false,
        errorMsg: null,
        add_verification_resend_link: false,
        registered_name: null
      }
    },
    computed: {
      any_invalid() {
        // todo could also have  '|| !a.value'  but we should then be able to pass down the rules to the selectes
        return this.$_.some(this.aspects, (a) => a.hasOwnProperty("error") && a.error)
      }
    },
    methods: {
      aspect_action(event) {
        if (event === "enter_pressed") {
          this.login()
        }
      },
      login() {
        this.login_loading = true
        this.$api.post_actor__login(
          this.aspects[0].value,
          this.aspects[1].value
        ).then(({data}) => {
          if (data.user) {
            this.ok_snackbar("Login successful")
            this.process_login(data)
            this.$router.push("/")
            check_clear_cache(this.$store, this.$api)
          } else {
            // console.log("todo handle login error")
            this.errorMsg = data.error.msg
          }
        }).catch((err) => {
          // console.log("err", err.response)
          const response = err.response
          this.errorMsg = response.data.error.msg
          if (this.$_.get(response, "data.error.data.error_type", 0) === 1) {
            this.add_verification_resend_link = true
            this.registered_name = response.data.error.data.registered_name
          }
          setTimeout(() => this.errorMsg = null, 5000)
        }).finally(() => {
          this.login_loading = false
        })
      },
      request_verification_mail() {
        this.$api.actor__resend_email_verification_mail(this.registered_name).then(({data}) => {
          this.ok_snackbar(data.data)
          this.add_verification_resend_link = false
          this.errorMsg = null
        }).catch(err => {
          const msg = this.$_.get(err.response, "data.error.msg", "Something went wrong")
          this.error_snackbar(msg)
        })
      }
    }
  }
</script>

<style scoped>

</style>
