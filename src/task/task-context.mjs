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

/* istanbul ignore file */

import { get } from 'lodash-es';

import { Context } from '../config/context.mjs';

/**
 * Contains contextual information that is based on task-related configuration data which can be executed by a
 * supporting {@link Task} to generate assets.
 *
 * While it's possible to create an instance using the constructor, it's highly recommended that
 * {@link TaskContextParser} is used instead.
 *
 * @public
 */
export class TaskContext extends Context {

  /**
   * @type {File[]}
   * @private
   */
  #inputFiles;
  /**
   * @type {Object}
   * @private
   */
  #options;
  /**
   * @type {?File}
   * @private
   */
  #outputFile;
  /**
   * @type {TaskType}
   * @private
   */
  #type;

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
    super(config);

    this.#type = type;
    this.#inputFiles = inputFiles;
    this.#outputFile = outputFile;
    this.#options = options;
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
    return get(this.#options, name, defaultValue);
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
    return [ ...this.#inputFiles ];
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
    return this.#outputFile;
  }

  /**
   * Returns the {@link TaskType} associated with this {@link TaskContext}.
   *
   * @return {TaskType} The task type.
   * @public
   */
  get type() {
    return this.#type;
  }

}
