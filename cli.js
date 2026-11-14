#!/usr/bin/env node
import fs from 'fs'
import async from 'async'
import yaml from 'js-yaml'
import DrupalREST from 'drupal-rest'
import load_projektkarte from './src/load_projektkarte.js'
import get_referenced_ids from './src/get_referenced_ids.js'
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
let referenced_ids

async.waterfall([
  (done) => drupal.login(done),
  (done) => statusDashboardInit(drupal, done),
  (done) => get_referenced_ids(config, drupal, (err, list) => {
    referenced_ids = list
    done(err)
  }),
  (done) => load_projektkarte(config, drupal, done),
  (result, done) => {
    dashboard_data = result

    Object.entries(referenced_ids).forEach(([id, nid]) => {
      const dashs = dashboard_data.filter(project_dash => project_dash.field_id[0].value == id)

      if (!dashs.length) {
        dashboard_data.push({
          type: [{target_id: 'bauprojekt_projektkarte'}],
          nid: [{value: null}],
          field_protokoll: [],
          field_id: [{value: id}],
        })
      }
    })

    async.mapSeries(dashboard_data, (project_dash, done) => {
      const id = project_dash.field_id[0].value
      const nid = project_dash.nid[0].value

      load_projektkarte_projekt(id, (err, project_pk) => {
        let update = {}
        const  protokollEntry = {
          type: [{ target_id: 'status_aenderung' }],
          title: [{ value: 'änderung' }],
          field_datum: [{ value: new Date().toISOString().substr(0, 10) }]
        }

        if (!nid) {
          if (!project_pk) {
            console.log('not creating', id)
            return done()
          }

          update = convertToDashboard(project_pk)
          update.field_id = [{value: id}]
          protokollEntry.field_status = update.field_status
        } else if (project_pk) {
          update = convertToDashboard(project_pk)

          update = findChanges(update, project_dash, protokollEntry)
        } else if (project_dash.field_status.length) {
          protokollEntry.body = [{ value: 'Projekt von der Projektkarte entfernt', format: 'basic_html' }]
          protokollEntry.field_status = []
          update.field_status = []
        }

        if (nid && update.field_status) {
          update.field_status_change = [{ value: new Date().toISOString().substr(0, 10) }]
        }

        // TODO: update referencing node
        // für 'weitere Bauprojekte', change status if status in projektkarte changes
        // if (project_dash.type[0].target_id == 'bauprojekte_andere' && update.field_projektkarte_status) {
        //   update.field_status = update.field_status
        // }

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
            update.field_protokoll = project_dash.field_protokoll
            update.field_protokoll.push({ target_id: protokollId })

            // TODO: update referencing node
            // if no manual geometry has been entered, copy from projektkarte
            //if (!project_dash.field_geometry.length) {
            //  update.field_geometry = update.field_projektkarte_geometrie
            //}

            drupal.nodeSave(nid, update, {}, (err, result) => {
              if (err) { return done(err) }

              console.log('done', result.nid[0].value)
              done()
            })
          }
        ], (err) => done(err))
      })
    })
  }
])
