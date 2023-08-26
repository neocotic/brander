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

import archiver from 'archiver';
import chalk from 'chalk';
import Debug from 'debug';
import fs from 'node:fs';
import zlib from 'node:zlib';
import pluralize from 'pluralize';

import { File } from '../../file.mjs';
import { Task } from '../task.mjs';
import { TaskType } from '../task-type.mjs';

const debug = Debug('brander:task:package');

/**
 * A {@link TaskType.PACKAGE} task that adds all input files to input a single ZIP file.
 *
 * @public
 */
export default class PackageAnyToZipTask extends Task {

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

    await this.#execute(inputFiles, outputFile, context);
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return context.outputFile.format === 'zip';
  }

  /**
   * @param {File[]} inputFiles
   * @param {File} outputFile
   * @param {TaskContext} context
   * @return {Promise<void>}
   * @private
   */
  async #execute(inputFiles, outputFile, context) {
    const { config } = context;
    const level = context.option('compression', zlib.constants.Z_DEFAULT_COMPRESSION);
    const outputFilePath = outputFile.absolute;

    debug('Creating ZIP file for files: %s', chalk.blue(outputFilePath));

    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', {
      zlib: { level }
    });

    archive.pipe(output);

    for (const inputFile of inputFiles) {
      const inputFilePath = inputFile.absolute;

      debug('Reading file to be packaged in ZIP: %s', chalk.blue(inputFilePath));

      const input = await File.readFile(inputFilePath);

      debug('Adding file to ZIP package: %s', chalk.blue(inputFilePath));

      archive.append(input, { name: inputFile.relative });
    }

    archive.finalize();

    await new Promise((resolve, reject) => {
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
