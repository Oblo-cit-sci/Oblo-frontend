export function import_data(data, pattern) {
  for (let store_location of pattern) {

  }
}

/*

this should be a easy method
to pic one location json
*/
function rec_obj(data, loc) {
  let res = {}
  if (loc.length === 0) {
    return data
  } else {
    res[loc[0]] = rec_obj(data[loc[0]], loc.splice(1, 1))
    return res
  }
}

export function mirror_location(data, loc) {
 return rec_obj(data, loc)
}

export function mirror_locations(state, locations) {
  let result = {}
  for(let location of locations) {
    Object.assign(result, mirror_location(state, location))
  }
  return result
}

