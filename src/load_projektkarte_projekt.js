function load_projektkarte_projekt (id, callback) {
  fetch('https://dataconnector.maptoolkit.net/wien/fahrradwien/' + id + '.geojson?api_key=wien', {
    headers: {
      Origin: 'https://www.fahrradwien.at'
    }
  })
    .then(req => req.text())
    .then(data => {
      if (data === 'no item found') {
        return callback(null, null)
      }

      data = JSON.parse(data)

      if (data.properties.link) {
        data.properties.link = JSON.parse(data.properties.link)
        data.properties.link = data.properties.link.url
      } else {
        data.properties.link = null
      }

      data.properties.images = JSON.parse(data.properties.images)
      data.properties.images = data.properties.images.filter(img => img.caption !== 'Symbolbild')

      callback(null, data)
    })
    .catch(e => {
      callback(e)
    })
}

export default load_projektkarte_projekt
