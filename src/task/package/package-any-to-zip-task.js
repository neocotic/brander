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
const fs = require('fs');
const path = require('path');
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
    const outputFilePath = path.resolve(outputFile.dir, outputFile.name);

    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', {
      zlib: {
        level: context.option('compression', zlib.constants.Z_DEFAULT_COMPRESS)
      }
    });

    archive.pipe(output);

    for (const inputFile of context.inputFiles) {
      const inputFilePath = path.resolve(inputFile.dir, inputFile.name);
      const input = await readFile(inputFilePath);

      // TODO: Support directories (relative to what?)
      archive.append(input, { name: inputFile.name });
    }

    archive.finalize();

    return new Promise((resolve, reject) => {
      archive.on('error', reject);
      archive.on('warning', reject);
      output.on('close', resolve);
    });
  }

}

module.exports = PackageAnyToZIPTask;
