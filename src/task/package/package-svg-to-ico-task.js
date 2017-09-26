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
const svg2png = require('svg2png');
const toIco = require('to-ico');
const util = require('util');

const PackageTask = require('./package-task');
const Size = require('../size');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const _readData = Symbol('readData');

// TODO: Support resizing images with non-1:1 aspect ratios

/**
 * TODO: document
 *
 * @public
 */
class PackageSVGToICOTask extends PackageTask {

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

    const data = await this[_readData](inputFiles, context);
    const inputs = _.map(data, 'input');
    const sizes = _.map(data, 'size.width');
    const output = await toIco(inputs, { sizes });

    await writeFile(outputFilePath, output);
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return context.inputFiles[0].format === 'svg' && context.outputFile.format === 'ico';
  }

  async [_readData](inputFiles, context) {
    const inputs = [];
    const sizes = context.option('sizes');

    for (const inputFile of inputFiles) {
      const size = _.nth(sizes, inputs.length);
      const inputFilePath = path.resolve(inputFile.dir, inputFile.name);

      const svgInput = await readFile(inputFilePath);
      const pngInput = await svg2png(svgInput, Object.assign(size ? { height: size.height, width: size.width } : null));
      const realSize = await Size.fromImage(pngInput);

      inputs.push({ input: pngInput, size: realSize });
    }

    return inputs;
  }

}

PackageTask.register(new PackageSVGToICOTask());

module.exports = PackageSVGToICOTask;
