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
//  (done) => statusDashboardInit(drupal, done),
  (done) => load_dashboard_data(config, drupal, done),
  (result, done) => {
    dashboard_data = result
    async.mapSeries(dashboard_data, (project_dash, done) => {
      const nid = project_dash.nid[0].value

      console.log('A', nid, project_dash.field_projektkarte_protokoll)
      async.filterSeries(project_dash.field_projektkarte_protokoll, (pitem, done) => {
        if (!pitem.target_type) {
          return done(null, false)
        }

        drupal.nodeGet(pitem.target_id, {}, (err, item) => {
          if (err) { return done(err) }

          let result = false
          if (item.field_status.length) {
            result = true
          }
          if (item.body.length) {
            result = true
          }

          if (result === true) {
            return done(null, true)
          }

          console.log('remove', pitem.target_id)
          drupal.nodeRemove(pitem.target_id, {}, (err) => {
            if (err) { return done(err) }
            return done(null, false)
          })
        })
      }, (err, list) => {
        if (err) { return done(err) }
        console.log('B', nid, list)

        if (list.length === project_dash.field_projektkarte_protokoll.length) {
          return done()
        }

        const update = {
          type: project_dash.type,
          field_projektkarte_protokoll: list
        }

        drupal.nodeSave(nid, update, {}, (err) => {
          if (err) { return done(err) }
          done()
        })
      })
    })
  }
], (err) => {
  console.log(err)
})
