<template lang="pug">
  div
    h3 Privacy
    div(v-if="edit")
      div(v-if="$store.getters.visitor")
        div
          span As a visitor your contributions will be
          span.public_text_clr &nbsp{{ $store.state.user.user_data.defaultPrivacy }}&nbsp
          span after being reviewed
      div(v-else)
        div you selected the privacy: {{selectedPrivacy.text}}.
        v-switch(v-model="use_alternative_privacy" :label="privacy_selection" color="red")
        SingleSelect(
          v-if="use_alternative_privacy"
          :options="privacy_options"
          :selection.sync="selectedPrivacy")
    div(v-else)
      div This entry is {{selectedPrivacy.text}}. {{selectedPrivacy.description}}
</template>

<script>
  import SingleSelect from "./input/SingleSelect";
  import {EDIT, PRIVATE, PRIVATE_LOCAL, PUBLIC} from "../lib/consts";
  import {privacy_icon} from "../lib/util";


  /*
  div(v-if="!has_privacy")
      div This entry is for private local usage and cannot be uploaded to the platform. It's intended to be download and sent to the data repository.
   */

  const OPTIONS = [PUBLIC, PRIVATE, PRIVATE_LOCAL]

  export default {
    name: "Privacy",
    props: {
      passedPrivacy: { // for drafts
        type: String,
      },
      mode: {
        type: String,
        default: EDIT
      }
    },
    components: {SingleSelect},
    data() {
      return {
        privacy_options: [
          {text: PUBLIC, value: PUBLIC, description: "This entry is visible to everyone", icon:privacy_icon(PUBLIC)},
          {text: PRIVATE, value: PRIVATE,  description: "This entry is not shared with any expect with those your grant access", icon:privacy_icon(PRIVATE)},
          {text: PRIVATE_LOCAL, value: PRIVATE_LOCAL, description: "This entry stays on your device.", icon:privacy_icon(PRIVATE_LOCAL)}
        ],
        selectedPrivacy: null,
        use_alternative_privacy: false
      }
    },
    created() {
        this.selectedPrivacy = this.$_.find(this.privacy_options, o => o.text === this.passedPrivacy)
        if(!this.selectedPrivacy) {
            console.log("Entry.Privacy ERROR, unknown privacy option", this.passedPrivacy)
            this.selectedPrivacy = this.privacy_options[0] // PUBLIC
        }
        this.use_alternative_privacy = this.passedPrivacy !== this.$store.state.user.user_data.defaultPrivacy
    },
    computed: {
      privacy_selection() {
        return this.use_alternative_privacy ? "use different privacy" : "default privacy";
      },
      edit() {
        return this.mode === EDIT
      },
      private_local() {
        return this.passedPrivacy === PRIVATE_LOCAL
      }
    },
    methods: {
      set_to_default() {
        this.selectedPrivacy = this.$_.find(this.privacy_options, (p) => p.value === this.$store.state.user.user_data.defaultPrivacy)
      }
    },
    watch: {
      use_alternative_privacy(val) {
        if(!val)
          this.set_to_default()
      },
      selectedPrivacy(new_val) {
        this.$emit("update:passedPrivacy", new_val.text);
      }
    }
  }
</script>

<style scoped>
  .public_text_clr {
    font-weight: bold;
    color: green;
  }
</style>
