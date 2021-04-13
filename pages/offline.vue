<template lang="pug">
  v-container(fluid)
    div
      h3 {{$t('page.domain.create_entry_dialog_title')}}
      EntryCreateList(:template_entries="template_entries")
    div
      h3.text-capitalize {{$t('w.entries')}}
      EntryPreviewList(:entries="all_entries" :total_count="num_entries" :preview_options="{show_botton_actions: true}")
</template>

<script>
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import HomePathMixin from "~/components/menu/HomePathMixin"
import Aspect from "~/components/Aspect"
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin"
import OfflineMixin from "~/lib/OfflineMixin"
import EntryCreateList from "~/components/EntryCreateList"
import {PUBLIC, USER, VISITOR} from "~/lib/consts"
import {can_edit_entry} from "~/lib/actors"
import EntryPreviewList from "~/components/entry/EntryPreviewList"

export default {
  name: "offline",
  mixins: [TriggerSnackbarMixin, HomePathMixin, TypicalAspectMixin, OfflineMixin],
  components: {EntryPreviewList, EntryCreateList, Aspect},
  props: {},
  data() {
    return {
      asp: this.asp_public_name()
    }
  },
  computed: {
    template_entries() {
      // console.log(this.$store.getters["templates/entry_types_array"]("en",false))
      // TODO THATS A DUPLICATE OF DOMAIN_COMPONENT PAGE
      return this.$store.getters["templates/entry_types_array"](this.$store.getters.ui_language,true).filter(t => {
        const create_rule = this.$_.get(t, "rules.create", "public")
        return (
          create_rule === PUBLIC ||
          (create_rule === USER && this.$store.getters["username"] !== VISITOR) ||
          can_edit_entry(this.$store.getters.user, t))
      })
    },
    all_entries() {
      return this.$store.getters["entries/all_uuids"]()
    },
    num_entries() {
      return this.all_entries.length
    }
  },
  methods: {},
  watch: {
    is_offline(offline) {
      if (!offline) {
        this.ok_snackbar("You are connected")
        this.set_home_path()
      }
    }
  }
}
</script>

<style scoped>

</style>
