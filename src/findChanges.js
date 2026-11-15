import path from 'path'
import fields from './fields.js'

const today = new Date().toISOString().substr(0, 10)

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

  const current = {}
  const current_bild = {}
  const done = {}
  project_dash.field_bild.forEach(img => {
    current_bild[img.target_id] = img
    let filename = path.basename(img.url)
    current[filename] = img.target_id
    const m = filename.match(/^(.*)\.([A-Za-z0-9]+)$/)
    let basename = m ? m[1] : ''

    while (basename.match(/^(.*)_[0-9]$/)) {
      const m1 = basename.match(/^(.*)_[0-9]$/)
      if (m1) {
        basename = m1[1]
      }
    }

    if (basename) {
      filename = basename + '.' + m[2]
    }

    img.basename = filename
    current[filename] = img.target_id
  })

  const field_bild = []
  const text_bild = []
  project_pk.field_bild.forEach(img => {
    const filename = path.basename(img.data.src)

    if (filename in current) {
      const img_dash = current_bild[current[filename]]
      done[filename] = true

      let dash_alt = img_dash.alt
      let dash_comment = ''
      const m = dash_alt.match(/^(.*)( \((entfernt|veröffentlicht).*\))$/)
      if (m) {
        dash_alt = m[1]
        dash_comment = m[2]
      }

      if (img.alt !== dash_alt) {
        img_dash.alt = img.alt + dash_comment
        text_bild.push('Alt-Text von Bild ' + filename + ' verändert von "' + dash_alt + '"<br>')
      }

      field_bild.push(img_dash)
    } else {
      img.alt += ' (veröffentlicht am ' + today + ')'
      img.added = true
      field_bild.push(img)
      text_bild.push('Bild ' + filename + ' veröffentlicht<br>')
      done[filename] = true
    }
  })

  Object.values(current_bild).forEach(img_dash => {
    if (img_dash.basename in done) { return }

    const filename = path.basename(img_dash.url)
    const m = img_dash.alt.match(/^(.*) \(((entfernt|veröffentlicht).*)\)$/)

    if (m) {
      const m1 = m[2].match(/entfernt am [0-9-]+$/)

      if (!m1) {
        img_dash.alt = m[1] + ' (' + m[2] + ', entfernt am ' + today + ')'
        text_bild.push('Bild ' + filename + ' entfernt<br>')
      }
    } else {
      img_dash.alt = img_dash.alt + ' (entfernt am ' + today + ')'
      text_bild.push('Bild ' + filename + ' entfernt<br>')
    }

    img_dash.removed = true
    field_bild.push(img_dash)
    done[filename] = true
  })

  // check order
  const order_old = project_dash.field_bild
    .filter(img => !img.removed)
    .map(img => img.basename)
  const order_new = project_pk.field_bild
    .filter(img => !img.added)
    .map(img => path.basename(img.data.src))

  if (order_old.join(',') !== order_new.join(',')) {
    text_bild.push('Bilder Reihenfolge geändert von: ' + order_old.join(', '))
  }

  if (text_bild.length) {
    text += text_bild.join('\n')
    update.field_bild = field_bild
  }

  if (text) {
    protokollEntry.body = [{ value: text, format: 'basic_html' }]
  }

  return update
}

export default findChanges
