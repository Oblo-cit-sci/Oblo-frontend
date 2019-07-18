<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    LoadFileButton(@fileload="loaded($event)")
    v-btn(@click="add") add
    v-btn(@click="mut") mut
    v-btn(@click="del") del
    div(v-for="(e, index) in tempM")
      div {{index}} {{e}}
</template>

<script>

  import LoadFileButton from "../components/LoadFileButton";

  const ld = require("lodash")

  // file-upload( :headers="headers" @change="onFileChange")

  export default {
    name: "Tests",
    components: {LoadFileButton},
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
