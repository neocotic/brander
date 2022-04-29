/*
 * Copyright (C) 2022 neocotic
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

/* istanbul ignore file */

const _ = require('lodash');
const chalk = require('chalk');
const { createConverter } = require('convert-svg-to-jpeg');
const debug = require('debug')('brander:task:convert');

const File = require('../../file');
const Task = require('../task');
const TaskType = require('../task-type');

const _converter = Symbol('converter');
const _execute = Symbol('execute');

/**
 * A {@link TaskType.CONVERT} task that can convert a SVG file to potentially multiple JPEG files, if multiple
 * <code>sizes</code> are specified in the options.
 *
 * @public
 */
class ConvertSVGToJPEGTask extends Task {

  /**
   * @inheritdoc
   * @override
   */
  beforeAll(config) {
    const puppeteer = config.option('puppeteer');

    this[_converter] = createConverter({ puppeteer });
  }

  /**
   * @inheritdoc
   * @override
   */
  async afterAll(config) {
    await this[_converter].destroy();
    delete this[_converter];
  }

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
    return _.every(context.inputFiles, _.matchesProperty('format', 'svg')) && context.outputFile.format === 'jpeg';
  }

  async [_execute](inputFile, size, context) {
    const inputFilePath = inputFile.absolute;
    const background = context.option('background');
    const baseUrl = context.option('baseUrl');
    const baseFile = context.option('baseFile') || !baseUrl ? inputFilePath : null;
    const quality = context.option('quality');
    const scale = context.option('scale');
    const outputFile = context.outputFile
      .defaults(inputFile.dir, '<%= file.base(true) %><%= size ? "-" + size : "" %>.jpeg', inputFile.format)
      .evaluate({
        background,
        baseFile,
        baseUrl,
        file: inputFile,
        quality,
        scale,
        size
      });
    const outputFilePath = outputFile.absolute;

    debug('Reading SVG file to be converted to JPEG: %s', chalk.blue(inputFilePath));

    const input = await File.readFile(inputFilePath);

    debug('Converting SVG file to JPEG: %s', chalk.blue(inputFilePath));

    const output = await this[_converter].convert(input, Object.assign({
      background,
      baseFile,
      baseUrl,
      quality,
      scale
    }, !size ? null : {
      height: size.height,
      width: size.width
    }));

    debug('Writing converted JPEG file: %s', chalk.blue(outputFilePath));

    await File.writeFile(outputFilePath, output);

    context.config.logger.log('Converted SVG file to JPEG file: %s -> %s', chalk.blue(inputFile.relative),
      chalk.blue(outputFile.relative));
  }

}

module.exports = ConvertSVGToJPEGTask;
