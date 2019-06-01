<template lang="pug">
  div
    component(v-bind:is="header_type") {{title}}
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
          default: ""
        },
      header_type: {
        type: String,
        default: "h3"
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
