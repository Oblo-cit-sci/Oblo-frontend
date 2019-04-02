<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      div entry
</template>

<script>
    export default {
        name: "CreateEntryF",
        props: ["entry"]
    }
</script>

<style scoped>

</style>
