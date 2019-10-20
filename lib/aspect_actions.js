export function get_action(action_name) {
  if (actions.hasOwnProperty(action_name)) {
    return actions[action_name]
  } else {
    console.log("ERR todo: call_action no action ", action_name)
    return null
  }
}

export const get_device_location = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      res => {
        resolve(res.coords)
      }, err => {
        reject(err)
      })
  })
}

export const assign_result = () => {

}

const actions = {
  "get_device_location": get_device_location
}

