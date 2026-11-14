import fields from './fields.js'

function findChanges (project_pk, project_dash, protokollEntry) {
  const update = {}
  let text = ''

  Object.entries(fields).forEach(([key, def]) => {
    if (!project_dash[key].length) {
      if (project_pk[key].length && project_pk[key][0][def.property]) {
        if (!def.hide_changes) {
          text += def.name + ' geändert von ""<br>'
        }

        update[key] = project_pk[key]
      }
    } else if (def.checkEqual) {
      if (!def.checkEqual(project_pk[key], project_dash[key])) {
        const hide_changes = def.hide_changes === true || (typeof def.hide_changes === 'function' && def.hide_changes(project_pk[key], project_dash[key]))
        if (!hide_changes) {
          text += def.name + ' geändert von "' + project_dash[key][0][def.property] + '"<br>'
        }

        update[key] = project_pk[key]
      }
    } else if (project_pk[key][0][def.property] !== project_dash[key][0][def.property]) {
      const hide_changes = def.hide_changes === true || (typeof def.hide_changes === 'function' && def.hide_changes(project_pk[key], project_dash[key]))
      if (!hide_changes) {
        text += def.name + ' geändert von "' + project_dash[key][0][def.property] + '"<br>'
      }

      update[key] = project_pk[key]
    }
  })

  if (!project_dash.field_status.length || project_pk.field_status[0].target_id !== project_dash.field_status[0].target_id) {
    protokollEntry.field_status = project_pk.field_status
  }

  if (text) {
    protokollEntry.body = [{ value: text, format: 'basic_html' }]
  }

  return update
}

export default findChanges
