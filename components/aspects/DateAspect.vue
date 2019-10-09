<template>
  <div v-if="edit">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-bind:value="i_value_str"
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
        menu: false,
      }
    },
    computed: {
      i_value_str() {
        if(this.i_value)
          return this.i_value.toString().substring(0,10)
        else
          return ""
      }
    }
  }
</script>

<style scoped>

</style>
