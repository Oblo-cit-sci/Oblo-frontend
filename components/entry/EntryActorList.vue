<template lang="pug">
    div
        v-chip.ml-1(v-for="actor_role in actors" pill :key="actor_role.actor.registered_name")
            v-avatar(left)
                v-img(:src="avatar(actor_role.actor)")
            span {{actor_role.actor.public_name}}
</template>

<script>
    export default {
        name: "EntryActorList",
        props: {
            actors: {
                type: Array
            }
        },
        methods: {
            avatar(actor) {
                return this.$api.url_actor__$registered_name__avatar(actor.registered_name)
            }
        }
    }
</script>

<style scoped>

</style>
