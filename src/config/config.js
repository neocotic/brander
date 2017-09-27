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
const path = require('path');

const Logger = require('../logger');

const _baseDir = Symbol('baseDir');
const _data = Symbol('data');
const _filePath = Symbol('filePath');
const _logger = Symbol('logger');
const _name = Symbol('name');
const _title = Symbol('title');

/**
 * TODO: document
 *
 * @public
 */
class Config {

  /**
   * Creates an instance of {@link Config} with the specified <code>data</code> loaded from the <code>filePath</code>
   * provided.
   *
   * Optionally, <code>logger</code> can be specified to control where output messages are written to. By default, a
   * {@link Logger} with no output streams will be used so that such messages are not written at all.
   *
   * @param {string} filePath - the path of the file from where the configuration data was loaded
   * @param {Object} data - the configuration data to be used
   * @param {Logger} [logger] - the {@link Logger} to be used
   * @public
   */
  constructor(filePath, data, logger) {
    this[_filePath] = filePath;
    this[_data] = data;
    this[_logger] = logger || new Logger();
    this[_baseDir] = path.dirname(filePath);
    this[_name] = _.trim(data.name);
    this[_title] = _.trim(data.title) || this[_name];
  }

  /**
   * Evaluates the specified <code>expression</code> by interpolating data properties and executing embedded JavaScript.
   *
   * Optionally, <code>additionalData</code> can be provided to expose more variables to <code>expression</code> during
   * evaluation.
   *
   * A <code>config</code> variable can be used within the expression to reference this {@link Config}.
   *
   * @param {string} expression - the expression to be evaluated
   * @param {Object} [additionalData] - an object whose properties will be exposed as variables when the expression is
   * evaluated
   * @return {string} The evaluated output.
   * @public
   */
  evaluate(expression, additionalData) {
    if (!expression) {
      return '';
    }

    const compiled = _.template(expression);

    return compiled(Object.assign({ config: this }, additionalData));
  }

  /**
   * Resolves the value of the option for the specified <code>name</code> within this {@link Config}.
   *
   * Optionally, if <code>defaultValue</code> is specified and the data for this {@link Config} contains no options, or
   * the desired option is missing from those options, it will be returned instead. Otherwise, this method will return
   * <code>undefined</code>.
   *
   * @param {string|string[]} name - the paths or path segments to the property on the options object within the data
   * whose value is to be returned
   * @param {*} [defaultValue] - the value to be returned for <code>undefined</code> resolved values.
   * @return {*} The resolved option value.
   * @public
   */
  option(name, defaultValue) {
    return _.get(this[_data].options, name, defaultValue);
  }

  /**
   * Resolves the specified sequence of <code>paths</code> or path segments into an absolute path relative to the base
   * directory from where the data for this {@link Config} was originally loaded.
   *
   * @param {...string} paths - the sequence of paths or path segments to be resolved
   * @return {string} An absolute file path.
   * @public
   */
  resolve(...paths) {
    return path.resolve(this.baseDir, ...paths);
  }

  /**
   * @override
   */
  toString() {
    return `Config(${this.name})`;
  }

  /**
   * Returns the path of the base directory from where the data for this {@link Config} was originally loaded.
   *
   * @return {string} The configuration base directory.
   * @public
   */
  get baseDir() {
    return this[_baseDir];
  }

  /**
   * Returns the path of the file from where the data for this {@link Config} was originally loaded.
   *
   * @return {string} The configuration file path.
   * @public
   */
  get filePath() {
    return this[_filePath];
  }

  /**
   * Returns the {@link Logger} for this {@link Config}.
   *
   * The logger can be used at any time to log normal/error messages.
   *
   * @return {Logger} The logger.
   * @public
   */
  get logger() {
    return this[_logger];
  }

  /**
   * Returns the name of the brand.
   *
   * The name should be in a format that is suitable for file paths while the title should be used when presenting the
   * brand.
   *
   * @return {string} The brand name.
   * @public
   */
  get name() {
    return this[_name];
  }

  /**
   * Returns the raw data for all tasks defined within this {@link Config}.
   *
   * The array will be empty if the "tasks" configuration is null, empty, or missing entirely.
   *
   * An error will occur if the "tasks" configuration is present but is not an array.
   *
   * @return {Object[]} The raw task data.
   * @throws {Error} If the "tasks" configuration is not an array.
   * @public
   */
  get tasks() {
    const { tasks } = this[_data];
    if (!tasks) {
      return [];
    }
    if (!Array.isArray(tasks)) {
      throw new Error('"tasks" configuration can only be an array');
    }

    return _.cloneDeep(tasks);
  }

  /**
   * Returns the title of the brand.
   *
   * The title should be used when presenting the brand while the name should be in a format that is suitable for file
   * paths. However, the name will be used where no title is available.
   *
   * @return {string} The brand title.
   * @public
   */
  get title() {
    return this[_title];
  }

}

module.exports = Config;
