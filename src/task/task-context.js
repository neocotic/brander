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
const glob = require('glob');
const path = require('path');
const util = require('util');

const File = require('./file');
const Size = require('./size');

const findFiles = util.promisify(glob);

const _buildInputFiles = Symbol('buildInputFiles');
const _buildOutputFile = Symbol('buildOutputFile');
const _config = Symbol('config');
const _createContexts = Symbol('createContexts');
const _createFile = Symbol('createFile');
const _inputFiles = Symbol('inputFiles');
const _isOutputRequired = Symbol('isOutputRequired');
const _options = Symbol('options');
const _outputFile = Symbol('outputFile');
const _parseOptions = Symbol('parseOptions');
const _type = Symbol('type');
const _validateSingleFormat = Symbol('validateSingleFormat');

/**
 * TODO: document
 *
 * @public
 */
class TaskContext {

  /**
   * Parses all of the tasks data within the <code>config</code> provided into {@link TaskContext} instances.
   *
   * The returned contexts can be used later when executing their corresponding tasks via the {@link TaskExecutor}.
   *
   * An error will occur if the tasks data within <code>config</code> is malformed or incomplete or if a problem occurs
   * while attempting to find input files.
   *
   * @param {Config} config - the {@link Config} whose tasks data is to be parsed
   * @return {Promise.<Error, TaskContext[]>} A <code>promise</code> for asynchronous parsing and file system
   * traversals that is resolved with each {@link TaskContext}.
   * @public
   */
  static async parse(config) {
    const contexts = [];

    for (const taskData of config.tasks) {
      const inputFiles = await TaskContext[_buildInputFiles](taskData, config);
      const options = TaskContext[_parseOptions](taskData);

      contexts.splice(contexts.length, 0, ...TaskContext[_createContexts](taskData, inputFiles, options, config));
    }

    return contexts;
  }

  static async [_buildInputFiles](data, config) {
    const { input } = data;
    if (!input) {
      throw new Error('"input" configuration is required');
    }
    if (!input.files) {
      throw new Error('"input.files" configuration is required');
    }
    if (!(typeof input.files === 'string' || Array.isArray(input.files))) {
      throw new Error(`"input.files" configuration can only be a string or an array: ${input.files} ` +
        `(${typeof input.files})`);
    }

    const dir = config.resolve(config.option('assets.dir', 'assets'), config.evaluate(_.trim(input.dir)));
    const files = _.castArray(input.files);
    const inputFiles = [];

    for (let pattern of files) {
      if (typeof pattern !== 'string') {
        throw new Error(`"input.files" configuration can only contain strings: ${pattern} (${typeof pattern})`);
      }

      pattern = _.trim(pattern);
      if (!pattern) {
        throw new Error('"input.files" configuration cannot contain null or empty patterns');
      }

      const filePaths = await findFiles(config.evaluate(pattern), { cwd: dir });

      for (const filePath of filePaths) {
        const dirPath = path.resolve(dir, path.dirname(filePath));
        const fileName = path.basename(filePath);
        const file = TaskContext[_createFile](dirPath, fileName, input.format, config, true);

        inputFiles.push(file);
      }
    }

    return inputFiles;
  }

  static [_buildOutputFile](data, config) {
    const { output } = data;
    if (!output) {
      return null;
    }
    if (output.files != null && typeof output.files !== 'string') {
      throw new Error(`"output.files" configuration can only be a string: ${output.files} (${typeof output.files})`);
    }

    let dirPath = _.trim(output.dir);
    dirPath = dirPath ? config.resolve(config.option('assets.dir', 'assets'), dirPath) : null;

    return TaskContext[_createFile](dirPath, output.files, output.format, config, false);
  }

  static [_createContexts](data, inputFiles, options, config) {
    const contexts = [];

    if (inputFiles.length === 0) {
      return contexts;
    }

    const type = _.trim(data.task).toLowerCase();
    if (!type) {
      throw new Error('"task" configuration is required');
    }

    const { groupBy } = options;
    const groups = _.groupBy(inputFiles, (file) => {
      switch (typeof groupBy) {
      case 'function':
        return groupBy({ config, file });
      case 'string':
        return config.evaluate(groupBy, { file });
      default:
        return null;
      }
    });

    for (const [ groupName, groupFiles ] of Object.entries(groups)) {
      TaskContext[_validateSingleFormat](groupName, groupFiles);

      const outputFile = TaskContext[_buildOutputFile](data, config);
      if (!outputFile && TaskContext[_isOutputRequired](type)) {
        throw new Error(`"output" configuration is required for "${type}" tasks`);
      }

      const context = new TaskContext(type, groupFiles, outputFile, _.cloneDeep(options), config);

      contexts.push(context);
    }

    return contexts;
  }

  static [_createFile](dirPath, fileName, format, config, evaluated) {
    dirPath = _.trim(dirPath) || null;
    fileName = _.trim(fileName) || null;
    format = _.trim(format).toLowerCase() || null;

    if (!(dirPath || fileName || format)) {
      return null;
    }

    if (!format && fileName) {
      format = path.extname(fileName).substring(1);
    }

    return new File(dirPath, fileName, format, config, evaluated);
  }

  static [_isOutputRequired](type) {
    // TODO: Improve by moving to Task class
    return type === 'convert' || type === 'package';
  }

  static [_parseOptions](data) {
    const options = data.options ? _.cloneDeep(data.options) : {};
    if (Array.isArray(options.sizes)) {
      options.sizes = options.sizes.map(Size.parse);
    }

    return options;
  }

  static [_validateSingleFormat](group, inputFiles) {
    const formats = _.chain(inputFiles)
      .map('format')
      .uniq()
      .value();

    if (formats.length !== 1) {
      let message = '"input.files" configuration must map to a single format ';
      if (group != null) {
        message += `within resolved group: "${group}"`;
      } else {
        message += '- consider specifying the "options.groupBy" configuration';
      }

      throw new Error(message);
    }
  }

  /**
   * Creates an instance of {@link TaskContext}.
   *
   * {@link TaskContext.parse} should be used to create instances.
   *
   * @param {string} type - the task type to be used
   * @param {File[]} inputFiles - the input files to be used
   * @param {?File} outputFile - the output file to be used (may be <code>null</code>)
   * @param {Object} options - the options to be used
   * @param {Config} config - the {@link Config} to be used
   * @protected
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
   * types that the output file is optional or unnecessary.
   *
   * @return {?File} The output file or <code>null</code> if there is none.
   * @public
   */
  get outputFile() {
    return this[_outputFile];
  }

  /**
   * Returns the task type for this {@link TaskContext}.
   *
   * @return {string} The task type.
   * @public
   */
  get type() {
    return this[_type];
  }

}

module.exports = TaskContext;
