<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    lazy
    transition="scale-transition"
    offset-y
    full-width
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model="value"
        :label="aspect.name"
        prepend-icon="event"
        readonly
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker v-model="value" no-title @input="menu = false"></v-date-picker>
    {{value}}
  </v-menu>
</template>

<script>

    import AspectMixin from "./AspectMixin";

    export default {
        name: "DateAspect",
        props: ["aspect"],
        mixins: [AspectMixin],
        data() {
          return {
            menu: false
          }
        },
        created() {
          this.value = new Date().toISOString().substr(0, 10);
        }
    }
</script>

<style scoped>

</style>
