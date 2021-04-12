<template lang="pug">
  v-container(fluid)
    div(v-if="is_offline") You are offline
    EntryCreateList(:template_entries="template_entries")
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

export default {
  name: "offline",
  mixins: [TriggerSnackbarMixin, HomePathMixin, TypicalAspectMixin, OfflineMixin],
  components: {EntryCreateList, Aspect},
  props: {},
  data() {
    return {
      asp: this.asp_public_name()
    }
  },
  computed: {
    template_entries() {
      console.log(this.$store.getters["templates/entry_types_array"]("en",false))
      // TODO THATS A DUPLICATE OF DOMAIN_COMPONENT PAGE
      const templates = this.$store.getters["templates/entry_types_array"]("en",true).filter(t => {
        const create_rule = this.$_.get(t, "rules.create", "public")
        return (
          create_rule === PUBLIC ||
          (create_rule === USER && this.$store.getters["username"] !== VISITOR) ||
          can_edit_entry(this.$store.getters.user, t))
      })
      // console.log(templates)
      return templates
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
