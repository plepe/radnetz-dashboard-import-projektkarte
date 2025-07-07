const fields = {
  field_projektkarte_titel: {
    name: 'Ort',
    property: 'value'
  },
  field_projektkarte_massnahme: {
    name: 'Maßnahme',
    property: 'value'
  },
  field_projektkarte_beschreibung: {
    name: 'Beschreibung',
    property: 'value'
  },
  field_projektkarte_link_info: {
    name: 'Link',
    property: 'uri'
  },
  field_projektkarte_laenge: {
    name: 'Länge',
    property: 'value',
    checkEqual: (pk, dash) => Math.abs(pk[0].value - dash[0].value) < 0.1
  },
  field_projektkarte_geometrie: {
    name: 'Geometrie',
    property: 'value'
  }
}

export default fields
