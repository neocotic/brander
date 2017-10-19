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

const _ = require('lodash');
const debug = require('debug')('brander:config');
const { EventEmitter } = require('events');
const pollock = require('pollock');

const _config = Symbol('config');
const _currentIndex = Symbol('currentIndex');
const _dataSet = Symbol('dataSet');

/**
 * Capable of parsing {@link Context} information within a data set extracted from configuration data. The parsing is
 * generally done iteratively via {@link ContextParser#parseNext} but there's also an option to bulk parse all remaining
 * contexts via {@link ContextParser#parseRemaining}.
 *
 * In order to re-use a <code>ContextParser</code> to parse the same data set again, for whatever reason,
 * {@link ContextParser#reset} must be called in order to restore the iterator index to zero.
 *
 * @public
 * @abstract
 */
class ContextParser extends EventEmitter {

  /**
   * Creates an instance of {@link ContextParser} with the specified <code>dataSet</code> and <code>config</code>.
   *
   * @param {Object[]} dataSet - the data set to be parsed
   * @param {Config} config - the {@link Config} to be used
   * @public
   */
  constructor(dataSet, config) {
    super();

    this[_dataSet] = dataSet;
    this[_config] = config;
    this[_currentIndex] = 0;
  }

  /**
   * Parses the next data within the data set of this {@link ContextParser}, where possible.
   *
   * Multiple {@link Context} instances can be returned by this method, however, it's perfectly acceptable for
   * implementations to never return more than one instance at a time, but it must always be wrapped within an array.
   *
   * If the data is <code>null</code> or the implementation deems that it contains no {@link Context} information, then
   * this method will be resolved with an empty array. However, if there is no more data within the data set, then this
   * method will be resolved with <code>null</code>.
   *
   * An error will occur if the implementation is unable to parse the data, for whatever reason.
   *
   * @return {Promise.<Context[], Error>} A <code>Promise</code> for asynchronous data parsing that is resolved with
   * each parsed {@link Context} or <code>null</code> if there is no more available data.
   * @fires ContextParser#parsed
   * @public
   */
  async parseNext() {
    const index = this[_currentIndex]++;
    if (index === this[_dataSet].length) {
      debug('No more data to be parsed');

      return null;
    }

    const data = _.cloneDeep(this[_dataSet][index]);
    if (!data) {
      debug('No data found at index: %d', index);

      return [];
    }

    debug('Creating context for data at index: %d', index);

    const contexts = await this.parseData(data, index);

    /**
     * The "parsed" event is fired immediately after context data is parsed.
     *
     * @event ContextParser#parsed
     * @type {Object}
     * @property {Context[]} contexts - The {@link Context} instances parsed from <code>data</code>.
     * @property {Object} data - The data that was parsed.
     * @property {number} index - The index of the parsed data within the data set.
     */
    this.emit('parsed', { contexts, data, index });

    debug('%d contexts created for data at index: %d', contexts.length, index);

    return contexts;
  }

  /**
   * Parses all of the remaining data within the data set of this {@link ContextParser}, where possible.
   *
   * If there is no more data within this data set, then this method will be resolved with an empty array.
   *
   * An error will occur if the implementation is unable to parse any of the remaining data, for whatever reason.
   *
   * @return {Promise.<Context[], Error>} A <code>Promise</code> for asynchronous data parsing that is resolved with
   * each parsed {@link Context}.
   * @fires ContextParser#parsed
   * @public
   */
  async parseRemaining() {
    let contexts;

    while ((contexts = await this.parseNext()) != null) {
      for (const context of contexts) {
        contexts.push(context);
      }
    }

    return contexts;
  }

  /**
   * Resets this {@link ContextParser} so that the data set can be parsed again from the beginning.
   *
   * @return {void}
   * @fires ContextParser#reset
   * @public
   */
  reset() {
    this[_currentIndex] = 0;

    /**
     * The "reset" event is fired when the iterator index is reset to zero.
     *
     * @event ContextParser#reset
     */
    this.emit('reset');
  }

  /**
   * Returns the {@link Config} for this {@link ContextParser}.
   *
   * @return {Config} The configuration.
   * @public
   */
  get config() {
    return this[_config];
  }

}

/**
 * Parses the specified <code>data</code> that was extracted from the <code>index</code> provided within the data set of
 * this {@link ContextParser} and returns potentially multiple {@link Context} instances derived from that
 * <code>data</code>.
 *
 * <code>data</code> is a clone of the original value found within the data set to avoid accidental modifications.
 *
 * If no {@link Context} instances can be derived from the parsed <code>data</code>, then this method should be resolved
 * with an empty array.
 *
 * An error will occur if a problem occurs while trying to parse <code>data</code> (e.g. it's malformed or incomplete).
 *
 * All implementations of {@link ContextParser} <b>must</b> override this method.
 *
 * @param {Object} data - the data to be parsed
 * @param {number} index - the index of <code>data</code> within the original data set
 * @return {Promise.<Context[], Error>} A <code>Promise</code> for asynchronous data parsing that is resolved with
 * each {@link Context} derived from parsing <code>data</code>.
 * @protected
 * @abstract
 * @memberof ContextParser#
 * @method parseData
 */
pollock(ContextParser, 'parseData', { promise: true });

module.exports = ContextParser;
