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
const debug = require('debug')('brander:task:convert');
const fs = require('fs');
const path = require('path');
const svg2png = require('svg2png');
const toIco = require('to-ico');
const util = require('util');

const Size = require('../size');
const Task = require('../task');
const TaskType = require('../task-type');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const _execute = Symbol('execute');

// TODO: Support resizing images with non-1:1 aspect ratios

/**
 * TODO: document
 *
 * @public
 */
class ConvertSVGToICOTask extends Task {

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
    const sizes = context.option('sizes');

    for (const inputFile of context.inputFiles) {
      if (_.isEmpty(sizes)) {
        await this[_execute](inputFile, null, context);
      } else {
        for (const size of sizes) {
          await this[_execute](inputFile, size, context);
        }
      }
    }
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return context.inputFiles[0].format === 'svg' && context.outputFile.format === 'ico';
  }

  async [_execute](inputFile, size, context) {
    const { config } = context;
    const inputFilePath = path.resolve(inputFile.dir, inputFile.name);
    const outputFile = context.outputFile
      .defaults(inputFile.dir, '<%= file.base(true) %><%= size ? "-" + size : "" %>.ico', inputFile.format)
      .evaluate({ file: inputFile, size });
    const outputFilePath = path.resolve(outputFile.dir, outputFile.name);

    debug('Reading SVG file to be converted to ICO: %s', inputFilePath);

    const svgInput = await readFile(inputFilePath);

    debug('Converting SVG file to PNG: %s', inputFilePath);

    const pngInput = await svg2png(svgInput, Object.assign(size ? { height: size.height, width: size.width } : null));

    debug('Converting PNG to ICO');

    const realSize = await Size.fromImage(pngInput);
    const output = await toIco([ pngInput ], { sizes: [ realSize.width ] });

    debug('Writing converted ICO file: %s', outputFilePath);

    await writeFile(outputFilePath, output);

    config.logger.log('Converted SVG file to ICO file: %s -> %s', chalk.blue(config.relative(inputFilePath)),
      chalk.blue(config.relative(outputFilePath)));
  }

}

module.exports = ConvertSVGToICOTask;
