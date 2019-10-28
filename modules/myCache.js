import {writeFile} from 'fs'
import axios from 'axios'


export default function myCache(moduleOptions) {

  //console.log(this) // has srcDir: somewhere
  //console.log(this.options.axios.baseURL)
  //console.log("my cache", moduleOptions)

  axios.get(this.options.axios.baseURL + "/init")
    .then(res => {
      let data = res.data.result

      console.log("storing codes: ", Array.from(Object.keys(data.codes)))
      writeFile("lib/data_backups/codes.json", JSON.stringify(data.codes), "utf8", (err) => {
        if (err) {
          console.log("module myCache had problems saving file", err)
        }
      })

      // todo fuck why no keys?!
      let entrytypes = []
      for(let a of data.entryTemplates.values()) {
        entrytypes.push(a[1].title)
      }
      console.log("entry types ", entrytypes)
      writeFile("lib/data_backups/types.json", JSON.stringify(data.entryTemplates), "utf8", (err) => {
        if (err) {
          console.log("module myCache had problems saving file", err)
        }
      })
    })
    .catch((err) => {
      console.log("couldn't grab new types and codes from server")
    })

}
