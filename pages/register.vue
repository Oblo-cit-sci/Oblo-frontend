<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    h2.mb-2 {{$t('page.register.h1')}}
    v-form
      Aspect(v-for="a of aspects"
        :aspect="a"
        :key="a.name"
        :ext_value.sync="a.value"
        @update:error="a.error = $event"
        :extra="{clearable:false}"
        mode="edit")
    v-checkbox(v-model="agree")
      template(v-slot:label)
        div {{$t('page.register.i_agree_with')}} &nbsp;
          a(@click="terms_dialog_open = true") {{$t('page.register.terms_of_use')}}
    v-btn.m-4(@click='submit' rounded large :disabled="any_invalid || submitStatus === 'PENDING'" :loading="submit_loading" color='success') {{$t('page.register.btn_register')}}
    v-alert(:value='errorMsg !== null' type='error' prominent) {{errorMsg}}
    v-dialog(v-model="terms_dialog_open" :width="main_container_with")
      v-card
        FlexibleTextSection.pa-4.pb-1(:section="terms_of_use_section" disable_divider)
        v-card-actions
          v-btn(icon text @click="terms_dialog_open=false")
            v-icon mdi-close
</template>

<script>

import {validationMixin} from 'vuelidate'

import Aspect from "../components/Aspect";
import TriggerSnackbarMixin from "../components/TriggerSnackbarMixin";
import LoginMixin from "../components/actor/LoginMixin";
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import {PAGE_LOGIN} from "~/lib/pages"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {overwrite_default_register_settings} from "~/lib/settings"
import FlexibleTextSection from "~/components/global/FlexibleTextSection"
import LayoutMixin from "~/components/global/LayoutMixin"
import {MSG_PATH_SOMETHING_WENT_WRONG, RESPONSE_ERROR_MSG} from "~/lib/consts"

export default {
  name: "register",
  components: {FlexibleTextSection, Aspect},
  mixins: [TriggerSnackbarMixin, LoginMixin, TypicalAspectMixin, FixDomainMixin, LayoutMixin],
  data() {
    const password = this.asp_password()
    return {
      aspects: {
        registered_name: this.asp_registered_name(),
        email: this.asp_email(),
        password: password,
        password_confirm: this.asp_password_confirm(password, "repeat"),
      },
      submitStatus: null,
      errorMsg: null,
      submit_loading: false,
      agree: false,
      terms_dialog_open: false
    }
  },
  computed: {
    any_invalid() {
      // todo could also have  '|| !a.value'  but we should then be able to pass down the rules to the selectes
      return this.$_.some(this.aspects, (a) => a.hasOwnProperty("error") && a.error) || !this.agree
    },
    terms_of_use_section() {
      const tou_section = this.$_.find(this._i18n.messages[this._i18n.locale].about, s => s.flag === 'TERMS_OF_USE')
      return tou_section
    }
  },
  methods: {
    // use this as a function to select/highlight a privacy from the list
    submit() {
      this.submit_loading = true
      const settings = Object.assign(this.$_.cloneDeep(this.$store.getters["user/settings"]), overwrite_default_register_settings)
      // todo better js!
      this.$api.actor.post_actor({
        registered_name: this.aspects.registered_name.value,
        email: this.aspects.email.value,
        password: this.aspects.password.value,
        password_confirm: this.aspects.password_confirm.value,
        settings
      }).then(({data}) => {
        if (data.data) {
          this.$router.push({name: PAGE_LOGIN})
          this.ok_snackbar(data.data)
        } else {
          this.errorMsg = data.error.msg
        }
      }, err => {
        this.errorMsg = this.$_.get(err, RESPONSE_ERROR_MSG, this.$t(MSG_PATH_SOMETHING_WENT_WRONG))
        setTimeout(() => this.errorMsg = null, 12000)
      }).finally(() => {
        this.submit_loading = false
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
