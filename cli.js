#!/usr/bin/env node
import fs from 'fs'
import async from 'async'
import yaml from 'js-yaml'
import DrupalREST from 'drupal-rest'
import load_dashboard_data from './src/load_dashboard_data.js'
import load_projektkarte_projekt from './src/load_projektkarte_projekt.js'

const config = yaml.load(fs.readFileSync('config.yaml'))

const drupal = new DrupalREST({
  url: config.drupalUrl,
  user: config.drupalUser,
  pass: config.drupalPass
})

let dashboard_data

async.waterfall([
  (done) => drupal.login(done),
  (done) => load_dashboard_data(config, drupal, done),
  (result, done) => {
    dashboard_data = result
    async.mapSeries(dashboard_data, (data, done) => {
      const id = data.field_projektkarte_id[0].value
      load_projektkarte_projekt(id, (err, result) => {
        console.log(id, JSON.stringify(result, null, '  '))
      })
    })
  }
])
