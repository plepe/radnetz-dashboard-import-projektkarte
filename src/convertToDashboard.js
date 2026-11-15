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

  result.field_bild = []
  project_pk.properties.images.forEach(image => {
    result.field_bild.push({
      target_type: 'fileUpload',
      data: {
        src: image.src,
      },
      alt: image.alt
    })
  })

  return result
}

export default convertToDashboard
