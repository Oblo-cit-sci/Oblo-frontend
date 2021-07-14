<template lang="pug">
  v-flex(xs12 sm10 md6)
    h2 {{$t('page.init_password_reset.h1')}}
    Aspect(:aspect="query"
      :ext_value.sync="query.value"
      mode="edit"
      @update:error="query.error = $event")
    v-btn(
      @click='send'
      color='success'
      rounded large autofocus
      :disabled="query.error" :loading="send_button_loading") {{$t('page.init_password_reset.btn_send')}}
    v-alert(:value='errorMsg != null' type='error' prominent transition="scroll-y-reverse-transition") {{errorMsg}}
</template>

<script>
import Aspect from "~/components/Aspect"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import {MSG_PATH_SOMETHING_WENT_WRONG, RESPONSE_ERROR_MSG} from "~/lib/consts"
import {unpack} from "~/lib/aspect";

export default {
  name: "init_password_reset",
  components: {Aspect},
  mixins: [TypicalAspectMixin, TriggerSnackbarMixin],
  data() {
    return {
      query: this.asp_user_query(),
      errorMsg: null,
      send_button_loading: false
    }
  },
  methods: {
    send() {
      this.send_button_loading = true
      this.$api.actor.init_password_reset(unpack(this.query.value).toLowerCase()).then(({data}) => {
        this.ok_snackbar(data.msg)
        this.$router.push({path:"/basic/reset_mail_sent", query: {address:data.data.address}})
      }).catch(err => {
        this.errorMsg = this.$_.get(err, RESPONSE_ERROR_MSG, this.$t(MSG_PATH_SOMETHING_WENT_WRONG))
        setTimeout(() => this.errorMsg = null, 2000)
      }).finally(() => {
        this.send_button_loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
