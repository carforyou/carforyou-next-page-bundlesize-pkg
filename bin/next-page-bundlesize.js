#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-internal-modules */
const run = require("../pkg/cjs").default
run(process.argv)
