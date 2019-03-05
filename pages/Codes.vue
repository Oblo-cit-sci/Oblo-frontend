<template>
  <v-flex
    xs12
    sm8
    md6
  >
    <v-list
      v-for="(codetype, i) in tempCodes"
      :key="i">
      <div>
        <!-- not sure about :ct isnt that a 2way binding? -->
        <codemap v-if="codetype.type === 'map'" :ct=codetype></codemap>
        <valuelist v-if="codetype.type === 'list'" :ct=codetype></valuelist>
      </div>
    </v-list>
  </v-flex>
</template>

<script>
  import Codemap from "../components/Codemap";
  import Valuelist from "../components/Valuelist";

  import country_codes from "../codes/country_codes_short";

  export default {
    name: "Codes",
    components: {Valuelist, Codemap},
    data: () => ({
      tempCodes: [
        {
          title: "Yes/No Response",
          type: "map",
          options: {
            Yes: 1,
            No: 0,
            "Do not know": -9
          }
        },
        {
          title: "Investigator",
          type: "list",
          values:
          ["André Braga Junqueira"]
        },
        {
          title: "Country Codes",
          type: "map",
          options: country_codes
        }
        ]
    })
  }
</script>

<style scoped>

</style>
