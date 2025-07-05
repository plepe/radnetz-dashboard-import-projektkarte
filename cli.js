#!/usr/bin/env node
import async from 'async'
import load_dashboard_data from './src/load_dashboard_data.js'

const config = {
}

let dashboard_data

async.waterfall([
  (done) => load_dashboard_data(config, done),
  (result, done) => {
    dashboard_data = result
  }
])
