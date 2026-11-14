import load_dashboard_data from './load_dashboard_data.js'

function get_referenced_ids (config, drupal, callback) {
  load_dashboard_data(config, drupal, (err, list) => {
    if (err) { return callback(err) }

    const result = {}

    list.forEach(item => {
      item.field_projektkarte_id.forEach(f => {
        result[f.value] = item
      })
    })

    delete result['0'] // value of 0 means no projektkarte entry

    callback(null, result)
  })
}

export default get_referenced_ids
