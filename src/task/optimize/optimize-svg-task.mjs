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

import _ from 'lodash';
import chalk from 'chalk';
import Debug from 'debug';
import { optimize } from 'svgo';

import { File } from '../../file.mjs';
import { Task } from '../task.mjs';
import { TaskType } from '../task-type.mjs';

const debug = Debug('brander:task:optimize');

/**
 * A {@link TaskType.OPTIMIZE} task that optimizes SVG files.
 *
 * @public
 */
export default class OptimizeSvgTask extends Task {

  /**
   * @inheritdoc
   * @override
   */
  getType() {
    return TaskType.OPTIMIZE;
  }

  /**
   * @inheritdoc
   * @override
   */
  async execute(context) {
    for (const inputFile of context.inputFiles) {
      await this.#execute(inputFile, context);
    }
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return _.every(context.inputFiles, _.matchesProperty('format', 'svg'));
  }

  /**
   * @param {File} inputFile
   * @param {TaskContext} context
   * @return {Promise<void>}
   * @private
   */
  async #execute(inputFile, context) {
    const { config } = context;
    const inputFilePath = inputFile.absolute;
    const outputFile = (context.outputFile || new File(null, null, null, config))
      .defaults(inputFile.dir, '<%= file.base(true) %>.min.svg', inputFile.format)
      .evaluate({ file: inputFile });
    const outputFilePath = outputFile.absolute;

    debug('Reading SVG file to be optimized: %s', chalk.blue(inputFilePath));

    const input = await File.readFile(inputFilePath, 'utf8');

    debug('Optimizing SVG file: %s', chalk.blue(inputFilePath));

    const output = optimize(input);

    debug('Writing optimized SVG file: %s', chalk.blue(outputFilePath));

    await File.writeFile(outputFilePath, output.data);

    config.logger.log('Optimized SVG file: %s -> %s', chalk.blue(inputFile.relative), chalk.blue(outputFile.relative));
  }

}
