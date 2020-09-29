<template>
  <div v-if="is_view_mode" class="mb-2 mt-2">
    <v-icon readonly solo flat> mdi-calendar</v-icon>
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
          clearable
          @input="clear_date"
          :label="aspect.name"
          :hide_details="hide_details"
          prepend-icon="mdi-calendar"
          readonly
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        :value="value"
        :hide_details="hide_details"
        :max="future"
        :show-current="false"
        @change="update_value($event)"
        no-title
        @input="menu = false">
      </v-date-picker>
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
        if (this.value)
          return this.value.toString().substring(0, 10)
        else
          return ""
      },
      future() {
        return new Date().toISOString()
      }
    },
    methods: {
      clear_date() {
        this.update_value(null)
      }
    }
  }
</script>

<style scoped>

</style>
