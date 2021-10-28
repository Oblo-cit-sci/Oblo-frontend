<template lang="pug">
  //DialogWrapper
  //v-dialog(v-model="dialog_open" :persistent="persistent" @click:outside="click_outside")
  DialogWrapper(v-model="dialog_open" @close="close")
    div HELLLO
    v-btn(@click="close") close
</template>

<script>
import Dialog from "~/components/dialogs/Dialog"
import DialogWrapper from "~/components/dialogs/DialogWrapper"
import CustomDialogMixin from "~/components/dialogs/CustomDialogMixin"

export default {
  name: "EntriesDownloadDialog",
  mixins: [CustomDialogMixin],
  components: {DialogWrapper, Dialog},
  props: {
    entries_uuids: Array
  },
  data() {
    return {}
  },
  computed: {},
  methods: {},
  watch: {

  }
}
</script>

<style scoped>

</style>
