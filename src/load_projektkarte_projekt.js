function load_projektkarte_projekt (id, callback) {
  fetch('https://dataconnector.maptoolkit.net/wien/fahrradwien/' + id + '.geojson?api_key=wien', {
    headers: {
      'Origin': 'https://www.fahrradwien.at'
    }
  })
    .then(req => req.json())
    .then(data => {
      data.properties.link = JSON.parse(data.properties.link)
      data.properties.images = JSON.parse(data.properties.images)

      callback(null, data)
    })
}

export default load_projektkarte_projekt
