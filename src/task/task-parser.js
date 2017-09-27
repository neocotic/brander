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
const debug = require('debug')('brander:task');
const glob = require('glob');
const path = require('path');
const util = require('util');

const File = require('./file');
const Size = require('./size');
const TaskContext = require('./task-context');
const TaskType = require('./task-type');

const findFiles = util.promisify(glob);

const _buildInputFiles = Symbol('buildInputFiles');
const _buildOutputFile = Symbol('buildOutputFile');
const _config = Symbol('config');
const _createFile = Symbol('createFile');
const _currentIndex = Symbol('currentIndex');
const _parseOptions = Symbol('parseOptions');
const _tasks = Symbol('tasks');
const _validateSingleFormat = Symbol('validateSingleFormat');

/**
 * TODO: document
 *
 * @public
 */
class TaskParser {

  /**
   * Creates an instance of {@link TaskParser} using the specified <code>config</code>.
   *
   * @param {Config} config - the {@link Config} whose task data is to be parsed
   * @public
   */
  constructor(config) {
    this[_config] = config;
    this[_tasks] = config.tasks;
    this[_currentIndex] = 0;
  }

  /**
   * Parses the next task data within the {@link Config} of this {@link TaskParser}.
   *
   * Multiple {@link TaskContext} instances can be returned by this method if the "options.groupBy" configuration has
   * been specified. The array may be empty if the task data was <code>null</code> or no matches could be found for the
   * "input.files" configuration, however, this does not indicate that there was no more available task data.
   *
   * <code>null</code> is returned if there is no more available task data to be parsed and so should be taken as an
   * indicator that this method should no longer be called as there are no more tasks to be executed.
   *
   * After calling this method, it should not be called again until the previous contexts have been executed. This is
   * because tasks need to be executed sequentially as subsequent tasks may well be dependent on the output of previous
   * tasks. It is the responsibility of the calling code to ensure that this contract is adhered to. This is done by
   * {@link TaskExecutor}.
   *
   * An error will occur if the task data within the {@link Config} is malformed or incomplete or if a problem occurs
   * while attempting to find input files.
   *
   * @return {Promise.<Error, TaskContext[]>} A <code>promise</code> for asynchronous parsing and file system
   * traversals that is resolved with each {@link TaskContext}, which may be <code>null</code> if there is no more
   * available task data.
   * @public
   */
  async parseNext() {
    const index = this[_currentIndex]++;
    if (index === this[_tasks].length) {
      debug('No more task data to be parsed');

      return null;
    }

    const taskData = this[_tasks][index];
    if (!taskData) {
      debug('No data found at task[%d]', index);

      return [];
    }

    const inputFiles = await this[_buildInputFiles](taskData);
    const options = this[_parseOptions](taskData);
    const contexts = [];

    if (inputFiles.length === 0) {
      debug('No input files found at task[%d]', index);

      return contexts;
    }

    const { config } = this;
    const typeName = _.trim(taskData.task);
    if (!typeName) {
      throw new Error('"task" configuration is required');
    }

    const type = TaskType.valueOf(typeName);

    debug('Creating contexts for "%s" task[%d]...', type, index);

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
      this[_validateSingleFormat](groupName, groupFiles);

      const outputFile = this[_buildOutputFile](taskData);
      if (!outputFile && type.outputRequired) {
        throw new Error(`"output" configuration is required for "${type}" tasks`);
      }

      const context = new TaskContext(type, groupFiles, outputFile, _.cloneDeep(options), config);

      contexts.push(context);
    }

    return contexts;
  }

  async [_buildInputFiles](data) {
    const { config } = this;
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
        const file = this[_createFile](dirPath, fileName, input.format, true);

        inputFiles.push(file);
      }
    }

    return inputFiles;
  }

  [_buildOutputFile](data) {
    const { config } = this;
    const { output } = data;
    if (!output) {
      return null;
    }
    if (output.files != null && typeof output.files !== 'string') {
      throw new Error(`"output.files" configuration can only be a string: ${output.files} (${typeof output.files})`);
    }

    let dirPath = _.trim(output.dir);
    dirPath = dirPath ? config.resolve(config.option('assets.dir', 'assets'), dirPath) : null;

    return this[_createFile](dirPath, output.files, output.format, false);
  }

  [_createFile](dirPath, fileName, format, evaluated) {
    dirPath = _.trim(dirPath) || null;
    fileName = _.trim(fileName) || null;
    format = _.trim(format).toLowerCase() || null;

    if (!(dirPath || fileName || format)) {
      return null;
    }

    if (!format && fileName) {
      format = path.extname(fileName).substring(1);
    }

    return new File(dirPath, fileName, format, this.config, evaluated);
  }

  [_parseOptions](data) {
    const options = data.options ? _.cloneDeep(data.options) : {};
    if (Array.isArray(options.sizes)) {
      options.sizes = options.sizes.map(Size.parse);
    }

    return options;
  }

  [_validateSingleFormat](group, inputFiles) {
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
   * Returns the {@link Config} for this {@link TaskParser}.
   *
   * @return {Config} The configuration.
   * @public
   */
  get config() {
    return this[_config];
  }

}

module.exports = TaskParser;
