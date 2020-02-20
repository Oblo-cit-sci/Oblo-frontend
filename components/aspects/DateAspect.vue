<template>
  <div v-if="readOnly" class="mb-2 mt-2">
    <v-icon readonly  solo flat> mdi-calendar</v-icon>
    <span class="ml-2">{{value}}</span>
  </div>
  <div v-else>
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
          v-bind:value="value_str"
          outlined
          single-line
          :label="aspect.name"
          prepend-icon="mdi-calendar"
          readonly
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker :value="value"  :show-current="false" @change="update_value($event)" no-title @input="menu = false"></v-date-picker>
    </v-menu>
  </div>

</template>

<script>

  import AspectComponentMixin from "./AspectComponentMixin";

  export default {
    name: "DateAspect",
    mixins: [AspectComponentMixin],
    data() {
      return {
        menu: false,
      }
    },
    computed: {
      value_str() {
        if(this.value)
          return this.value.toString().substring(0,10)
        else
          return ""
      }
    }
  }
</script>

<style scoped>

</style>
