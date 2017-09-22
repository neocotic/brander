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

const Converter = require('./converter');
const Formats = require('./formats');
const Optimizer = require('./optimizer');
const Sizes = require('./sizes');

const _baseDir = Symbol('baseDir');
const _config = Symbol('config');
const _convert = Symbol('convert');
const _data = Symbol('data');
const _name = Symbol('name');
const _optimize = Symbol('optimize');
const _parseOptions = Symbol('parseOptions');

/**
 * TODO: document
 *
 * @public
 */
class Asset {

  /**
   * TODO: document
   *
   * @param {string} name -
   * @param {Object} data -
   * @param {Config} config -
   * @public
   */
  constructor(name, data, config) {
    this[_name] = name;
    this[_data] = data;
    this[_config] = config;
    this[_baseDir] = config.resolve(config.option('assets.dir', 'assets'), data.path || name);
  }

  /**
   * Evaluates the specified <code>expression</code> by interpolating data properties and executing embedded JavaScript.
   *
   * Optionally, <code>additionalData</code> can be provided to expose more variables to <code>expression</code> during
   * evaluation.
   *
   * In addition to variables exposed by {@link Config#evaluate}, an <code>asset</code> variable can be used within the
   * expression to reference this {@link Asset}.
   *
   * @param {string} expression - the expression to be evaluated
   * @param {Object} [additionalData] - an object whose properties will be exposed as variables when the expression is
   * evaluated
   * @return {string} The evaluated output.
   * @public
   */
  evaluate(expression, additionalData) {
    return this[_config].evaluate(expression, Object.assign({ asset: this }, additionalData));
  }

  /**
   * TODO: document
   *
   * @return {Promise.<Error>}
   * @public
   */
  async generate() {
    await this[_convert]();
    await this[_optimize]();
  }

  /**
   * Resolves the specified sequence of <code>paths</code> or path segments into an absolute path relative to the base
   * directory for this {@link Asset}.
   *
   * @param {...string} paths - the sequence of paths or path segments to be resolved
   * @return {string} An absolute file path.
   * @public
   */
  resolve(...paths) {
    return path.resolve(this[_baseDir], ...paths);
  }

  /**
   * Returns the path of the base directory for this {@link Asset}.
   *
   * @return {string} The asset base directory.
   * @public
   */
  get baseDir() {
    return this[_baseDir];
  }

  /**
   * Returns the {@link Config} for this {@link Asset}.
   *
   * @return {Config} The configuration.
   * @public
   */
  get config() {
    return this[_config];
  }

  /**
   * Returns the name of this {@link Asset}.
   *
   * The name should be in a format that is suitable for file paths while the title should be used when presenting this
   * asset.
   *
   * @return {string} The name.
   * @public
   */
  get name() {
    return this[_name];
  }

  /**
   * Returns the title for this {@link Asset}.
   *
   * The title should be used when presenting this asset while the name should be in a format that is suitable for file
   * paths. However, the name will be used where no title is available.
   *
   * @return {string} The title.
   * @public
   */
  get title() {
    return this[_data].title || this[_name];
  }

  async [_convert]() {
    const convertibles = this[_data].convert;
    if (_.isEmpty(convertibles)) {
      return;
    }

    for (const convertible of convertibles) {
      const options = this[_parseOptions](convertible);
      const converter = Converter.getInstance(options);

      await converter.generate(this, options);
    }
  }

  async [_optimize]() {
    const optimizibles = this[_data].optimize;
    if (_.isEmpty(optimizibles)) {
      return;
    }

    for (const optimizible of optimizibles) {
      const options = this[_parseOptions](optimizible);
      const optimizer = Optimizer.getInstance(options);

      await optimizer.generate(this, options);
    }
  }

  [_parseOptions](data) {
    if (!data) {
      throw new Error(`Missing data to generate asset: ${this[_name]}`);
    }

    const isSourceArray = Array.isArray(data.source);
    const options = {
      source: isSourceArray ? data.source.map(_.trim) : _.trim(data.source),
      sourceFormat: Formats.sanitize(data.sourceFormat),
      target: _.trim(data.target) || null,
      targetFormat: Formats.sanitize(data.targetFormat),
      sizes: data.sizes ? data.sizes.map(Sizes.parse) : null
    };

    if (!options.source || (isSourceArray && options.source.includes(''))) {
      throw new Error(`Missing source to generate asset: ${this[_name]}`);
    }

    if (!options.sourceFormat) {
      options.sourceFormat = Formats.deriveFromFileName(_.castArray(options.source)[0]);
    }
    if (!options.targetFormat && options.target) {
      options.targetFormat = Formats.deriveFromFileName(options.target);
    }

    return options;
  }

}

module.exports = Asset;
