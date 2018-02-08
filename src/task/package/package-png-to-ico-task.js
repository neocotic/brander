/*
 * Copyright (C) 2018 Alasdair Mercer, !ninja
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
const debug = require('debug')('brander:task:package');
const pluralize = require('pluralize');
const toIco = require('to-ico');

const File = require('../../file');
const Size = require('../../size');
const Task = require('../task');
const TaskType = require('../task-type');

const _getOptions = Symbol('getOptions');
const _readInputs = Symbol('readInputs');

// TODO: Support resizing images with non-1:1 aspect ratios

/**
 * A {@link TaskType.PACKAGE} task that can package one or more PNG files into a single ICO file.
 *
 * The <code>sizes</code> option can be used to control the size of the PNG files as they're added to the ICO file. It
 * can even be used to resize the PNG files.
 *
 * @public
 */
class PackagePNGToICOTask extends Task {

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

    const inputs = await this[_readInputs](inputFiles);

    debug('Creating ICO for PNG files');

    const options = await this[_getOptions](context);
    const output = await toIco(inputs, options);

    debug('Writing packaged ICO file: %s', chalk.blue(outputFilePath));

    await File.writeFile(outputFilePath, output);

    config.logger.log('Packaged %d PNG %s into ICO file: %s (sizes = %s)', inputFiles.length,
      pluralize('file', inputFiles.length), chalk.blue(outputFile.relative), options.sizes);
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return _.every(context.inputFiles, _.matchesProperty('format', 'png')) && context.outputFile.format === 'ico';
  }

  async [_getOptions](context) {
    const { inputFiles } = context;
    const realSizes = [];
    const sizes = _.map(context.option('sizes', []), 'width');

    for (const inputFile of inputFiles) {
      const [ size ] = await Size.fromImage(inputFile.absolute);

      realSizes.push(size.width);
    }

    const sizesLength = sizes.length;
    const filesLength = inputFiles.length;
    const finalSizes = sizesLength < filesLength ? sizes.concat(realSizes.slice(sizesLength)) : sizes;

    return {
      resize: !_.isEqual(finalSizes, realSizes),
      sizes: finalSizes
    };
  }

  async [_readInputs](inputFiles) {
    const inputs = [];

    for (const inputFile of inputFiles) {
      const inputFilePath = inputFile.absolute;

      debug('Reading PNG file to be packaged in ICO: %s', chalk.blue(inputFilePath));

      const input = await File.readFile(inputFilePath);

      inputs.push(input);
    }

    return inputs;
  }

}

module.exports = PackagePNGToICOTask;
