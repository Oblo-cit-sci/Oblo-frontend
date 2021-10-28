<template lang="pug">
  //DialogWrapper
  //v-dialog(v-model="dialog_open" :persistent="persistent" @click:outside="click_outside")
  DialogWrapper(v-model="value" @close="close" :persistent="persistent")
    div HELLLO
    v-btn(@click="close") close
</template>

<script>
import Dialog from "~/components/dialogs/Dialog"
import DialogWrapperMixin from "~/components/dialogs/DialogWrapperMixin"
import DialogWrapper from "~/components/dialogs/DialogWrapper"

export default {
  name: "EntriesDownloadDialog",
  mixins: [DialogWrapperMixin],
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
