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

const archiver = require('archiver');
const chalk = require('chalk');
const debug = require('debug')('brander:task:package');
const fs = require('fs');
const pluralize = require('pluralize');
const util = require('util');
const zlib = require('zlib');

const Task = require('../task');
const TaskType = require('../task-type');

const readFile = util.promisify(fs.readFile);

const _execute = Symbol('execute');

/**
 * TODO: document
 *
 * @public
 */
class PackageAnyToZIPTask extends Task {

  /**
   * @inheritdoc
   * @override
   */
  getType() {
    return TaskType.PACKAGE;
  }

  /**
   * @inheritdoc
   * @override
   */
  async execute(context) {
    const { inputFiles } = context;
    const [ inputFile ] = inputFiles;
    const outputFile = context.outputFile
      .defaults(inputFile.dir, '<%= file.base(true) %>.zip', inputFile.format)
      .evaluate({ file: inputFile });

    await this[_execute](inputFiles, outputFile, context);
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return context.outputFile.format === 'zip';
  }

  async [_execute](inputFiles, outputFile, context) {
    const { config } = context;
    const level = context.option('compression', zlib.constants.Z_DEFAULT_COMPRESS);
    const outputFilePath = outputFile.absolute;

    debug('Creating ZIP file for files: %s', outputFilePath);

    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', {
      zlib: { level }
    });

    archive.pipe(output);

    for (const inputFile of inputFiles) {
      const inputFilePath = inputFile.absolute;

      debug('Reading file to be packaged in ZIP: %s', inputFilePath);

      const input = await readFile(inputFilePath);

      debug('Adding file to ZIP package: %s', inputFilePath);

      archive.append(input, { name: inputFile.relative });
    }

    archive.finalize();

    return new Promise((resolve, reject) => {
      archive.on('error', reject);
      archive.on('warning', reject);
      output.on('close', () => {
        config.logger.log('Packaged %d %s into ZIP file: %s (level = %d)', inputFiles.length,
          pluralize('file', inputFiles.length), chalk.blue(outputFile.relative), level);

        resolve();
      });
    });
  }

}

module.exports = PackageAnyToZIPTask;
