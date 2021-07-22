<template lang="pug">
  div
    LoadFileButton(v-if="is_editable_mode"
      :label="add_btn_label"
      filetype="audio"
      :size_limit="max_image_size"
      @fileload="add_image($event)")
</template>

<script>
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin";
import AttachedFilesMixin from "~/components/aspect_utils/AttachedFilesMixin";
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";

export default {
  name: "AudioAspect",
  mixins: [AspectComponentMixin, AttachedFilesMixin, TriggerSnackbarMixin],
}
</script>

<style scoped>

</style>
