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
const chalk = require('chalk');
const debug = require('debug')('brander:task:optimize');
const SVGO = require('svgo');

const File = require('../../file');
const Task = require('../task');
const TaskType = require('../task-type');

const _execute = Symbol('execute');
const _svgo = Symbol('svgo');

/**
 * A {@link TaskType.OPTIMIZE} task that optimizes SVG files.
 *
 * @public
 */
class OptimizeSVGTask extends Task {

  /**
   * Creates an instance of {@link OptimizeSVGTask}.
   *
   * @public
   */
  constructor() {
    super();

    this[_svgo] = new SVGO();
  }

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
      await this[_execute](inputFile, context);
    }
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return _.every(context.inputFiles, _.matchesProperty('format', 'svg'));
  }

  async [_execute](inputFile, context) {
    const { config } = context;
    const inputFilePath = inputFile.absolute;
    const outputFile = (context.outputFile || new File(null, null, null, config))
      .defaults(inputFile.dir, '<%= file.base(true) %>.min.svg', inputFile.format)
      .evaluate({ file: inputFile });
    const outputFilePath = outputFile.absolute;

    debug('Reading SVG file to be optimized: %s', chalk.blue(inputFilePath));

    const input = await File.readFile(inputFilePath, 'utf8');

    debug('Optimizing SVG file: %s', chalk.blue(inputFilePath));

    const output = await this[_svgo].optimize(input);

    debug('Writing optimized SVG file: %s', chalk.blue(outputFilePath));

    await File.writeFile(outputFilePath, output.data);

    config.logger.log('Optimized SVG file: %s -> %s', chalk.blue(inputFile.relative), chalk.blue(outputFile.relative));
  }

}

module.exports = OptimizeSVGTask;
