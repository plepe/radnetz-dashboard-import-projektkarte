import wkx from 'wkx'
import { get as statusGet } from './statusDashboard.js'
import fields from './fields.js'

function convertToDashboard (project_pk) {
  const result = {}

  Object.entries(fields).forEach(([key, def]) => {
    if (def.projektkarte_property) {
      let value = project_pk.properties[def.projektkarte_property]

      if (def.parse_projektkarte_property) {
        value = def.parse_projektkarte_property(value)
      }

      result[key] = [{}]
      result[key][0][def.property] = value
    }
  })

  result.field_projektkarte_status = [{ target_id: statusGet(project_pk.properties.status) }]
  result.field_projektkarte_geometrie = [{ value: wkx.Geometry.parseGeoJSON(project_pk.geometry).toWkt() }]

  return result
}

export default convertToDashboard
