#!/usr/bin/env node
import fs from 'fs'
import async from 'async'
import yaml from 'js-yaml'
import DrupalREST from 'drupal-rest'
import load_dashboard_data from './src/load_dashboard_data.js'
import load_projektkarte_projekt from './src/load_projektkarte_projekt.js'
import convertToDashboard from './src/convertToDashboard.js'
import { init as statusDashboardInit } from './src/statusDashboard.js'
import findChanges from './src/findChanges.js'

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
        let protokollEntry = {
          type: [{ target_id: 'status_aenderung' }],
          title: [{ value: 'änderung' }],
          field_datum: [{ value: new Date().toISOString().substr(0, 10) }]
        }

        if (project_dash.field_projektkarte_titel.length) {
          update = findChanges(update, project_dash, protokollEntry)
        } else {
          protokollEntry.field_status = update.field_projektkarte_status
        }

        if (!Object.keys(update).length) {
          console.log('no changes', project_dash.nid[0].value)
          return done()
        }

        // console.log('protokoll', protokollEntry)
        // console.log('update', update)

        async.waterfall([
          (done) => {
            drupal.nodeSave(null, protokollEntry, {}, (err, result) => {
              if (err) { return done(err) }
              done(null, result.nid[0].value)
            })
          },
          (protokollId, done) => {
            update.type = project_dash.type
            update.field_projektkarte_protokoll = project_dash.field_projektkarte_protokoll
            update.field_projektkarte_protokoll.push({ target_id: protokollId })

            drupal.nodeSave(project_dash.nid[0].value, update, {}, (err, result) => {
              if (err) { return done(err) }

              console.log('done', project_dash.nid[0].value)
              done()
            })
          }
        ], (err) => done(err))
      })
    })
  }
])
