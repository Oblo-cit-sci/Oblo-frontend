import {readFileSync, writeFileSync} from 'jsonfile'




export default function myCache(moduleOptions) {
  const version = {version: readFileSync("package.json").version}
  writeFileSync("app/version.json", version)
}
