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
const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');
const util = require('util');

const Size = require('../size');
const Task = require('../task');
const TaskType = require('../task-type');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const _getOptions = Symbol('getOptions');
const _readInputs = Symbol('readInputs');

// TODO: Support resizing images with non-1:1 aspect ratios

/**
 * TODO: document
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
    const { inputFiles } = context;
    const [ inputFile ] = inputFiles;
    const outputFile = context.outputFile
      .defaults(inputFile.dir, '<%= file.base(true) %>.ico', inputFile.format)
      .evaluate({ file: inputFile });
    const outputFilePath = path.resolve(outputFile.dir, outputFile.name);

    const inputs = await this[_readInputs](inputFiles);
    const output = await toIco(inputs, this[_getOptions](context));

    await writeFile(outputFilePath, output);
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return context.inputFiles[0].format === 'png' && context.outputFile.format === 'ico';
  }

  async [_getOptions](context) {
    const { inputFiles } = context;
    let finalSizes;
    const realSizes = [];
    const sizes = _.map(context.option('sizes', []), 'width');

    for (const inputFile of inputFiles) {
      const { width } = await Size.fromImage(path.resolve(inputFile.dir, inputFile.name));
      realSizes.push(width);
    }

    if (sizes) {
      const filesLength = inputFiles.length;
      const sizesLength = sizes.length;

      if (sizesLength < filesLength) {
        finalSizes = sizes.concat(realSizes.slice(sizesLength));
      } else if (sizesLength > filesLength) {
        finalSizes = sizes.slice(0, filesLength);
      } else {
        finalSizes = sizes.slice();
      }
    } else {
      finalSizes = realSizes;
    }

    return {
      resize: !_.isEqual(finalSizes, realSizes),
      sizes: finalSizes
    };
  }

  async [_readInputs](inputFiles) {
    const inputs = [];

    for (const inputFile of inputFiles) {
      const inputFilePath = path.resolve(inputFile.dir, inputFile.name);
      const input = await readFile(inputFilePath);

      inputs.push(input);
    }

    return inputs;
  }

}

module.exports = PackagePNGToICOTask;
