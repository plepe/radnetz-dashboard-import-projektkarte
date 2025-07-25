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
      const nid = project_dash.nid[0].value

      if (id === 0) {
        console.log('skip', nid)
        return done()
      }

      load_projektkarte_projekt(id, (err, project_pk) => {
        let update = convertToDashboard(project_pk)
        const protokollEntry = {
          type: [{ target_id: 'status_aenderung' }],
          title: [{ value: 'änderung' }],
          field_datum: [{ value: new Date().toISOString().substr(0, 10) }]
        }

        if (project_dash.field_projektkarte_titel.length) {
          update = findChanges(update, project_dash, protokollEntry)

          if (Object.keys(update).length) {
            update.field_projektkarte_aenderung = [{ value: new Date().toISOString().substr(0, 10) }]
          }
        } else {
          protokollEntry.field_status = update.field_projektkarte_status
        }

        // für 'weitere Bauprojekte', change status if status in projektkarte changes
        if (project_dash.type[0].target_id == 'bauprojekte_andere' && update.field_projektkarte_status) {
          update.field_status = update.field_projektkarte_status
        }

        if (!Object.keys(update).length) {
          console.log('no changes', nid)
          return done()
        }

        // console.log('protokoll', protokollEntry)
        // console.log('update', nid, update)

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

            // if no manual geometry has been entered, copy from projektkarte
            if (!project_dash.field_geometry.length) {
              update.field_geometry = update.field_projektkarte_geometrie
            }

            drupal.nodeSave(nid, update, {}, (err, result) => {
              if (err) { return done(err) }

              console.log('done', nid)
              done()
            })
          }
        ], (err) => done(err))
      })
    })
  }
])
