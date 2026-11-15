#!/usr/bin/env node
import argparse from 'argparse'
import load_projektkarte_projekt from './src/load_projektkarte_projekt.js'

const parser = new argparse.ArgumentParser({
  add_help: true,
  description: 'Prints out the data of one of the projects of the Fahrrad Wien Projektkarte'
})

parser.add_argument('id', {
  help: 'ID of the project'
})

const args = parser.parse_args()

load_projektkarte_projekt(args.id, (err, result) => {
  if (err) {
    console.error(err.message)
    process.exit(1)
  }

  console.log(JSON.stringify(result, null, '  '))
})
