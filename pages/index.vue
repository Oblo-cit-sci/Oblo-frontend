<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      entrylist(:entries="$store.state.recent_entries")
</template>

<script>
  import Entrylist from '~/components/Entrylist.vue'

  import {recent_entries} from "../lib/common"

  export default {
    fetch(context) {
      if (!context.store.state.initialized) {
        /*
        let {data} = await context.$axios.get("/init");
        context.store.commit("init", data.result);
        if (data.result.user_data !== null) {
          context.store.commit("login", data.result.user_data);
        }
        */
        context.$axios.get("/init").then((res) => {
          context.store.commit("init", res.data.result);
          if (res.data.result.user_data !== null) {
            context.store.commit("login", res.data.result.user_data);
          }
        }).catch((req, res) => {
          console.log("error");
        });
      }

      recent_entries().then((res) => {
        console.log("entries", res.result);
        context.store.commit("set_entries", res.result);
      });
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
