<template>
  <FormSchema class="form" ref="formSchema" v-model="model" @submit.prevent>
    <div class="buttons">
      <button type="submit">Subscribe</button>
    </div>
  </FormSchema>
</template>

<script>
    export default {
        name: "GenericEntry"
    }
</script>

<style scoped>

</style>
