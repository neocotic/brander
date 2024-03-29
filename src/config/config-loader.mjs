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
import path from 'node:path';
import stripJsonComments from 'strip-json-comments';

import { Config } from './config.mjs';
import { File } from '../file.mjs';
import { PackageLoader } from './package/package-loader.mjs';
import { RepositoryService } from './repository/repository-service.mjs';

const debug = Debug('brander:config');

/**
 * Responsible for finding, loading, and parsing configuration files and creating {@link Config} instances.
 *
 * A <code>ConfigLoader</code> can be used to load a specific configuration file or attempt to find available
 * configuration files (based on predefined naming conventions), read their contents, and finally parse them into a
 * plain object that will be used as the configuration data.
 *
 * All files are read and/or searched for relative to the base directory for the loader. By default, the base directory
 * is the current working directory but this can be changed by specifying the <code>baseDir</code> option.
 *
 * The <code>logger</code> option can be specified to provide a {@link Logger} instance that is to be passed to all
 * {@link Config} instances created by the loader.
 *
 * @public
 */
export class ConfigLoader {

  /**
   * @type {string}
   * @private
   */
  #baseDir;
  /**
   * @type {Logger}
   * @private
   */
  #logger;
  /**
   * @type {PackageLoader}
   * @private
   */
  #packageLoader = new PackageLoader();

  /**
   * Creates an instance of {@link ConfigLoader}.
   *
   * Optionally, <code>options</code> can be provided for more granular control.
   *
   * @param {ConfigLoader~Options} [options] - the options to be used
   * @public
   */
  constructor(options = {}) {
    this.#baseDir = options.baseDir || process.cwd();
    this.#logger = options.logger;
  }

  /**
   * Returns the names supported for configuration files.
   *
   * @return {string[]} The file names.
   * @protected
   */
  getFileNames() {
    return [
      '.branderrc',
      '.branderrc.json',
      '.branderrc.js',
      '.branderrc.mjs'
    ];
  }

  /**
   * Returns whether the specified <code>filePath</code> is targeting a module that should be <code>import</code>'ed
   * instead of having its contents read and parsed.
   *
   * This method should be a best guess based on the <code>filePath</code> and should avoid touching the file where at
   * all possible.
   *
   * @param {string} filePath - the path of the file to be checked
   * @return {boolean} <code>true</code> if <code>filePath</code> is a module; otherwise <code>false</code>.
   * @protected
   */
  isModule(filePath) {
    const ext = path.extname(filePath);
    return ext === '.js' || ext === '.mjs';
  }

  /**
   * Attempts to find and load the configuration data from a file.
   *
   * Optionally, <code>filePath</code> can be provided to read the configuration data from that file. Otherwise, an
   * attempt will be made to find any file with a recognised name within the base directory and use the first one it
   * finds.
   *
   * If the file denotes a module, it will be required and its exports will be used as the configuration data.
   * Otherwise, the contents of the file will read and parsed based on its type.
   *
   * All file paths (specified or discovered) are resolved using the base directory unless where already absolute.
   *
   * An error will occur if no configuration file was specified and/or found, an error occurred while attempting to load
   * the configuration file, or the configuration file contained no data.
   *
   * @param {string} [filePath] - the path of the file whose configuration data is to be loaded
   * @return {Promise<Config>} A <code>Promise</code> for the asynchronous file reading that is resolved with the
   * {@link Config} loaded from the file.
   * @public
   */
  async load(filePath) {
    if (!filePath) {
      debug('Finding configuration file as none was specified...');

      filePath = await this.#findFilePath();
    }
    if (!filePath) {
      throw new Error('Unable to find configuration file!');
    }

    filePath = path.resolve(this.#baseDir, filePath);

    debug('Loading configuration file: %s', chalk.blue(filePath));

    let data;
    if (this.isModule(filePath)) {
      const mod = await import(filePath);
      if (typeof mod.default === 'function') {
        data = mod.default();
      } else {
        data = mod.default;
      }
    } else {
      const contents = await File.readFile(filePath);
      data = this.parse(contents, filePath);
    }
    if (!data) {
      throw new Error(`Configuration file contains no data: ${filePath}`);
    }

    debug('Successfully loaded configuration file: %s', chalk.blue(filePath));

    const pkg = await this.#packageLoader.load(filePath);
    const repositoryService = RepositoryService.getInstance();
    const repositoryInfo = await repositoryService.getRepositoryInfo(path.dirname(filePath), {
      info: data.repository,
      pkg
    });

    return new Config({
      filePath,
      data,
      logger: this.#logger,
      pkg,
      repository: repositoryInfo
    });
  }

  /**
   * Attempts to parse the specified <code>contents</code> of the <code>filePath</code> provided as configuration data.
   *
   * An error will occur if a problem arises while attempting to parse <code>contents</code> or if <code>filePath</code>
   * denotes an unsupported file type.
   *
   * @param {Buffer} contents - the file contents to be parsed
   * @param {string} filePath - the path of the file being parsed
   * @return {?Object} The parsed configuration data or <code>null</code> if <code>contents</code> contained none.
   * @throws {Error} If an error occurred while attempting to parse <code>contents</code> or if <code>filePath</code>
   * denotes an unsupported file type.
   * @protected
   */
  parse(contents, filePath) {
    debug('Parsing configuration file: %s', chalk.blue(filePath));

    const extension = path.extname(filePath) || '.json';

    switch (extension) {
    case '.json':
      return JSON.parse(stripJsonComments(contents.toString('utf8')));
    default:
      throw new Error(`Unsupported configuration file type: ${filePath}`);
    }
  }

  /**
   * @return {Promise<?string>}
   * @throws {Error}
   * @private
   */
  async #findFilePath() {
    for (const fileName of this.getFileNames()) {
      const filePath = path.resolve(this.#baseDir, fileName);

      try {
        await File.access(filePath);

        return filePath;
      } catch (e) {
        // Ignore ENOENT errors
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }
    }

    return null;
  }

}

/**
 * The options that can be passed to the {@link ConfigLoader} constructor.
 *
 * @typedef {Object} ConfigLoader~Options
 * @property {string} [baseDir=process.cwd()] - The base directory.
 * @property {Logger} [logger] - The {@link Logger} to be passed to loaded {@link Config} instances upon initialization.
 */
