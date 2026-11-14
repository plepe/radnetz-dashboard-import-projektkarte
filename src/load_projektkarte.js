function load_projektkarte (config, drupal, callback) {
  drupal.loadRestExport('rest/content?type=bauprojekt_projektkarte', { paginated: true }, callback)
}

export default load_projektkarte
