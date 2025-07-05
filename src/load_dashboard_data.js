function load_dashboard_data (config, callback) {
  fetch('https://radnetz-dashboard.radlobby.at/projektkarte.json', {
  })
    .then(req => req.json())
    .then(data => callback(null, data))
}

export default load_dashboard_data
