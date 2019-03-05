<template>
  <div>
    <div>
      <el-button type="primary">{{ui_text.site}}</el-button>
      <el-button type="primary">{{ui_text.village}}</el-button>
    </div>
    <br>
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item :title="ui_text.village" name="1">
        <el-button type="primary">{{ui_text.village_info_card}}</el-button>
        <el-button type="primary">{{ui_text.focus_group}}</el-button>
      </el-collapse-item>
      </el-collapse>
  </div>
</template>

<script>
    export default {
        name: "CreateEntry",
        data() {
          return {
            ui_text: {
              "site": "Site",
              "village": "Village",
              "village_info_card": "Village Information Card",
              "focus_group": "Focus Group Discussion"
          }
          }
        }
    }
</script>

<style scoped>


</style>
