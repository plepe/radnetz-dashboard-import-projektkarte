import wkx from 'wkx'
import { get as statusGet } from './statusDashboard.js'

function convertToDashboard (project_pk) {
  const result = {}

  result.field_projektkarte_titel = [{ value: project_pk.properties.title }]
  result.field_projektkarte_massnahme = [{ value: project_pk.properties.short_text }]
  result.field_projektkarte_beschreibung = [{ value: project_pk.properties.long_text }]
  result.field_projektkarte_link_info = [{ uri: project_pk.properties.link }]
  result.field_projektkarte_laenge = [{ value: parseFloat(project_pk.properties.length) }]
  result.field_projektkarte_status = [{ target_id: statusGet(project_pk.properties.status) }]
  result.field_projektkarte_geometrie = [{ value: wkx.Geometry.parseGeoJSON(project_pk.geometry).toWkt() }]

  return result
}

export default convertToDashboard
