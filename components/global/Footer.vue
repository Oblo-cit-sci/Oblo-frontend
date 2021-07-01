<template lang="pug">
  v-footer.justify-content-center.custom_footer(elevation=4 app)
    FooterContent
</template>

<script>


import FooterContent from "~/components/global/FooterContent";


export default {
  name: "Footer",
  components: {FooterContent}
}
</script>

<style scoped>
  .custom_footer {
    border-top: 1px solid lightgray;
    background-color: white;
    color: black;
  }

</style>
