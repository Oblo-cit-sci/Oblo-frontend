<template lang="pug">
  div
    v-btn(v-if="requires_delete" small @click="$emit('remove_value', index)") delete {{itemname}}
    span(v-if="moveable")
      v-btn(:disabled="index === 0" small @click="$emit('move', [index, -1])") move up
        v-icon(right) keyboard_arrow_up
      v-btn(:disabled="index === listlength"  down small @click="$emit('move', [index, 1])") move down
        v-icon(right) keyboard_arrow_down
</template>

<script>
    export default {
        name: "ListitemActions",
        props: {
            requires_delete: {type: Boolean, default: true},
            itemname: {type: String},
            moveable: {type: Boolean, default: false},
            index: {type: Number, required: true},
            listlength: {type: Number, required: true}
        }
    }
</script>

<style scoped>

</style>
