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
const { createConverter } = require('convert-svg-to-png');
const debug = require('debug')('brander:task:package');
const pluralize = require('pluralize');
const toIco = require('to-ico');

const File = require('../../file');
const Size = require('../../size');
const Task = require('../task');
const TaskType = require('../task-type');

const _converter = Symbol('converter');
const _readData = Symbol('readData');

// TODO: Support resizing images with non-1:1 aspect ratios

/**
 * A {@link TaskType.PACKAGE} task that can package one or more PNG files into a single ICO file.
 *
 * The <code>sizes</code> option can be used to control the size of the PNG files as they're added to the ICO file. It
 * can even be used to resize the PNG files.
 *
 * The SVG files are first converted into PNG format and it's the PNG data that is written to the ICO file.
 *
 * @public
 */
class PackageSVGToICOTask extends Task {

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

    const data = await this[_readData](inputFiles, context);
    const inputs = _.map(data, 'input');
    const sizes = _.map(data, 'size.width');

    debug('Creating ICO for PNGs converted from SVG files');

    const output = await toIco(inputs, { sizes });

    debug('Writing packaged ICO file: %s', chalk.blue(outputFilePath));

    await File.writeFile(outputFilePath, output);

    config.logger.log('Packaged %d SVG %s into ICO file: %s (sizes = %s)', inputFiles.length,
      pluralize('file', inputFiles.length), chalk.blue(outputFile.relative), sizes);
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return _.every(context.inputFiles, _.matchesProperty('format', 'svg')) && context.outputFile.format === 'ico';
  }

  async [_readData](inputFiles, context) {
    const inputs = [];
    const background = context.option('background');
    const baseUrl = context.option('baseUrl');
    const scale = context.option('scale');
    const sizes = context.option('sizes');

    for (const inputFile of inputFiles) {
      const inputFilePath = inputFile.absolute;
      const baseFile = context.option('baseFile') || !baseUrl ? inputFilePath : null;
      const size = _.nth(sizes, inputs.length);

      debug('Reading SVG file to be packaged in ICO: %s', chalk.blue(inputFilePath));

      const svgInput = await File.readFile(inputFilePath);

      debug('Converting SVG file to PNG: %s', chalk.blue(inputFilePath));

      const pngInput = await this[_converter].convert(svgInput, Object.assign({
        background,
        baseFile,
        baseUrl,
        scale
      }, !size ? null : {
        height: size.height,
        width: size.width
      }));
      const [ realSize ] = await Size.fromImage(pngInput);

      inputs.push({
        input: pngInput,
        size: realSize
      });
    }

    return inputs;
  }

}

module.exports = PackageSVGToICOTask;
