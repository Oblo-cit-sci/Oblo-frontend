<template lang="pug">
  div
    SingleSelect(
      :options="options"
      force_view="list"
      :select_sync="false"
      v-on:selection="emit('selection',$event)"
      :highlight="false")
</template>

<script>

    import SingleSelect from "./SingleSelect";

    export default {
        name: "EntryCreateList",
        components: {SingleSelect},
        props: {
            options: {
                type: Array,
                required: true
            }
        },
    }
</script>

<style scoped>

</style>
