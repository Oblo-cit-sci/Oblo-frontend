<template lang="pug">
  v-layout
    v-flex(xs12='' sm8='' md6='')
      div {{entry}}
</template>

<script>
  export default {
    name: "Entry",
    props: ["entry"]
  }
</script>

<style scoped>

</style>
