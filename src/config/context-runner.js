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

/* istanbul ignore file */

const { EventEmitter } = require('events');
const pollock = require('pollock');

const _config = Symbol('config');
const _contextsOrParser = Symbol('contextsOrParser');
const _runContext = Symbol('runContext');
const _runContexts = Symbol('runContexts');

/**
 * Capable of running {@link Context} instances sequentially which can either be provided directly or extracted
 * iteratively via a {@link ContextParser}.
 *
 * @public
 * @abstract
 */
class ContextRunner extends EventEmitter {

  /**
   * Creates an instance of {@link ContextRunner}.
   *
   * @param {Context[]|ContextParser} contextsOrParser - the {@link Context} instances to be run or a
   * {@link ContextParser} to be used to extract them
   * @param {Config} config - the {@link Config} to be used
   * @public
   */
  constructor(contextsOrParser, config) {
    super();

    this[_contextsOrParser] = contextsOrParser;
    this[_config] = config;
  }

  /**
   * Iterates over each {@link Context} and runs them sequentially.
   *
   * The result of running each {@link Context} is mapped to an array with which this method is resolved.
   *
   * An error will occur if a {@link ContextParser} was provided during initialization and an error occurs while trying
   * to parse any data within the data set or if the implementation is unable to run any of the {@link Context}
   * instances.
   *
   * @return {Promise.<Array, Error>} A <code>Promise</code> for the asynchronous running, and potentially parsing, of
   * each {@link Context} that is resolved with an array containing their results.
   * @fires ContextRunner#ran
   * @public
   */
  async run() {
    let results;

    await this.runBefore(this[_config]);

    try {
      results = await this[_runContexts]();
    } finally {
      await this.runAfter(this[_config]);
    }

    return results;
  }

  /**
   * Called after all contexts have been ran for the specified <code>config</code>, regardless of whether an error
   * occurred while doing so.
   *
   * This method does nothing by default.
   *
   * @param {Config} config - the {@link Config} for which the contexts were ran
   * @return {Promise.<void, Error>} A <code>Promise</code> for any asynchronous work needed after running all contexts.
   * @protected
   */
  runAfter(config) {}

  /**
   * Called before any contexts are run for the specified <code>config</code>.
   *
   * This method does nothing by default.
   *
   * @param {Config} config - the {@link Config} for which the contexts are going to be run
   * @return {Promise.<void, Error>} A <code>Promise</code> for any asynchronous work needed before running any
   * contexts.
   * @protected
   */
  runBefore(config) {}

  async [_runContext](context) {
    const result = await this.runContext(context);

    /**
     * The "ran" event is fired immediately after a context has ran.
     *
     * @event ContextRunner#ran
     * @type {Object}
     * @property {Context} context - The {@link Context} that has ran.
     * @property {*} result - The result of running <code>context</code>.
     */
    this.emit('ran', { context, result });

    return result;
  }

  async [_runContexts]() {
    const results = [];

    if (Array.isArray(this[_contextsOrParser])) {
      for (const context of this[_contextsOrParser]) {
        const result = await this[_runContext](context);

        results.push(result);
      }
    } else {
      let contexts;

      while ((contexts = await this[_contextsOrParser].parseNext()) != null) {
        for (const context of contexts) {
          const result = await this[_runContext](context);

          results.push(result);
        }
      }
    }

    return results;
  }

}

/**
 * Runs the specified <code>context</code>.
 *
 * This method is resolved with the result of running <code>context</code>, if any.
 *
 * An error will occur if a problem occurs while trying to run <code>context</code>.
 *
 * All implementations of {@link ContextRunner} <b>must</b> override this method.
 *
 * @param {Context} context - the {@link Context} to run
 * @return {Promise.<*, Error>} A <code>Promise</code> for the asynchronous running of <code>context</code> that is
 * resolved with its result.
 * @protected
 * @abstract
 * @memberof ContextRunner#
 * @method runContext
 */
pollock(ContextRunner, 'runContext', { promise: true });

module.exports = ContextRunner;
