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
          v-bind:value="value_str"
          outlined
          single-line
          :label="aspect.name"
          prepend-icon="event"
          readonly
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker value="value" @change="value_change($event)" no-title @input="menu = false"></v-date-picker>
    </v-menu>
  </div>
  <div v-else>
    <v-text-field
      :value="value"
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
      created() {
        if(!this.value) {
            this.value_change(new Date().toISOString())
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
