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
const fs = require('fs-extra');
const path = require('path');
const toIco = require('to-ico');

const Task = require('../task');

const _readInputs = Symbol('readInputs');

const defaultSizes = [ 16, 24, 32, 48, 64, 128, 256 ];

/**
 * TODO: document
 *
 * @public
 */
class ConvertPNGToICOTask extends Task {

  /**
   * @inheritdoc
   * @override
   */
  async execute(context) {
    const { inputFiles } = context;
    const [ inputFile ] = inputFiles;
    const outputFile = context.outputFile
      .defaults(inputFile.dir, '<%= file.base(true) %>.ico', inputFile.format)
      .evaluate({ file: inputFile });
    const outputFilePath = path.resolve(outputFile.dir, outputFile.name);
    const resize = context.inputFiles.length === 1;
    const sizes = _.isEmpty(context.option('sizes')) ? defaultSizes : _.map(context.option('sizes'), 'width');

    if (!resize && inputFiles.length !== sizes.length) {
      throw new Error('"input.files" configuration must resolve to same number as the "options.sizes" configuration: ' +
        `expected ${sizes.length}, actual: ${inputFiles.length}`);
    }

    const inputs = await this[_readInputs](inputFiles);
    const output = await toIco(inputs, { sizes, resize });

    await fs.writeFile(outputFilePath, output);
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return context.inputFiles[0].format === 'png' && context.outputFile.format === 'ico';
  }

  async [_readInputs](inputFiles) {
    const inputs = [];

    for (const inputFile of inputFiles) {
      const inputFilePath = path.resolve(inputFile.dir, inputFile.name);
      const input = await fs.readFile(inputFilePath);
      inputs.push(input);
    }

    return inputs;
  }

}

Task.register('convert', new ConvertPNGToICOTask());

module.exports = ConvertPNGToICOTask;
