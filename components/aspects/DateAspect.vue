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
          prepend-icon="mdi-calendar"
          readonly
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker v-model="value"  :show-current="false" @change="value_change($event)" no-title @input="menu = false"></v-date-picker>
    </v-menu>
  </div>
  <div v-else class="mb-2 mt-2">
    <v-icon readonly  solo flat> mdi-calendar</v-icon>
    <span class="ml-2">{{value}}</span>
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
