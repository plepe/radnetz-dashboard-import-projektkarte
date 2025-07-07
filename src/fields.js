const fields = {
  field_projektkarte_titel: {
    name: 'Ort',
    property: 'value',
    projektkarte_property: 'title'
  },
  field_projektkarte_massnahme: {
    name: 'Maßnahme',
    property: 'value',
    projektkarte_property: 'short_text'
  },
  field_projektkarte_beschreibung: {
    name: 'Beschreibung',
    property: 'value',
    projektkarte_property: 'long_text'
  },
  field_projektkarte_link_info: {
    name: 'Link',
    property: 'uri',
    projektkarte_property: 'link'
  },
  field_projektkarte_laenge: {
    name: 'Länge',
    property: 'value',
    projektkarte_property: 'length',
    parse_property: (value) => parseFloat(value),
    checkEqual: (pk, dash) => Math.abs(pk[0].value - dash[0].value) < 0.1
  },
  field_projektkarte_geometrie: {
    name: 'Geometrie',
    property: 'value'
  }
}

export default fields
