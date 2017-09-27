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

const debug = require('debug')('brander');

const TaskExecutor = require('./task/task-executor');

const _config = Symbol('config');

/**
 * TODO: document
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
   * An error will occur if a problem arises while generating the assets or documentation.
   *
   * @return {Promise.<Error>} A <code>Promise</code> for the asynchronous generation of assets and documentation.
   * @public
   */
  async generate() {
    await this.generateAssets();
    await this.generateDocs();
  }

  /**
   * Generates the assets based on the configuration for this {@link Brander}.
   *
   * An error will occur if a problem arises while generating the assets.
   *
   * @return {Promise.<Error>} A <code>Promise</code> for the asynchronous generation of assets.
   * @public
   */
  async generateAssets() {
    debug('Generating assets...');

    const executor = new TaskExecutor(this.config);

    await executor.execute();
  }

  /**
   * Generates the documentation based on the configuration for this {@link Brander}.
   *
   * An error will occur if a problem arises while generating the documentation.
   *
   * @return {Promise.<Error>} A <code>Promise</code> for the asynchronous generation of documentation.
   * @public
   */
  async generateDocs() {
    // FIXME: implement documentation generation
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
