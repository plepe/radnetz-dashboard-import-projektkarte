function load_projektkarte_projekt (id, callback) {
  fetch('https://dataconnector.maptoolkit.net/wien/fahrradwien/' + id + '.geojson?api_key=wien', {
    headers: {
      'Origin': 'https://www.fahrradwien.at'
    }
  })
    .then(req => req.json())
    .then(data => {
      data.properties.link = JSON.parse(data.properties.link)
      if (data.properties.link) {
        data.properties.link = data.properties.link.url
      }

      data.properties.images = JSON.parse(data.properties.images)
      data.properties.images = data.properties.images.filter(img => img.caption !== 'Symbolbild')

      callback(null, data)
    })
}

export default load_projektkarte_projekt
