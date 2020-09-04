export default {
  name: "URLParseMixin",
  methods: {
    search_config(search_param) {
      if (!search_param)
        return null
      /**
       * FORMAT: <search config name>:<value_0>,<value_1>...;
       */
      const s_configs = search_param.split(";")
      const configs = []
      for (let config of s_configs) {
        const parts = config.split(":")
        if (parts.length !== 2) { // name:value
          continue
        }
        configs.push({name: parts[0], value: parts[1].split(",")})
      }
      return configs
    }
  }
}
