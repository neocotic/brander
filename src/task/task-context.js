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

const _config = Symbol('config');
const _inputFiles = Symbol('inputFiles');
const _options = Symbol('options');
const _outputFile = Symbol('outputFile');
const _type = Symbol('type');

/**
 * Contains contextual information that is based on configuration data which can be executed by a supporting
 * {@link Task} to generate assets.
 *
 * While it's possible to create an instance using the constructor, it's highly recommended that {@link TaskParser} is
 * used instead.
 *
 * @public
 */
class TaskContext {

  /**
   * Creates an instance of {@link TaskContext}.
   *
   * @param {TaskType} type - the associated {@link TaskType} to be used
   * @param {File[]} inputFiles - the input files to be used
   * @param {?File} outputFile - the output file to be used (may be <code>null</code>)
   * @param {Object} options - the options to be used
   * @param {Config} config - the {@link Config} to be used
   * @public
   */
  constructor(type, inputFiles, outputFile, options, config) {
    this[_type] = type;
    this[_inputFiles] = inputFiles;
    this[_outputFile] = outputFile;
    this[_options] = options;
    this[_config] = config;
  }

  /**
   * Resolves the value of the option for the specified <code>name</code> within this {@link TaskContext}.
   *
   * Optionally, if <code>defaultValue</code> is specified and this {@link TaskContext} contains no options, or the
   * desired option is missing, it will be returned instead. Otherwise, this method will return <code>undefined</code>.
   *
   * @param {string|string[]} name - the paths or path segments to the property on the options object whose value is to
   * be returned
   * @param {*} [defaultValue] - the value to be returned for <code>undefined</code> resolved values.
   * @return {*} The resolved option value.
   * @public
   */
  option(name, defaultValue) {
    return _.get(this[_options], name, defaultValue);
  }

  /**
   * Returns the {@link Config} for this {@link TaskContext}.
   *
   * @return {Config} The configuration.
   * @public
   */
  get config() {
    return this[_config];
  }

  /**
   * Returns the input files for this {@link TaskContext}.
   *
   * The array will never be empty and will always contain at least one input {@link File}.
   *
   * @return {File[]} The input files.
   * @public
   */
  get inputFiles() {
    return this[_inputFiles].slice();
  }

  /**
   * Returns the output {@link File} for this {@link TaskContext}.
   *
   * The {@link File} will be <code>null</code> if there is none but it should only ever be <code>null</code> for task
   * types that the output file is optional or unnecessary (see {@link TaskType#outputRequired}).
   *
   * @return {?File} The output file or <code>null</code> if there is none.
   * @public
   */
  get outputFile() {
    return this[_outputFile];
  }

  /**
   * Returns the {@link TaskType} associated with this {@link TaskContext}.
   *
   * @return {TaskType} The task type.
   * @public
   */
  get type() {
    return this[_type];
  }

}

module.exports = TaskContext;
