<template lang="pug">
  v-expansion-panels(:value="[0]" :style="{width:'300px'}")
    v-expansion-panel
      v-expansion-panel-header.px-3.py-1 {{$t()}}
      v-expansion-panel-content.px-2.py-1.no-wrap
        v-list(dense)
          v-list-item-group(multiple mandatory)
            v-list-item(color="green" :ripple="false")
              v-list-item-icon
                v-icon.mr-0(color="green" x-small) mdi-checkbox-blank-circle
              v-list-item-title Local Observation
            v-list-item(color="red" :ripple="false")
              v-list-item-icon
                  v-icon(color="red" x-small) mdi-checkbox-blank-circle
              v-list-item-title Article Review

</template>

<script>
export default {
  name: "Legend",
  mixins: [],
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
