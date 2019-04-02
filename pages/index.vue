<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      entrylist
</template>

<script>
import Entrylist from '~/components/Entrylist.vue'


export default {
  async fetch({ store, $axios }) {
    // TODO helper, replace with... nuxtServerInit Action or actually, shouldnt happen
    if(!store.state.logged_in) {
      console.log("WARNING: not logged in!")
    } else {
      console.log("logged in as ", store.state.user_data.registered_name)
    }
  },
  components: {
    Entrylist
  },
  computed: {
  }
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
