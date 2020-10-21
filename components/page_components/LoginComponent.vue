<template lang="pug">
  v-flex(xs12 sm10 md10)
    h2.mb-2 {{$t('page.login.h1')}}
    v-row
      v-col(cols="12" md="8" lg="6")
        v-form
          Aspect(v-for="a of aspects"
            :key="a.name"
            :aspect="a"
            :ext_value.sync="a.value"
            mode="edit"
            @aspectAction="aspect_action($event)"
            @update:error="a.error = $event")
        v-btn(@click='login' color='success' rounded autofocus large :disabled="any_invalid" :loading="login_loading") {{$t('page.login.btn_login')}}
        div.mt-3
          nuxt-link(to="/basic/init_password_reset") {{$t('page.login.btn_forgot')}}
        div.mt-2(v-if="add_verification_resend_link")
          v-btn(@click="request_verification_mail" color="success" rounded) {{$t('page.login.btn_resend_mail')}}
        v-alert(:value='errorMsg != null' type='error' prominent transition="scroll-y-reverse-transition") {{errorMsg}}
      v-col(cols="6" md="3" offset-md="1")
        slot
          h3 {{$t("page.login.no_account")}}
          nuxt-link(to="/register") {{$t("page.login.go_here_to_register")}}
</template>

<script>
import Aspect from "~/components/Aspect";
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import LoginMixin from "~/components/actor/LoginMixin"
import NavBaseMixin from "~/components/NavBaseMixin"
import InitializationMixin from "~/layouts/InitializationMixin"
import {mapGetters, mapMutations} from "vuex"
import {extract_unpacked_values} from "~/lib/aspect"

export default {
  name: "LoginComponent",
  mixins: [TypicalAspectMixin, TriggerSnackbarMixin, PersistentStorageMixin, LoginMixin, NavBaseMixin, InitializationMixin],
  components: {Aspect},
  data() {
    const asp_password = this.asp_password()
    asp_password.attr.extra.enter_pressed = true
    return {
      aspects: {
        user_query: this.asp_user_query(), password: asp_password
      },
      login_loading: false,
      errorMsg: null,
      add_verification_resend_link: false,
      registered_name: null
    }
  },
  computed: {
    ...mapGetters({"user_settings": "user/settings"}),
    any_invalid() {
      // todo could also have  '|| !a.value'  but we should then be able to pass down the rules to the selectes
      return this.$_.some(this.aspects, (a) => a.hasOwnProperty("error") && a.error)
    }
  },
  methods: {
    ...mapMutations({"clear_search": "search/clear", "clear_entries": "entries/clear"}),
    aspect_action(event) {
      if (event === "enter_pressed" && !this.any_invalid) {
        this.login()
      }
    },
    async login() {
      this.login_loading = true
      this.$api.actor.login(extract_unpacked_values(this.aspects)).then(({data}) => {
        this.ok_snackbar(this.$t("page.login.login_successful"))
        this.process_login(data)
        // todo could just be index/clear_entries (change name) but needs await
        this.clear_search()
        this.clear_entries()
        const settings = this.user_settings
        this.complete_language_domains(settings.fixed_domain, settings.ui_language).then(() => {
          this.home()
        }, (err) => {
          console.log(err)
        })
      }).catch(err => {
        this.err_error_snackbar(err)
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
      this.$api.actor.resend_email_verification_mail(this.registered_name).then(({data}) => {
        this.ok_snackbar(data.data)
        this.add_verification_resend_link = false
        this.errorMsg = null
      }).catch(err => {
        this.err_error_snackbar(err)
      })
    }
  }
}
</script>

<style scoped>

</style>
