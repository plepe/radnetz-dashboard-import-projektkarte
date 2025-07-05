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
  }
//  field_projektkarte_geometry: {
//    name: 'Geometrie',
//    property: 'value'
//  }
}

function findChanges (project_pk, project_dash, protokollEntry) {
  const update = {}
  let text = ''

  Object.entries(fields).forEach(([key, def]) => {
    if (!project_dash[key].length) {
    } else if (def.checkEqual) {
      if (!def.checkEqual(project_pk[key], project_dash[key])) {
        text += def.name + ' geändert von "' + project_dash[key][0][def.property] + '"<br>'
        update[key] = project_pk[key]
      }
    } else if (project_pk[key][0][def.property] !== project_dash[key][0][def.property]) {
      text += def.name + ' geändert von "' + project_dash[key][0][def.property] + '"<br>'
      update[key] = project_pk[key]
    }
  })

  if (project_pk.field_projektkarte_status[0].target_id !== project_dash.field_projektkarte_status[0].target_id) {
    update.field_projektkarte_status = project_pk.field_projektkarte_status
    protokollEntry.field_status = project_pk.field_projektkarte_status
  }

  if (text) {
    protokollEntry.body = [{ value: text, format: 'basic_html' }]
  }

  return update
}

export default findChanges
