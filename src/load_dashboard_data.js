function load_dashboard_data (config, drupal, callback) {
  drupal.loadRestExport('rest/projektkarte', { paginated: true }, callback)
}

export default load_dashboard_data
