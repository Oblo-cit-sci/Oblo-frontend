<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      entrylist(:entries="$store.state.recent_entries")
</template>

<script>
  import Entrylist from '~/components/Entrylist.vue'

  import {recent_entries} from "../lib/common"

  export default {
    async fetch(context) {
      if (!context.store.state.initialized) {

        let {data} = await context.$axios.get("/init");
        context.store.commit("init", data.result);
        if (data.result.user_data !== null) {
          context.store.commit("login", data.result.user_data);
        }

        let recent = await recent_entries();
        context.store.commit("set_entries", recent.result);
      }
    },

    components: {
      Entrylist
    },
    computed: {}
  }
</script>

<style>

  .form {
    background-color: #424242;
  }

  input {
    border-style: solid;
  }
</style>
