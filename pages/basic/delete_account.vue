<template lang="pug">
  v-flex(xs12 sm10 md8)
    h2 {{$t("page.delete_account.h1")}}
    p {{$t("page.delete_account.p1")}}
    h3 {{$t("page.delete_account.h2")}}
    CompactEntryList(:entries="entries_to_delete")
    h3.my-2 {{$t("page.delete_account.h3")}}
    Aspect(v-for="a of aspects"
      :key="a.name"
      :aspect="a"
      :ext_value.sync="a.value"
      mode="edit"
      @update:error="a.error = $event")
    v-btn(@click="$router.back()") {{$t("w.cancel")}}
    v-btn(color="error" :disabled="any_invalid" @click="delete_account") {{$t("page.delete_account.btn_delete")}}
</template>

<script>
  import Aspect from "~/components/Aspect"
  import {store_received_entries} from "~/lib/client"
  import EntryListWrapper from "~/components/EntryListWrapper"
  import CompactEntryList from "~/components/entry/CompactEntryList"
  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
  import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
  import NavBaseMixin from "~/components/NavBaseMixin"
  import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"

  export default {
    name: "delete_account",
    mixins: [TriggerSnackbarMixin, PersistentStorageMixin, NavBaseMixin, TypicalAspectMixin],
    components: {CompactEntryList, EntryListWrapper, Aspect},
    props: {},
    data() {
      return {
        aspects: {
          registered_name: this.asp_registered_name(),
          password: this.asp_password()
        },
        entries_to_delete: []
      }
    },
    created() {
      this.$api.actor__init_delete().then(({data}) => {
        this.entries_to_delete = store_received_entries(this.$store, data.data)
      })
    },
    computed: {
      any_invalid() {
        // todo could also have  '|| !a.value'  but we should then be able to pass down the rules to the selectes
        return this.$_.some(this.aspects, (a) => a.hasOwnProperty("error") && a.error)
      }
    },
    methods: {
      delete_account() {
        this.$api.delete_account({
          registered_name: this.aspects.registered_name,
          password: this.aspects.password
        }).then(({data}) => {
          this.ok_snackbar(data.data)
          this.clear_storage()
          this.$store.dispatch("logout")
          this.home()
        }).catch(err => {
          this.err_error_snackbar(err)
        })
      }
    }
  }
</script>

<style scoped>

</style>
