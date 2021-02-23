<template lang="pug">
  div
    v-btn(v-if="show_prev" :disabled="!_has_prev" @click="change_page(-1)" small outlined color="blue") {{$t("comp.simple_paginate.prev")}}
    v-btn(:disabled="!_has_next" @click="change_page(1)" small outlined color="blue" :loading="next_loading") {{$t("comp.simple_paginate.next")}}
    span.ml-2(v-if="show_page_index")
      span {{$t("comp.simple_paginate.page")}}: {{page}} &nbsp;
      span(v-if="total_pages") / {{total_pages}}
</template>

<script>
/**
 * TODO FIX THIS!
 * COUNTING SHOULD STATY WITH 1 (NOT WITH 0)
 */
export default {
  name: "SimplePaginate",
  mixins: [],
  components: {},
  props: {
    value: {
      type: Number,
      required: true
    },
    total_pages: Number,
    show_prev: {type: Boolean, default: true},
    has_next: Boolean,
    next_loading: Boolean,
    show_page_index: {
      type: Boolean,
      default: true
    },
    allow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  },
  created() {
    if (this.total_pages === undefined && this.has_next === undefined) {
      console.log("SimplagePaginate error. Either total_pages or has_next must be specified")
    }
  },
  computed: {
    page() {
      return this.value
    },
    _has_next() {
      if (this.total_pages) {
        return this.page < this.total_pages && this.allow
      } else {
        return this.has_next && this.allow
      }
    },
    _has_prev() {
      return this.page > 1 && this.allow
    }
  },
  methods: {
    change_page(dir) {
      this.$emit('input', this.page + dir)
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>
