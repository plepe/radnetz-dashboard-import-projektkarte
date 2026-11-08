#!/usr/bin/env node
import fs from 'fs'
import async from 'async'
import yaml from 'js-yaml'
import DrupalREST from 'drupal-rest'
import load_dashboard_data from './src/load_dashboard_data.js'
import load_projektkarte from './src/load_projektkarte.js'
import fields from './src/fields.js'

const config = yaml.load(fs.readFileSync('config.yaml'))

const drupal = new DrupalREST({
  url: config.drupalUrl,
  user: config.drupalUser,
  pass: config.drupalPass
})

let dashboard_data
let mapping = {}
let converted = {}
let all = {}

async.waterfall([
  (done) => drupal.login(done),
  (done) => load_dashboard_data(config, drupal, done),
  (result, done) => {
    async.each(result, migrate_data, done)
    //console.log(JSON.stringify(result, null, '  '))
  },
  (done) => load_projektkarte(config, drupal, (err, result) => {
    result.forEach(item => {
      converted[item.field_id[0].value] = item
    })
    done(err)
  }),
  (done) => {
    async.eachSeries(all, update_status_change, done)
  },
  (done) => {
    //console.log(mapping)
    console.log(JSON.stringify(all, null, '  '))
    saveAll(all, done)
  }
])

function migrate_data (item, callback) {
  if (!item.field_projektkarte_id.length || !item.field_projektkarte_id[0].value) {
    return callback()
  }

  //console.log(JSON.stringify(item, null, '  '))
  const result = {
    type: [{target_id: 'bauprojekt_projektkarte'}],
    field_id: item.field_projektkarte_id
  }

  Object.entries(fields).forEach(([field_id, def]) => {
    if (def.old) {
      result[field_id] = item[def.old]
    }
  })

  if (item.field_projektkarte_id[0].value in mapping) {
    if (mapping[item.field_projektkarte_id[0].value].length < item.field_projektkarte_protokoll.length) {
      mapping[item.field_projektkarte_id[0].value].id = item.nid[0].value
      mapping[item.field_projektkarte_id[0].value].length = item.field_projektkarte_protokoll.length

      result.field_protokoll = item.field_projektkarte_protokoll
      result.field_status_change = item.field_projektkarte_aenderung
      all[item.field_projektkarte_id[0].value] = result
    }
  } else {
    mapping[item.field_projektkarte_id[0].value] = {
      ids: []
    }

    mapping[item.field_projektkarte_id[0].value].id = item.nid[0].value
    mapping[item.field_projektkarte_id[0].value].length = item.field_projektkarte_protokoll.length

    result.field_protokoll = item.field_projektkarte_protokoll
    result.field_status_change = item.field_projektkarte_aenderung
    all[item.field_projektkarte_id[0].value] = result
  }
  mapping[item.field_projektkarte_id[0].value].ids.push(item.nid[0].value)

  //console.log(JSON.stringify(result, null, '  '))
  callback(null, result)
}

function update_status_change (item, callback) {
  let last //= item.field_status_change.length ? item.field_status_change[0].value : null
  item.field_status_change = []

  async.each(item.field_protokoll.slice(1), (pid, done) => {
    drupal.nodeGet(pid.target_id, {}, (err, e) => {
      if (e.field_status.length) {
        if (!last || e.field_datum[0].value > last) {
          last = e.field_datum[0].value
        }
      }

      done()
    })
  }, (err) => {
    //console.log('=>', item.field_status_change.length ? item.field_status_change[0].value : null, last)
    if (last) {
      item.field_status_change = [{ value: last }]
    }
    callback()
  })
}

function saveAll (data, callback) {
  async.eachSeries(data, (item, done) => {
    if (item.field_id[0].value in converted) {
      const body = converted[item.field_id[0].value]
      console.log(item.field_id[0].value, 'already entered', body.nid[0].value)
      return done()
    }

    drupal.nodeSave(null, item, {}, (err, body) => {
      if (err) { return done(err) }

      console.log(item.field_id[0].value, '=>', body.nid[0].value)
      done()
    })
  })
}
