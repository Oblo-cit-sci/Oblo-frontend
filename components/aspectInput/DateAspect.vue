<template>
  <div v-if="edit">
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
          v-model="i_value"
          :label="aspect.name"
          prepend-icon="event"
          readonly
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker v-model="i_value" no-title @input="menu = false;value_change(i_value)"></v-date-picker>
    </v-menu>
  </div>
  <div v-else>
    <v-text-field
      :value="i_value"
      :label="aspect.name"
      prepend-icon="event"
      readonly  solo flat
    ></v-text-field>
  </div>
</template>

<script>

  import AspectMixin from "./AspectMixin";

  export default {
    name: "DateAspect",
    mixins: [AspectMixin],
    data() {
      return {
        menu: false
      }
    },
    created() {
      if (this.value === null) {
        this.i_value = new Date().toISOString().substr(0, 10);
      }
    }
  }
</script>

<style scoped>

</style>
