#!/usr/bin/env node

/*
 * Copyright (C) 2023 neocotic
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/* eslint-disable no-process-exit */

import { program } from 'commander';
import debug from 'debug';
import { createRequire } from 'node:module';

import { Brander } from '../src/brander.mjs';
import { ConfigLoader } from '../src/config/config-loader.mjs';
import { Logger } from '../src/logger.mjs';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

(async() => {
  program
    .version(version)
    .usage('[options]')
    .option('-c, --config <path>', 'use configuration from this file')
    .option('-d, --debug', 'enable debug level logging')
    .option('--no-color', 'disables color output')
    .option('--only-assets', 'only generate assets')
    .option('--only-docs', 'only generate documentation')
    .option('-q, --quiet', 'disables all logging output')
    .parse(process.argv);

  const configPath = program.getOptionValue('config');
  const isDebugEnabled = program.getOptionValue('debug');
  const isOnlyAssets = program.getOptionValue('onlyAssets');
  const isOnlyDocs = program.getOptionValue('onlyDocs');
  const isQuietEnabled = program.getOptionValue('quiet');

  if (isDebugEnabled && !isQuietEnabled) {
    debug.enable('brander*');
  }

  const logger = new Logger({ enabled: !isQuietEnabled });

  try {
    const configLoader = new ConfigLoader({ logger });
    const config = await configLoader.load(configPath);
    const brander = new Brander(config);

    await brander.generate({
      skipAssets: isOnlyDocs,
      skipDocs: isOnlyAssets
    });
  } catch (e) {
    logger.error(e.stack);

    process.exit(1);
  }
})();
