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
const { EOL } = require('os');
const path = require('path');

const Expression = require('./expression');
const Logger = require('../logger');
const Package = require('./package/package');
const Repo = require('./repository/repo');
const RepositoryService = require('./repository/repository-service');
const Scope = require('./scope');

const _baseDir = Symbol('baseDir');
const _data = Symbol('data');
const _email = Symbol('email');
const _filePath = Symbol('filePath');
const _homepage = Symbol('homepage');
const _lineSeparator = Symbol('lineSeparator');
const _logger = Symbol('logger');
const _name = Symbol('name');
const _pkg = Symbol('pkg');
const _repository = Symbol('repository');
const _scope = Symbol('scope');
const _title = Symbol('title');

/**
 * Contains parsed configuration data that has been loaded from a single configuration file.
 *
 * While it's possible to create an instance using the constructor, it's highly recommended that {@link ConfigLoader} is
 * used instead.
 *
 * The <code>logger</code> option can be specified to control where output messages are written to. By default, a
 * disabled {@link Logger} will be used so that such messages are not written at all.
 *
 * The <code>pkg</code> and <code>repository</code> options can be specified to provide {@link Package} and repository
 * information respectively. If instantiating the constructor directly, it may be necessary to use {@link PackageLoader}
 * and {@link RepositoryService} to obtain this information.
 *
 * Each <code>Config</code> instance has a {@link Scope} that is cleared at the beginning of each generation cycle. This
 * can be used to share state and to get a high level overview of the generation process.
 *
 * @public
 */
class Config {

  /**
   * Creates an instance of {@link Config} using the <code>options</code> provided.
   *
   * @param {Config~Options} options - the options to be used
   * @public
   */
  constructor(options) {
    const repositoryService = RepositoryService.getInstance();

    this[_filePath] = options.filePath;
    this[_data] = options.data;
    this[_logger] = options.logger || new Logger({ enabled: false });
    this[_pkg] = options.pkg || new Package();
    this[_repository] = new Repo(repositoryService.getRepository(options.repository));
    this[_baseDir] = path.dirname(this[_filePath]);
    this[_email] = _.trim(this[_data].email) || null;
    this[_homepage] = _.trim(this[_data].homepage) || _.trim(this[_pkg].get('homepage')) || this[_repository].homepage;
    this[_name] = _.trim(this[_data].name) || _.trim(this[_pkg].get('name')) || this[_repository].name;
    this[_scope] = new Scope();
    this[_title] = _.trim(this[_data].title) || this[_name];
    this[_lineSeparator] = ((lineSeparator) => {
      switch (lineSeparator) {
      case 'crlf':
        return '\r\n';
      case 'lf':
        return '\n';
      default:
        return EOL;
      }
    })(_.trim(this.option('lineSeparator')).toLowerCase());
  }

  /**
   * Resolves the specified sequence of <code>paths</code> or path segments into an absolute path relative to the
   * directory to which assets are to be generated.
   *
   * This is convenient shorthand for the {@link Config#resolve} method where {@link Config#assetsDir} is used as the
   * first path.
   *
   * @param {...string} paths - the sequence of paths or path segments to be resolved
   * @return {string} An absolute asset file path.
   * @public
   */
  assetPath(...paths) {
    return this.resolve(this.assetsDir, ...paths);
  }

  /**
   * Resolves the specified sequence of <code>paths</code> or path segments into an absolute URL for a raw asset file.
   *
   * If the <code>assets.url</code> option is enabled within this {@link Config}, then this method will evaluate it to
   * create the URL, passing the file path to be included. Otherwise, this method will attempt to create the URL based
   * on the {@link Repository} information associated with this {@link Config}.
   *
   * @param {string|string[]} paths - the sequence of paths or path segments to be resolved
   * @return {?string} The asset file URL or <code>null</code> if insufficient information available.
   * @public
   */
  assetURL(paths) {
    paths = _.castArray(paths);

    const assetURL = this.option('assets.url');
    let filePath = paths.map((p) => p.replace(/\\/g, '/')).join('/');
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }

    return assetURL ? this.evaluate(assetURL, { file: filePath }) : this.repository.rawFileURL(filePath);
  }

  /**
   * Resolves the specified sequence of <code>paths</code> or path segments into an absolute path relative to the
   * directory to which documentation is to be generated.
   *
   * This is convenient shorthand for the {@link Config#resolve} method where {@link Config#docsDir} is used as the
   * first path.
   *
   * @param {...string} paths - the sequence of paths or path segments to be resolved
   * @return {string} An absolute doc file path.
   * @public
   */
  docPath(...paths) {
    return this.resolve(this.docsDir, ...paths);
  }

  /**
   * Resolves the specified sequence of <code>paths</code> or path segments into an absolute URL for viewing a doc file.
   *
   * Optionally, <code>fragment</code> can be provided to be included in the URL as a hash fragment that relates to
   * content on the file view page.
   *
   * If the <code>docs.url</code> option is enabled within this {@link Config}, then this method will evaluate it to
   * create the URL, passing the file path and hash fragment to be included. Otherwise, this method will attempt to
   * create the URL based on the {@link Repository} information associated with this {@link Config}.
   *
   * @param {string|string[]} paths - the sequence of paths or path segments to be resolved
   * @param {string} [fragment] - the hash fragment to be included
   * @return {?string} The doc file URL or <code>null</code> if insufficient information available.
   * @public
   */
  docURL(paths, fragment) {
    paths = _.castArray(paths);

    const docURL = this.option('docs.url');
    let filePath = paths.map((p) => p.replace(/\\/g, '/')).join('/');
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }

    return docURL ? this.evaluate(docURL, { file: filePath, fragment }) : this.repository.fileURL(filePath, fragment);
  }

  /**
   * Evaluates the specified raw expression string by interpolating data properties and executing embedded JavaScript.
   *
   * Optionally, <code>additionalData</code> can be provided to expose more variables to <code>expression</code> during
   * evaluation.
   *
   * A <code>config</code> and <code>eol</code> variable can be used within the expression to reference this
   * {@link Config} and {@link Config#lineSeparator} respectively.
   *
   * @param {?string} expressionString - the raw expression to be evaluated (may be <code>null</code>)
   * @param {Object} [additionalData] - an object whose properties will be exposed as variables when the expression is
   * evaluated
   * @return {string} The evaluated output.
   * @public
   */
  evaluate(expressionString, additionalData) {
    const expression = new Expression(expressionString);
    const data = Object.assign({
      config: this,
      eol: this.lineSeparator
    }, additionalData);

    return expression.evaluate(data);
  }

  /**
   * Resolves the value of the option for the specified <code>name</code> within this {@link Config}.
   *
   * Optionally, if <code>defaultValue</code> is specified and the data for this {@link Config} contains no options, or
   * the desired option is missing from those options, it will be returned instead. Otherwise, this method will return
   * <code>undefined</code>.
   *
   * @param {string|string[]} name - the paths or path segments to the property on the options object within the data
   * whose value is to be returned
   * @param {*} [defaultValue] - the value to be returned for <code>undefined</code> resolved values
   * @return {*} The resolved option value.
   * @public
   */
  option(name, defaultValue) {
    return _.get(this[_data].options, name, defaultValue);
  }

  /**
   * Returns the specified <code>filePath</code> relative to the base directory from where the data for this
   * {@link Config} was originally loaded.
   *
   * @param {string} filePath - the file path to be made relative
   * @return {string} The relative file path.
   * @public
   */
  relative(filePath) {
    return path.relative(this.baseDir, filePath);
  }

  /**
   * Resolves the specified sequence of <code>paths</code> or path segments into an absolute path relative to the base
   * directory from where the data for this {@link Config} was originally loaded.
   *
   * @param {...string} paths - the sequence of paths or path segments to be resolved
   * @return {string} An absolute file path.
   * @public
   */
  resolve(...paths) {
    return path.resolve(this.baseDir, ...paths);
  }

  /**
   * @override
   */
  toString() {
    return `Config(${this.name})`;
  }

  /**
   * Returns the path to the directory to which assets are to be generated.
   *
   * The path is relative to the base directory of this {@link Config} and is <b>not</b> absolute and is simply the
   * value of the <code>assets.dir</code> option with a default value of <code>assets</code>. It's recommended that the
   * path be passed to {@link Config#resolve} to obtain the absolute directory path.
   *
   * @return {string} The relative directory path for assets.
   * @public
   */
  get assetsDir() {
    return this.option('assets.dir', 'assets');
  }

  /**
   * Returns the path of the base directory from where the data for this {@link Config} was originally loaded.
   *
   * @return {string} The configuration base directory.
   * @public
   */
  get baseDir() {
    return this[_baseDir];
  }

  /**
   * Returns the raw data for all docs defined within this {@link Config}.
   *
   * The array will be empty if the "docs" configuration is null, empty, or missing entirely.
   *
   * An error will occur if the "docs" configuration is present but is not an array.
   *
   * @return {Object[]} The raw doc data.
   * @throws {TypeError} If the "docs" configuration is not an array.
   * @public
   */
  get docs() {
    const { docs } = this[_data];
    if (!docs) {
      return [];
    }
    if (!Array.isArray(docs)) {
      throw new TypeError('"docs" configuration can only be an array');
    }

    return _.cloneDeep(docs);
  }

  /**
   * Returns the path to the directory to which documentation is to be generated.
   *
   * The path is relative to the base directory of this {@link Config} and is <b>not</b> absolute and is simply the
   * value of the <code>docs.dir</code> option with a default value of <code>docs</code>. It's recommended that the path
   * be passed to {@link Config#resolve} to obtain the absolute directory path.
   *
   * @return {string} The relative directory path for docs.
   * @public
   */
  get docsDir() {
    return this.option('docs.dir', 'docs');
  }

  /**
   * Returns a contact email address for the brand.
   *
   * @return {?string} The brand email address or <code>null</code> if unavailable.
   * @public
   */
  get email() {
    return this[_email];
  }

  /**
   * Returns the path of the file from where the data for this {@link Config} was originally loaded.
   *
   * @return {string} The configuration file path.
   * @public
   */
  get filePath() {
    return this[_filePath];
  }

  /**
   * Returns the homepage of the brand.
   *
   * If no homepage is available in this {@link Config}, it will fall back to the homepage within the associated
   * {@link Package} or {@link Repo}, in that order.
   *
   * @return {?string} The brand homepage, falling back to the package and repository homepages if unavailable, or
   * <code>null</code> if none of these are available.
   * @public
   */
  get homepage() {
    return this[_homepage];
  }

  /**
   * Returns the line separator to be used as per this {@link Config}.
   *
   * The line separator is derived from the value of the <code>lineSeparator</code> option, while <code>os.EOL</code> is
   * used as a fallback value.
   *
   * @return {string} The line separator.
   * @public
   */
  get lineSeparator() {
    return this[_lineSeparator];
  }

  /**
   * Returns the {@link Logger} for this {@link Config}.
   *
   * The logger can be used at any time to log normal/error messages.
   *
   * @return {Logger} The logger.
   * @public
   */
  get logger() {
    return this[_logger];
  }

  /**
   * Returns the name of the brand.
   *
   * The name should be in a format that is suitable for file paths while the title should be used when presenting the
   * brand.
   *
   * If no name is available in this {@link Config}, it will fall back to the name within the associated {@link Package}
   * or {@link Repo}, in that order.
   *
   * @return {?string} The brand name, falling back to the package and repository names if unavailable, or
   * <code>null</code> if none of these are available.
   * @public
   */
  get name() {
    return this[_name];
  }

  /**
   * Returns the {@link Package} information derived from the <code>package.json</code> file associated with this
   * {@link Config}.
   *
   * The package information will be empty if no <code>package.json</code> file could be found for this {@link Config}.
   *
   * @return {Package} The package information.
   * @public
   */
  get pkg() {
    return this[_pkg];
  }

  /**
   * Returns a {@link Repo} wrapper around the {@link Repository} information associated with this {@link Config}.
   *
   * The repository information will be empty if no recognized VCS data could be found for this {@link Config}.
   *
   * @return {Repo} The repository information.
   * @public
   */
  get repository() {
    return this[_repository];
  }

  /**
   * Returns the {@link Scope} for this {@link Config}.
   *
   * @return {Scope} The scope.
   * @public
   */
  get scope() {
    return this[_scope];
  }

  /**
   * Returns the raw data for all tasks defined within this {@link Config}.
   *
   * The array will be empty if the "tasks" configuration is null, empty, or missing entirely.
   *
   * An error will occur if the "tasks" configuration is present but is not an array.
   *
   * @return {Object[]} The raw task data.
   * @throws {TypeError} If the "tasks" configuration is not an array.
   * @public
   */
  get tasks() {
    const { tasks } = this[_data];
    if (!tasks) {
      return [];
    }
    if (!Array.isArray(tasks)) {
      throw new TypeError('"tasks" configuration can only be an array');
    }

    return _.cloneDeep(tasks);
  }

  /**
   * Returns the title of the brand.
   *
   * The title should be used when presenting the brand while the name should be in a format that is suitable for file
   * paths.
   *
   * If no title is available in this {@link Config}, it will fall back to the brand name.
   *
   * @return {?string} The brand title, falling back to the brand name, or <code>null</code> if neither of these are
   * available.
   * @public
   */
  get title() {
    return this[_title];
  }

}

module.exports = Config;

/**
 * The options that can be passed to the {@link Config} constructor.
 *
 * @typedef {Object} Config~Options
 * @property {string} filePath - The path of the file from where the configuration data was loaded.
 * @property {Object} data - The configuration data.
 * @property {Logger} [logger] - The {@link Logger} to be used by the configuration.
 * @property {Package} [pkg] - The {@link Package} associated with the configuration.
 * @property {RepositoryService~RepositoryInfo} [repository] - The VCS repository information associated with the
 * configuration.
 */
