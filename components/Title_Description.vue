<template lang="pug">
  div
    h3 {{title}}
    div {{description}}
</template>

<script>
  export default {
    name: "Title_Description",
    props: {
      title:
        {
          type: String,
          required: true,
          default: "MISSING"
        },
      description: {
        type: String,
        default: ""
      }
    }
  }
</script>

<style scoped>

</style>
