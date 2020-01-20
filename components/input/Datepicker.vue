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
        v-model="date"
        label="Creation date"
        prepend-icon="event"
        readonly
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker v-model="date" no-title @input="menu = false"></v-date-picker>
  </v-menu>
</template>

<script>
  export default {
    name: "Datepicker",
    data: () => ({
      date: new Date().toISOString().substr(0, 10),
      menu: false,
    })
  }
</script>

<style scoped>

</style>
