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
        div.mt-3(@mousedown="page_change")
          nuxt-link(to="/basic/init_password_reset") {{$t('page.login.btn_forgot')}}
        div.mt-2(v-if="add_verification_resend_link")
          v-btn(@click="request_verification_mail" color="success" rounded) {{$t('page.login.btn_resend_mail')}}
        v-alert(:value='errorMsg != null' type='error' prominent transition="scroll-y-reverse-transition") {{errorMsg}}
      v-col(cols="6" md="3" offset-md="1")
        slot
          h3 {{$t("page.login.no_account")}}
          div(@mousedown="page_change")
            nuxt-link(to="/register" @mousedown="$emit('page_change')") {{$t("page.login.go_here_to_register")}}
</template>

<script>
import Aspect from "~/components/Aspect";
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import NavBaseMixin from "~/components/NavBaseMixin"
import InitializationMixin from "~/layouts/InitializationMixin"
import {mapGetters, mapMutations} from "vuex"
import {extract_n_unpack_values} from "~/lib/aspect"
import LanguageMixin from "~/components/LanguageMixin";
import {MSG_PATH_SOMETHING_WENT_WRONG, NO_DOMAIN, RESPONSE_ERROR_MSG} from "~/lib/consts";
import URLQueryMixin from "~/components/util/URLQueryMixin";

export default {
  name: "LoginComponent",
  mixins: [TypicalAspectMixin, TriggerSnackbarMixin, URLQueryMixin, PersistentStorageMixin, NavBaseMixin, LanguageMixin, InitializationMixin],
  components: {Aspect},
  props: {
    go_home: {
      type: Boolean,
      default: true
    }
  },
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
    ...mapGetters({"user_settings": "user/settings"}),
    any_invalid() {
      // todo could also have  '|| !a.value'  but we should then be able to pass down the rules to the selectes
      return this.$_.some(this.aspects, (a) => a.hasOwnProperty("error") && a.error)
    }
  },
  methods: {
    ...mapMutations({
      "clear_search": "search/clear",
      clear_entries: "entries/clear",
      map_clear: "map/clear"
    }),
    aspect_action(event) {
      if (event === "enter_pressed" && !this.any_invalid) {
        this.login()
      }
    },
    async login() {
      this.login_loading = true
      let user_settings = null
      try {
        const {data: response_data} = await this.$api.actor.login(extract_n_unpack_values(this.aspects))
        console.log(response_data.msg)
        this.ok_snackbar(response_data.msg)
        //   // todo could just be index/clear_entries (change name) but needs await
        this.clear_search()

        this.clear_entries({keep_drafts:true, keep_uuid: this.query_entry_uuid})

        this.map_clear()
        const user_data = response_data.data
        // console.log("user_data", user_data)
        user_settings = user_data.settings
        this.$store.dispatch("user/login", user_data)
        this.persist_user_data()
      } catch (err) {
        console.log(err)
        this.errorMsg = this.$_.get(err, RESPONSE_ERROR_MSG, this.$t(MSG_PATH_SOMETHING_WENT_WRONG))
        if (this.$_.get(err, "response.data.error.data.error_type", 0) === 1) {
          this.add_verification_resend_link = true
          this.registered_name = this.$_.get(err, "response.data.error.data.registered_name")
        }
        setTimeout(() => this.errorMsg = null, 5000)
        return
      } finally {
        this.login_loading = false
      }

      try {
        await this.change_language(user_settings.ui_language, false, user_settings.domain_language)
        if (user_settings.fixed_domain) {
          await this.init_specifics(user_settings.fixed_domain, user_settings.domain_language)
        }

        if (this.go_home) {
          this.home()
        } else {
          // watched by Search.vue and MapWrapper
          this.$bus.$emit("trigger_search")
        }
      } catch (err) {
        console.log(err)
      }
      this.$emit("logged_in")
    },
    request_verification_mail() {
      this.$api.actor.resend_email_verification_mail(this.registered_name).then(({data}) => {
        this.ok_snackbar(data.msg)
        this.add_verification_resend_link = false
        this.errorMsg = null
        this.$router.push({path:"/basic/registration_done",query:{username:this.registered_name})
      }).catch(err => {
        this.err_error_snackbar(err)
      })
    },
    page_change() {
      setTimeout(() => {
        this.$emit('page_change')
      }, 200)
    }
  }
}
</script>

<style scoped>

</style>
