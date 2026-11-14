import wkx from 'wkx'
import { get as statusGet } from './statusDashboard.js'

const fields = {
  title: {
    old: 'field_projektkarte_titel',
    name: 'Ort',
    property: 'value',
    projektkarte_property: 'title'
  },
  field_jahr: {
    old: 'field_projektkarte_jahr',
    name: 'Jahr',
    property: 'value',
    parse_property: (value) => parseInt(value),
    projektkarte_property: 'year_of_construction'
  },
  field_massnahme: {
    old: 'field_projektkarte_massnahme',
    name: 'Maßnahme',
    property: 'value',
    projektkarte_property: 'short_text'
  },
  field_beschreibung: {
    old: 'field_projektkarte_beschreibung',
    name: 'Beschreibung',
    property: 'value',
    projektkarte_property: 'long_text'
  },
  field_link_info: {
    old: 'field_projektkarte_link_info',
    name: 'Link',
    property: 'uri',
    projektkarte_property: 'link'
  },
  field_laenge: {
    old: 'field_projektkarte_laenge',
    name: 'Länge',
    property: 'value',
    projektkarte_property: 'length',
    parse_property: (value) => parseFloat(value),
    checkEqual: (pk, dash) => Math.abs(pk[0].value - dash[0].value) < 0.1
  },
  field_geometry: {
    old: 'field_projektkarte_geometrie',
    name: 'Geometrie',
    property: 'value',
    parse_property: (value, item) => wkx.Geometry.parseGeoJSON(item.geometry).toWkt(),
    // for hide_changes, highlight changes only when lat/lon affected
    hide_changes: (pk, dash) => {
      let m = pk[0].value.match(/^MULTILINESTRING( Z|) \(\((.*)\)\)$/)
      const pkv = m[2].split('),(')
      m = dash[0].value.match(/^MULTILINESTRING( Z|) \(\((.*)\)\)$/)
      const dashv = m[2].split('),(')

      if (pkv.length !== dashv.length) {
        return false
      }

      const notableChanges = pkv.filter((_p, i) => {
        const pv = pkv[i].split(',').map(v => v.trim())
        const dv = dashv[i].split(',').map(v => v.trim())

        if (pv.length !== dv.length) {
          return true
        }

        const valueChanges = pv.filter((_v, j) => {
          const pc = pv[j].split(' ')
          const dc = dv[j].split(' ')
          return pc[0] !== dc[0] || pc[1] !== dc[1]
        })

        return valueChanges.length
      })

      return !notableChanges.length
    }
  },
  field_status: {
    old: 'field_projektkarte_status',
    name: 'Status',
    property: 'target_id',
    projektkarte_property: 'status',
    parse_property: (value) => statusGet(value),
    hide_changes: true
  }
}

export default fields
