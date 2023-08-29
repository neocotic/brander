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
import svgToPng from 'convert-svg-to-png';
import Debug from 'debug';
import { every, isEmpty, matchesProperty } from 'lodash-es';
import pngToIco from 'png-to-ico';

import { File } from '../../file.mjs';
import { Task } from '../task.mjs';
import { TaskType } from '../task-type.mjs';

const debug = Debug('brander:task:convert');

// TODO: Support resizing images with non-1:1 aspect ratios

/**
 * A {@link TaskType.CONVERT} task that can convert a SVG file to potentially multiple ICO files, if multiple
 * <code>sizes</code> are specified in the options.
 *
 * The SVG file is first converted into PNG format and it's the PNG data that is written to the ICO file(s).
 *
 * @public
 */
export default class ConvertSvgToIcoTask extends Task {

  /**
   * TODO: Fix type
   * @type {unknown}
   * @private
   */
  #converter;

  /**
   * @inheritdoc
   * @override
   */
  beforeAll(config) {
    const puppeteer = config.option('puppeteer');

    this.#converter = svgToPng.createConverter({ puppeteer });
  }

  /**
   * @inheritdoc
   * @override
   */
  async afterAll(config) {
    await this.#converter.destroy();
    this.#converter = null;
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
      if (isEmpty(sizes)) {
        await this.#execute(inputFile, null, context);
      } else {
        for (const size of sizes) {
          await this.#execute(inputFile, size, context);
        }
      }
    }
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return every(context.inputFiles, matchesProperty('format', 'svg')) && context.outputFile.format === 'ico';
  }

  /**
   * @param {File} inputFile
   * @param {?Size} size
   * @param {TaskContext} context
   * @return {Promise<void>}
   * @private
   */
  async #execute(inputFile, size, context) {
    const inputFilePath = inputFile.absolute;
    const background = context.option('background');
    const baseUrl = context.option('baseUrl');
    const baseFile = context.option('baseFile') || !baseUrl ? inputFilePath : null;
    const scale = context.option('scale');
    const outputFile = context.outputFile
      .defaults(inputFile.dir, '<%= file.base(true) %><%= size ? "-" + size : "" %>.ico', inputFile.format)
      .evaluate({
        background,
        baseFile,
        baseUrl,
        file: inputFile,
        scale,
        size
      });
    const outputFilePath = outputFile.absolute;

    debug('Reading SVG file to be converted to ICO: %s', chalk.blue(inputFilePath));

    const svgInput = await File.readFile(inputFilePath);

    debug('Converting SVG file to PNG: %s', chalk.blue(inputFilePath));

    const pngInput = await this.#converter.convert(svgInput, Object.assign({
      background,
      baseFile,
      baseUrl,
      scale
    }, !size ? null : {
      height: size.height,
      width: size.width
    }));

    debug('Converting PNG to ICO');

    const output = await pngToIco([ pngInput ]);

    debug('Writing converted ICO file: %s', chalk.blue(outputFilePath));

    await File.writeFile(outputFilePath, output);

    context.config.logger.log('Converted SVG file to ICO file: %s -> %s', chalk.blue(inputFile.relative),
      chalk.blue(outputFile.relative));
  }

}
