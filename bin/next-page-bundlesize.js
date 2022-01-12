#!/usr/bin/env node

// eslint-disable-next-line import/no-internal-modules
const run = require("../pkg/cjs").default

try {
  run(process.argv)
} catch (err) {
  // eslint-disable-next-line no-console
  console.log(err)
  process.exit(1)
}

process.exit(0)
