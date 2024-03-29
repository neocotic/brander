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

import chalk from 'chalk';
import Debug from 'debug';
import { every, map, matchesProperty, nth } from 'lodash-es';
import pluralize from 'pluralize';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

import { File } from '../../file.mjs';
import { Size } from '../../size.mjs';
import { Task } from '../task.mjs';
import { TaskType } from '../task-type.mjs';

const debug = Debug('brander:task:package');

// TODO: Support resizing images with non-1:1 aspect ratios

/**
 * A {@link TaskType.PACKAGE} task that can package one or more PNG files into a single ICO file.
 *
 * The <code>sizes</code> option can be used to control the size of the PNG files as they're added to the ICO file. It
 * can even be used to resize the PNG files.
 *
 * @public
 */
export default class PackagePngToIcoTask extends Task {

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
    const { config, inputFiles } = context;
    const [ inputFile ] = inputFiles;
    const outputFile = context.outputFile
      .defaults(inputFile.dir, '<%= file.base(true) %>.ico', inputFile.format)
      .evaluate({ file: inputFile });
    const outputFilePath = outputFile.absolute;

    const data = await this.#readData(inputFiles, context);
    const inputs = map(data, 'input');
    const sizes = map(data, 'size.width');

    debug('Creating ICO for PNG files');

    const output = await pngToIco(inputs);

    debug('Writing packaged ICO file: %s', chalk.blue(outputFilePath));

    await File.writeFile(outputFilePath, output);

    config.logger.log('Packaged %d PNG %s into ICO file: %s (sizes = %s)', inputFiles.length,
      pluralize('file', inputFiles.length), chalk.blue(outputFile.relative), sizes);
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return every(context.inputFiles, matchesProperty('format', 'png')) && context.outputFile.format === 'ico';
  }

  /**
   * @param {File[]} inputFiles
   * @param {TaskContext} context
   * @return {Promise<Object[]>}
   * @private
   */
  async #readData(inputFiles, context) {
    const inputs = [];
    const sizes = map(context.option('sizes', []), 'width');

    for (const inputFile of inputFiles) {
      const inputFilePath = inputFile.absolute;
      const size = nth(sizes, inputs.length);

      debug('Reading PNG file to be packaged in ICO: %s', chalk.blue(inputFilePath));

      const pngInput = await File.readFile(inputFilePath);
      const [ realSize ] = Size.fromImage(pngInput);

      if (size != null && size !== realSize.width) {
        debug('Resizing PNG to be packaged to ICO: %s', chalk.blue(inputFilePath));

        const resizedInput = await sharp(pngInput)
          .resize(size, size, {
            fit: sharp.fit.fill,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .toBuffer();

        inputs.push({
          input: resizedInput,
          size: new Size(size, size),
        });
      } else {
        inputs.push({
          input: pngInput,
          size: realSize
        });
      }
    }

    return inputs;
  }

}
