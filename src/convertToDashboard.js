import wkx from 'wkx'
import { get as statusGet } from './statusDashboard.js'
import fields from './fields.js'

function convertToDashboard (project_pk) {
  const result = {}

  Object.entries(fields).forEach(([key, def]) => {
    if (def.projektkarte_property || def.parse_property) {
      let value = def.projektkarte_property ? project_pk.properties[def.projektkarte_property] : null

      if (def.parse_property) {
        value = def.parse_property(value, project_pk)
      }

      result[key] = [{}]
      result[key][0][def.property] = value
    }
  })

  return result
}

export default convertToDashboard
