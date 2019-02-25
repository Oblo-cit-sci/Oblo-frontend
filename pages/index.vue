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
      <v-card>
        <Subscription></Subscription>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import Subscription from '~/components/Subscription.vue'


export default {
  components: {
    Subscription
  }
}
</script>
