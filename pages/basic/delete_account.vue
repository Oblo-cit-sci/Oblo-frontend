<template lang="pug">
  v-flex(xs12 sm10 md8)
    h2 {{$t("page.delete_account.h1")}}
    p {{$t("page.delete_account.p1")}}
    h3 {{$t("page.delete_account.h2")}}
    div {{$tc("comp.previewlist.num_entries", num_entries)}}
    CompactEntryList(:entries="entries_to_delete")
    div(v-if="!is_oauth_user")
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
import EntryListWrapper from "~/components/EntryListWrapper"
import CompactEntryList from "~/components/entry/CompactEntryList"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import NavBaseMixin from "~/components/NavBaseMixin"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import {extract_n_unpack_values, pack_value} from "~/lib/aspect";
import {is_oauth} from "~/lib/actors";
import EntrySearchMixin from "~/components/EntrySearchMixin";

export default {
  name: "delete_account",
  mixins: [TriggerSnackbarMixin, PersistentStorageMixin, NavBaseMixin, TypicalAspectMixin, EntrySearchMixin],
  components: {CompactEntryList, EntryListWrapper, Aspect},
  props: {},
  data() {
    return {
      aspects: [this.asp_registered_name(),
        this.asp_password()
      ],
      entries_to_delete: []
    }
  },
  created() {
    if (this.is_oauth_user) {
      this.aspects[0].value = pack_value(this.$store.getters.name)
      this.aspects[1].value = pack_value("")
    }
    this.$api.actor.init_delete().then(({data}) => {
      console.log(data.data.entries)
      const entries = data.data.entries
      this.store_received_entries(entries)
      this.entries_to_delete = entries
    })
  },
  computed: {
    any_invalid() {
      if (this.is_oauth_user) {
        return false
      }
      // todo could also have  '|| !a.value'  but we should then be able to pass down the rules to the selectes
      return this.$_.some(this.aspects, (a) => a.hasOwnProperty("error") && a.error)
    },
    is_oauth_user() {
      return is_oauth(this.$store.getters.user)
    },
    num_entries() {
      return this.entries_to_delete.length
    }
  },
  methods: {
    delete_account() {
      this.$api.actor.delete_account(extract_n_unpack_values(this.aspects)).then(({data}) => {
        this.ok_snackbar(data.msg)
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
