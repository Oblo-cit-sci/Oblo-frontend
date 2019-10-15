import {readFileSync, writeFileSync} from 'jsonfile'

/**
 * the idea was to have this json, so that the pwa, if it wouldnt go online first (which it was doing before)
 * can grab the version number, to let the user know about a new version...
 * @param moduleOptions
 */
export default function myCache() {
  const version = {version: readFileSync("package.json").version}
  writeFileSync("app/version.json", version)
}
