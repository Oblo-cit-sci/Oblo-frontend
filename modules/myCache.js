import {readFileSync, constants as fsconstants, writeFile} from 'fs'
import axios from 'axios'


export default function myCache(moduleOptions) {

  //console.log(this) // has srcDir: somewhere
  //console.log(this.options.axios.baseURL)
  //console.log("my cache", moduleOptions)

  axios.get(this.options.axios.baseURL + "/init")
    .then(res => {
      let data = res.data.result
      writeFile("lib/codes_.json", JSON.stringify(data.codes), "utf8", (err) => {
        if (err) {
          console.log("module myCache had problems saving file", err)
        }
      })

      writeFile("lib/types_.json", JSON.stringify(data.entryTemplates), "utf8", (err) => {
        if (err) {
          console.log("module myCache had problems saving file", err)
        }
      })
    })
    .catch((err) => {
      console.log("couldn't cache types and codes", err)
    })

}
