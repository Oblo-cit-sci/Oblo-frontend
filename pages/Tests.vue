<template lang="pug">
  div
    Aspect(:aspect="aspect" :ext_value.sync="value" mode="edit")
    Aspect(:aspect="aspect" :ext_value.sync="value" mode="view")
</template>

<script>


import AspectSet from "~/components/AspectSet"
import Dialog from "~/components/dialogs/Dialog";
import Aspect from "~/components/Aspect"
import MultipageDialog from "~/components/dialogs/MultipageDialog"
import DirectAspectCreator from "~/components/DirectAspectCreator"
import MessageTranslationBlock from "~/components/language/MessageTranslationBlock"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";
import {pack_value} from "~/lib/aspect";

export default {
  name: "Tests",
  mixins: [TriggerSnackbarMixin],
  components: {
    Aspect
  },
  created() {

  },
  data() {
    return {
      value: pack_value(null),
      aspect : {
        name:"jo",
        type: "select",
        items: [{value:"jo",text:"JO"}, "no"]
      }
    }
  },
  computed: {
  },
  methods: {
    short() {
      this.ok_snackbar("short hello")
    },
    long(event) {
      this.ok_snackbar("this is a very long message. so long it needs more lines")
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>
