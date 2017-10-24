/*
 * Copyright (C) 2017 Alasdair Mercer, !ninja
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

'use strict';

const chalk = require('chalk');

const DocumentContextParser = require('./doc/document-context-parser');
const DocumentContextRunner = require('./doc/document-context-runner');
const TaskContextParser = require('./task/task-context-parser');
const TaskContextRunner = require('./task/task-context-runner');

const _config = Symbol('config');

/**
 * Generates assets and documentation based on an associated {@link Config}.
 *
 * @public
 */
class Brander {

  /**
   * Creates an instance of {@link Brander} with the <code>config</code> provided.
   *
   * @param {Config} config - the {@link Config} to be used
   * @public
   */
  constructor(config) {
    this[_config] = config;
  }

  /**
   * Generates the assets and documentation based on the configuration for this {@link Brander}.
   *
   * Optionally, <code>options</code> can be provided for more granular control.
   *
   * Nothing happens if both the <code>skipAssets</code> and <code>skipDocs</code> options are <code>true</code>.
   *
   * An error will occur if a problem arises while generating the assets or documentation.
   *
   * @param {Brander~GenerateOptions} [options] - the options to be used
   * @return {Promise.<void, Error>} A <code>Promise</code> for the asynchronous generation of assets and documentation.
   * @public
   */
  async generate(options = {}) {
    const { config } = this;
    const { logger, scope } = config;

    scope.clear();

    if (options.skipAssets && options.skipDocs) {
      logger.warn('Both skipAssets and skipDocs options enabled. Nothing to do!');

      return;
    }

    if (!options.skipAssets) {
      logger.log('Generating assets...');
      logger.log();

      const taskContextParser = new TaskContextParser(config.tasks, config);
      taskContextParser.on('parsed', ({ contexts }) => scope.addAllTasks(contexts));
      const taskContextRunner = new TaskContextRunner(taskContextParser, config);

      await taskContextRunner.run();
    }

    if (!options.skipDocs) {
      if (!options.skipAssets) {
        logger.log();
      }
      logger.log('Generating documentation...');
      logger.log();

      const documentContextParser = new DocumentContextParser(config.docs, config, 'root');
      documentContextParser.on('parsed', ({ contexts }) => scope.addAllDocs(contexts));
      const documentContexts = await documentContextParser.parseRemaining();
      const documentContextRunner = new DocumentContextRunner(documentContexts, config);

      await documentContextRunner.run();
    }

    logger.log();
    logger.log(chalk.green('Done!'));
  }

  /**
   * Returns the {@link Config} for this {@link Brander}.
   *
   * @return {Config} The configuration.
   * @public
   */
  get config() {
    return this[_config];
  }

}

module.exports = Brander;

/**
 * The options that can be passed to {@link Brander#generate}.
 *
 * @typedef {Object} Brander~GenerateOptions
 * @property {boolean} [skipAssets] - <code>true</code> to skip asset generation; otherwise <code>false</code>.
 * @property {boolean} [skipDocs] - <code>true</code> to skip documentation generation; otherwise <code>false</code>.
 */
