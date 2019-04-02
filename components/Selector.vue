<template lang="pug">
    div
      v-list(two-line)
        v-list-tile(v-for="(item, slug) in options" :key="item.title" @click="sellect(item)")
          v-list-tile-content
            v-list-tile-title {{item.title}}
            v-list-tile-sub-title {{item.description}}
</template>

<script>

    // v-list-tile-title {{item.title}}

    let clearListThresh = 10;

    let CLEAR_LIST = 0;

    export default {
        name: "Selector",
        props: ["options", "selection"],
        computed: {
          viewStyle() {
            console.log("options");
            console.log(this.options);
            if(this.options.length < this.clearListThresh) {
              return CLEAR_LIST
            }
          }
        },
      methods: {
        sellect(item) {
          this.$emit('update:selection', item.slug);
        }
      }
    }
</script>

<style scoped>

</style>
