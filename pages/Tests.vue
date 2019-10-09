<template lang="pug">
  v-container(fluid)
    v-row
      v-col(xs12 sm8 md12)
        LoadFileButton(@fileload="loaded($event)")
        v-btn(@click="add") add
        v-btn(@click="mut") mut
        v-btn(@click="del") del
        div(v-for="(e, index) in tempM")
          div {{index}} {{e}}
    Entrypreview(:entries="entries")
</template>

<script>
  import Entrypreview from "../components/EntryPreview";
  import LoadFileButton from "../components/LoadFileButton";

  const ld = require("lodash")

  // file-upload( :headers="headers" @change="onFileChange")

  export default {
    name: "Tests",
    components: {LoadFileButton, Entrypreview},
    created() {
    },
    data() {
      return {
        next: 10
      }
    },
    computed: {
      tempM() {
        return this.$store.getters["test/tempM"]
      },
      entries() {
        const registered_name = this.$store.state.user.user_data.registered_name;
        let result_entries = Array.from(this.$store.state.entries.entries.values())
        return result_entries
      }
    },
    methods: {
      add(){
        this.next++;
        this.$store.dispatch("test/add",this.next)
      },
      mut() {
        this.next++
        this.$store.dispatch("test/mut",this.next)
      },
      del() {
        this.$store.dispatch("test/del")
      },
      loaded(data) {
        //console.log("data received", data)
      }
    }
  }
</script>

<style scoped>

</style>
