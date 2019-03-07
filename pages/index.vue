<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex
      xs12
      sm8
      md6
    >
      <!--
      <v-card>
        <Subscription></Subscription>
      </v-card> -->
      <entrylist></entrylist>
    </v-flex>
  </v-layout>
</template>

<script>
import Subscription from '~/components/Subscription.vue'
import Entrylist from '~/components/Entrylist.vue'

export default {
  components: {
    Subscription, Entrylist
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
