<template lang="pug">
  v-container
    div(v-if="new_user")
      AspectSet(:aspects="aspects" mode="edit" :values.sync="aspect_values" @has_errors="has_errors($event)")
      TermsOfUse(:agree.sync="terms_agree" :terms_dialog_open.sync="terms_dialog_open")
      v-btn.m-4(@click='submit' rounded large :disabled="any_invalid" :loading="submit_loading" color='success') {{$t('page.register.btn_register')}}
</template>

<script>

import {mapMutations} from "vuex"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";
import LanguageMixin from "~/components/LanguageMixin";
import NavBaseMixin from "~/components/NavBaseMixin";
import {BUS_HIDE_OVERLAY, BUS_OVERLAY, BUS_TRIGGER_SEARCH} from "~/plugins/bus";
import AspectSet from "~/components/AspectSet"
import Aspect from "~/components/Aspect";
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin";
import TermsOfUse from "~/components/register/TermsOfUse";
import {pack_value} from "~/lib/aspect";
import {recursive_unpack2} from "~/lib/util";

export default {
  name: "oauth_complete",
  mixins: [TriggerSnackbarMixin, LanguageMixin, NavBaseMixin, TypicalAspectMixin],
  components: {AspectSet, Aspect, TermsOfUse},
  props: {
    go_home: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      user_data: null,
      new_user: null,
      aspect_values: {},
      aspect_error: false, // just the public name
      terms_dialog_open: false,
      terms_agree: false,
      submit_loading: false
    }
  },
  async created() {
    this.$bus.$emit(BUS_OVERLAY)
    let user_settings = null
    let msg = null
    try {
      const {data: response_data} = await this.$api.basic.oauth_complete(this.$route.query)
      console.log(response_data)
      this.clear_search()
      this.clear_entries({keep_drafts: true, keep_uuid: this.query_entry_uuid})
      this.map_clear()
      this.user_data = response_data.data.actor
      this.new_user = response_data.data.is_new_actor
      this.aspect_values = {
        public_name: pack_value(this.user_data.public_name),
        email: pack_value(this.user_data.email),
        description: pack_value(this.user_data.description)
      }
      user_settings = this.user_data.settings
      msg = response_data.msg
    } catch (err) {
      console.log("error completing oauth")
      console.error(err)
      this.err_error_snackbar(err)
      this.$bus.$emit(BUS_HIDE_OVERLAY)

      // switch those 2 for testing
      this.home()
      // this.new_user = true
      return
    }
    try {
      await this.change_language(user_settings.ui_language, false, user_settings.domain_language)
      if (user_settings.fixed_domain) {
        await this.init_specifics(user_settings.fixed_domain, user_settings.domain_language)
      }
      this.$bus.$emit(BUS_HIDE_OVERLAY)
      if (this.go_home && !this.new_user) {
        this.login(msg)
        return
      }
      this.aspect_error = this.aspect_values.public_name.value === ""
    } catch (err) {
      console.log("error in settings")
      console.log(err)
      // this.home()
    }
  },
  computed: {
    aspects() {
      return [
        this.asp_public_name(),
        this.asp_email([], false),
        this.asp_actor_description()]
    },
    any_invalid() {
      // todo could also have  '|| !a.value'  but we should then be able to pass down the rules to the selectes
      return this.aspect_error || !this.terms_agree
    },
  },
  methods: {
    login(msg) {
      this.$store.dispatch("user/login", this.user_data)
      this.persist_user_data()
      this.ok_snackbar(msg)
      this.$emit("logged_in")
      this.$bus.$emit(BUS_TRIGGER_SEARCH)
      this.home()
    },
    ...mapMutations({
      "clear_search": "search/clear",
      clear_entries: "entries/clear",
      map_clear: "map/clear"
    }),
    has_errors(error) {
      this.aspect_error = error
    },
    submit() {
      Object.assign(this.user_data, recursive_unpack2(this.aspect_values))
      this.$api.oauth.oauth_register(this.user_data).then(({data}) => {
        this.login(data.msg)
      }, err => {
        console.error(err)
      })

    }
  }
}
</script>

<style scoped>

</style>
