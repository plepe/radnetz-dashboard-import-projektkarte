function convertFromDashboard (project_dash) {
  const result = {}

  result.title = project_dash.field_projektkarte_titel.length ? project_dash.field_projektkarte_titel[0].value : null
  result.link = project_dash.field_projektkarte_link_info.length ? project_dash.field_projektkarte_link_info[0].value : null
  result.short_text = project_dash.field_projektkarte_massnahme.length ? project_dash.field_projektkarte_massnahme[0].value : null
  result.long_text = project_dash.field_projektkarte_beschreibung.length ? project_dash.field_projektkarte_beschreibung[0].value : null
  result.length = project_dash.field_projektkarte_laenge.length ? project_dash.field_projektkarte_laenge[0].value : null
  result.status = project_dash.field_projektkarte_status.length ? project_dash.field_projektkarte_status[0].value : null
  //result.images = project_dash.field_projektkarte_bilder.length ? project_dash.field_projektkarte_bilder[0].value : null

  return result
}

export default convertFromDashboard
