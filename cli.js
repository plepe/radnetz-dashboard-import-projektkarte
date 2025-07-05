#!/usr/bin/env node
import async from 'async'
import load_dashboard_data from './src/load_dashboard_data.js'
import load_projektkarte_projekt from './src/load_projektkarte_projekt.js'

const config = {
}

let dashboard_data

async.waterfall([
  (done) => load_dashboard_data(config, done),
  (result, done) => {
    dashboard_data = result
    async.mapSeries(dashboard_data, (data, done) => {
      const id = data.field_projektkarte_id
      load_projektkarte_projekt(id, (err, result) => {
        console.log(id, JSON.stringify(result, null, '  '))
      })
    })
  }
])
