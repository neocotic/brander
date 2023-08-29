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
import { every, isEmpty, map, matchesProperty } from 'lodash-es';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

import { File } from '../../file.mjs';
import { Size } from '../../size.mjs';
import { Task } from '../task.mjs';
import { TaskType } from '../task-type.mjs';

const debug = Debug('brander:task:convert');

// TODO: Support resizing images with non-1:1 aspect ratios

/**
 * A {@link TaskType.CONVERT} task that can convert a PNG file to potentially multiple ICO files, if multiple
 * <code>sizes</code> are specified in the options.
 *
 * @public
 */
export default class ConvertPngToIcoTask extends Task {

  /**
   * @inheritdoc
   * @override
   */
  getType() {
    return TaskType.CONVERT;
  }

  /**
   * @inheritdoc
   * @override
   */
  async execute(context) {
    const sizes = map(context.option('sizes', []), 'width');

    for (const inputFile of context.inputFiles) {
      const [ realSize ] = Size.fromImage(inputFile.absolute);

      if (isEmpty(sizes)) {
        await this.#execute(inputFile, null, realSize.width, context);
      } else {
        for (const size of sizes) {
          await this.#execute(inputFile, size, realSize.width, context);
        }
      }
    }
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return every(context.inputFiles, matchesProperty('format', 'png')) && context.outputFile.format === 'ico';
  }

  /**
   * @param {File} inputFile
   * @param {?Size} size
   * @param {number} realSize
   * @param {TaskContext} context
   * @return {Promise<void>}
   * @private
   */
  async #execute(inputFile, size, realSize, context) {
    const inputFilePath = inputFile.absolute;
    const outputFile = context.outputFile
      .defaults(inputFile.dir, '<%= file.base(true) %><%= size ? "-" + size : "" %>.ico', inputFile.format)
      .evaluate({ file: inputFile, size });
    const outputFilePath = outputFile.absolute;

    debug('Reading PNG file to be converted to ICO: %s', chalk.blue(inputFilePath));

    let input = await File.readFile(inputFilePath);

    if (size != null && size.width !== realSize) {
      debug('Resizing PNG to be converted to ICO: %s', chalk.blue(inputFilePath));

      input = await sharp(input)
        .resize(size.width, size.height, {
          fit: sharp.fit.fill,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();
    }

    debug('Converting PNG file to ICO: %s', chalk.blue(inputFilePath));

    const output = await pngToIco([ input ]);

    debug('Writing converted ICO file: %s', chalk.blue(outputFilePath));

    await File.writeFile(outputFilePath, output);

    context.config.logger.log('Converted PNG file to ICO file: %s -> %s', chalk.blue(inputFile.relative),
      chalk.blue(outputFile.relative));
  }

}
