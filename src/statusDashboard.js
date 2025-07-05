let values

function init (drupal, callback) {
  values = {}

  drupal.loadRestExport('rest/status', { paginated: true }, (err, list) => {
    list.forEach(item => {
      if (item.field_projektkarte_status.length) {
        values[item.field_projektkarte_status[0].value] = item.tid[0].value
      }
    })

    console.log(values)
    callback(null)
  })
}

function get (str) {
  if (!values) {
    throw new Error('statusDashboard not initialized!')
  }

  if (!(str in values)) {
    throw new Error('invalid value "' + str + '"')
  }

  return values[str]
}

export {
  get,
  init
}
