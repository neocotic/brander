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
import Debug from 'debug';

import { File } from '../../file.mjs';
import { Task } from '../task.mjs';
import { TaskType } from '../task-type.mjs';

const debug = Debug('brander:task:clean');

/**
 * A {@link TaskType.CLEAN} task that simply deletes all files.
 *
 * @public
 */
export default class CleanAnyTask extends Task {

  /**
   * @inheritdoc
   * @override
   */
  getType() {
    return TaskType.CLEAN;
  }

  /**
   * @inheritdoc
   * @override
   */
  async execute(context) {
    for (const inputFile of context.inputFiles) {
      const inputFilePath = inputFile.absolute;

      debug('Removing file: %s', chalk.blue(inputFilePath));

      await File.deleteFile(inputFilePath, { glob: false });

      context.config.logger.log('Cleaned file: %s', chalk.blue(inputFile.relative));
    }
  }

  /**
   * @inheritdoc
   * @override
   */
  supports(context) {
    return true;
  }

}
