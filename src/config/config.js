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

// TODO: complete

const _ = require('lodash');
const path = require('path');

const Asset = require('../asset/asset');
const Category = require('./category');

const _baseDir = Symbol('baseDir');
const _data = Symbol('data');
const _filePath = Symbol('filePath');

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
   * @param {string} filePath - the path of the file from where the configuration data was loaded
   * @param {Object} data - the configuration data to be used
   * @public
   */
  constructor(filePath, data) {
    this[_filePath] = filePath;
    this[_data] = data;
    this[_baseDir] = path.dirname(filePath);
  }

  /**
   * TODO: document
   *
   * @param {string} name -
   * @return {Category}
   * @public
   */
  category(name) {
    const categories = this[_data].categories || {};

    for (const [ key, value ] of categories) {
      if (key === name) {
        return new Category(key, value);
      }
    }

    return new Category(name);
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
   * @param {string|string[]} name - the be paths or path segments to the property on the options object within the data
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
    return path.resolve(this[_baseDir], ...paths);
  }

  /**
   * TODO: document
   *
   * @return {Asset[]}
   * @public
   */
  get assets() {
    return Object.entries(this[_data].assets || {})
      .map(([ key, value ]) => new Asset(key, value || {}, this));
  }

  /**
   * TODO: document
   *
   * @return {Category[]}
   * @public
   */
  get categories() {
    return Object.entries(this[_data].categories || {})
      .map(([ key, value ]) => new Category(key, value));
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
   * Returns the name of the brand.
   *
   * The name should be in a format that is suitable for file paths while the title should be used when presenting the
   * brand.
   *
   * @return {string} The brand name.
   * @public
   */
  get name() {
    return this[_data].name;
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
    return this[_data].title || this[_data].name;
  }

}

module.exports = Config;
