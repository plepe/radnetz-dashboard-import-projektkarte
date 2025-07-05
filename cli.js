#!/usr/bin/env node
import fs from 'fs'
import async from 'async'
import yaml from 'js-yaml'
import DrupalREST from 'drupal-rest'
import load_dashboard_data from './src/load_dashboard_data.js'
import load_projektkarte_projekt from './src/load_projektkarte_projekt.js'
import convertToDashboard from './src/convertFromDashboard.js'
import { init as statusDashboardInit } from './src/statusDashboard.js'

const config = yaml.load(fs.readFileSync('config.yaml'))

const drupal = new DrupalREST({
  url: config.drupalUrl,
  user: config.drupalUser,
  pass: config.drupalPass
})

let dashboard_data

async.waterfall([
  (done) => drupal.login(done),
  (done) => statusDashboardInit(drupal, done),
  (done) => load_dashboard_data(config, drupal, done),
  (result, done) => {
    dashboard_data = result
    async.mapSeries(dashboard_data, (project_dash, done) => {
      const id = project_dash.field_projektkarte_id[0].value
      load_projektkarte_projekt(id, (err, project_pk) => {
        let update = convertToDashboard(project_pk)

        update.type = project_dash.type
        drupal.nodeSave(project_dash.nid[0].value, update, {}, (err, result) => {
          if (err) { return done(err) }

          console.log('done', project_dash.nid[0].value)
          done()
        })
      })
    })
  }
])
