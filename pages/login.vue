<template lang="pug">
  v-flex(xs12 sm10 md6)
    h2.mb-2 {{$t('login.h1')}}
    v-form
      Aspect(v-for="a of aspects"
        :key="a.name"
        :aspect="a"
        :ext_value.sync="a.value"
        mode="edit"
        @aspectAction="aspect_action($event)"
        @update:error="a.error = $event")
    v-btn(@click='login' color='success' autofocus :disabled="any_invalid" :loading="login_loading") {{$t('login.btn_login')}}
    div.mt-3
      nuxt-link(to="basic/init_password_reset") {{$t('login.btn_forgot')}}
    div.mt-2(v-if="add_verification_resend_link")
      v-btn(@click="request_verification_mail" color="success") Resend verification email
    v-alert(:value='errorMsg != null' type='error' prominent transition="scroll-y-reverse-transition") {{errorMsg}}
</template>

<script>
  import Aspect from "~/components/Aspect";
  import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
  import PersistentStorageMixin from "../components/util/PersistentStorageMixin";
  import LoginMixin from "../components/actor/LoginMixin";
  import {SEARCH_CLEAR} from "~/store/search"
  import {CLEAR_ENTRIES} from "~/store"
  import NavBaseMixin from "~/components/NavBaseMixin"
  import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"

  export default {
    name: "Login",
    mixins: [TypicalAspectMixin, TriggerSnackbarMixin, PersistentStorageMixin, LoginMixin, NavBaseMixin],
    components: {Aspect},
    data() {
      const asp_password = this.asp_password()
      asp_password.attr.extra.enter_pressed = true
      return {
        aspects: [this.asp_user_query(), asp_password],
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
        if (event === "enter_pressed" && !this.any_invalid) {
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
            this.$store.dispatch(CLEAR_ENTRIES)
            this.$store.commit(SEARCH_CLEAR)
            this.home()
          } else {
            // todo this shouldnt happen...
            console.log(err)
            const errorMsg = this.$_.get(err, "response.data.error.msg", "Not a user")
            setTimeout(() => this.errorMsg = null, 5000)
          }
        }).catch((err) => {
          this.errorMsg = this.$_.get(err, "response.data.error.msg", this.$t("comp.snackbar.something_went_wrong"))
          if (this.$_.get(err, "response.data.error.data.error_type", 0) === 1) {
            this.add_verification_resend_link = true
            this.registered_name = this.$_.get(err, "response.data.error.data.registered_name")
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
          const msg = this.$_.get(err, "response.data.error.msg", this.$t("comp.snackbar.something_went_wrong"))
          this.error_snackbar(msg)
        })
      }
    }
  }
</script>

<style scoped>

</style>
