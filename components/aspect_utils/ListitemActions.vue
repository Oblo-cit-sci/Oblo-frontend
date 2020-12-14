<template lang="pug">
  div
    v-btn(v-if="requires_delete" small @click="$emit('remove_value', index)") {{$t('comp.list_asp.actions.delete_item', {item_name: itemname})}}
    span(v-if="moveable")
      v-btn(:disabled="index === 0" small @click="$emit('move', [index, -1])") {{$t('comp.list_asp.actions.move_up')}}
        v-icon(right) mdi-arrow-up-bold
      v-btn(:disabled="index === listlength"  down small @click="$emit('move', [index, 1])") {{$t('comp.list_asp.actions.move_down')}}
        v-icon(right) mdi-arrow-down-bold
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
