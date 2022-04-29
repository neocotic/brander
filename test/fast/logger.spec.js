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

const assert = require('assert');
const chalk = require('chalk');
const { EOL } = require('os');
const sinon = require('sinon');
const stream = require('stream');

const Logger = require('../../src/logger');

describe('Logger', () => {
  let errorStreamStub;
  let outputStreamStub;

  beforeEach(() => {
    errorStreamStub = sinon.createStubInstance(stream.Writable);
    outputStreamStub = sinon.createStubInstance(stream.Writable);
  });

  describe('#enabled', () => {
    it('should should be true by default', () => {
      const logger = new Logger();

      assert.ok(logger.enabled);
    });

    it('should should be true when "enabled" option is true', () => {
      const logger = new Logger({
        enabled: true,
        errorStream: errorStreamStub,
        outputStream: outputStreamStub
      });

      assert.ok(logger.enabled);
    });

    it('should should be false when "enabled" option is false', () => {
      const logger = new Logger({
        enabled: false,
        errorStream: errorStreamStub,
        outputStream: outputStreamStub
      });

      assert.ok(!logger.enabled);
    });
  });

  describe('#error', () => {
    it('should write message to error stream with error indicator', () => {
      const logger = new Logger({
        errorStream: errorStreamStub,
        outputStream: outputStreamStub
      });

      assert.strictEqual(logger.error('foo'), logger);

      assert.ok(!outputStreamStub.write.called);
      assert.ok(errorStreamStub.write.calledOnce);
      assert.deepEqual(errorStreamStub.write.args, [
        [ `${chalk.red('Error!')} foo${EOL}` ]
      ]);
    });

    it('should write formatted message to error stream with error indicator', () => {
      const logger = new Logger({
        errorStream: errorStreamStub,
        outputStream: outputStreamStub
      });

      assert.strictEqual(logger.error('foo %d %j', 123, [ 'bar' ]), logger);

      assert.ok(!outputStreamStub.write.called);
      assert.ok(errorStreamStub.write.calledOnce);
      assert.deepEqual(errorStreamStub.write.args, [
        [ `${chalk.red('Error!')} foo 123 ["bar"]${EOL}` ]
      ]);
    });

    context('when no message is specified', () => {
      it('should write only error indicator and new line to error stream', () => {
        const logger = new Logger({
          errorStream: errorStreamStub,
          outputStream: outputStreamStub
        });

        assert.strictEqual(logger.error(), logger);

        assert.ok(!outputStreamStub.write.called);
        assert.ok(errorStreamStub.write.calledOnce);
        assert.deepEqual(errorStreamStub.write.args, [
          [ `${chalk.red('Error!')}${EOL}` ]
        ]);
      });
    });

    context('when no error stream was specified', () => {
      beforeEach(() => {
        sinon.stub(process.stderr, 'write');
      });

      afterEach(() => {
        process.stderr.write.restore();
      });

      it('should write message to process.stderr', () => {
        const logger = new Logger({ outputStream: outputStreamStub });

        assert.strictEqual(logger.error('foo'), logger);

        assert.ok(!outputStreamStub.write.called);
        assert.ok(process.stderr.write.calledOnce);
        assert.deepEqual(process.stderr.write.args, [
          [ `${chalk.red('Error!')} foo${EOL}` ]
        ]);
      });
    });

    context('when disabled', () => {
      it('should do nothing', () => {
        const logger = new Logger({
          enabled: false,
          errorStream: errorStreamStub,
          outputStream: outputStreamStub
        });

        assert.strictEqual(logger.error('foo'), logger);

        assert.ok(!outputStreamStub.write.called);
        assert.ok(!errorStreamStub.write.called);
      });
    });
  });

  describe('#log', () => {
    it('should write message to output stream', () => {
      const logger = new Logger({
        errorStream: errorStreamStub,
        outputStream: outputStreamStub
      });

      assert.strictEqual(logger.log('foo'), logger);

      assert.ok(!errorStreamStub.write.called);
      assert.ok(outputStreamStub.write.calledOnce);
      assert.deepEqual(outputStreamStub.write.args, [
        [ `foo${EOL}` ]
      ]);
    });

    it('should write formatted message to output stream', () => {
      const logger = new Logger({
        errorStream: errorStreamStub,
        outputStream: outputStreamStub
      });

      assert.strictEqual(logger.log('foo %d %j', 123, [ 'bar' ]), logger);

      assert.ok(!errorStreamStub.write.called);
      assert.ok(outputStreamStub.write.calledOnce);
      assert.deepEqual(outputStreamStub.write.args, [
        [ `foo 123 ["bar"]${EOL}` ]
      ]);
    });

    context('when no message is specified', () => {
      it('should write only a new line to output stream', () => {
        const logger = new Logger({
          errorStream: errorStreamStub,
          outputStream: outputStreamStub
        });

        assert.strictEqual(logger.log(), logger);

        assert.ok(!errorStreamStub.write.called);
        assert.ok(outputStreamStub.write.calledOnce);
        assert.deepEqual(outputStreamStub.write.args, [
          [ EOL ]
        ]);
      });
    });

    context('when no output stream was specified', () => {
      beforeEach(() => {
        sinon.stub(process.stdout, 'write');
      });

      afterEach(() => {
        process.stdout.write.restore();
      });

      it('should write message to process.stdout', () => {
        const logger = new Logger({ errorStream: errorStreamStub });

        assert.strictEqual(logger.log('foo'), logger);

        assert.ok(!errorStreamStub.write.called);
        assert.ok(process.stdout.write.calledOnce);
        assert.deepEqual(process.stdout.write.args, [
          [ `foo${EOL}` ]
        ]);
      });
    });

    context('when disabled', () => {
      it('should do nothing', () => {
        const logger = new Logger({
          enabled: false,
          errorStream: errorStreamStub,
          outputStream: outputStreamStub
        });

        assert.strictEqual(logger.log('foo'), logger);

        assert.ok(!outputStreamStub.write.called);
        assert.ok(!errorStreamStub.write.called);
      });
    });
  });

  describe('#warn', () => {
    it('should write message to output stream with warning indicator', () => {
      const logger = new Logger({
        errorStream: errorStreamStub,
        outputStream: outputStreamStub
      });

      assert.strictEqual(logger.warn('foo'), logger);

      assert.ok(!errorStreamStub.write.called);
      assert.ok(outputStreamStub.write.calledOnce);
      assert.deepEqual(outputStreamStub.write.args, [
        [ `${chalk.yellow('Warning!')} foo${EOL}` ]
      ]);
    });

    it('should write formatted message to output stream with warning indicator', () => {
      const logger = new Logger({
        errorStream: errorStreamStub,
        outputStream: outputStreamStub
      });

      assert.strictEqual(logger.warn('foo %d %j', 123, [ 'bar' ]), logger);

      assert.ok(!errorStreamStub.write.called);
      assert.ok(outputStreamStub.write.calledOnce);
      assert.deepEqual(outputStreamStub.write.args, [
        [ `${chalk.yellow('Warning!')} foo 123 ["bar"]${EOL}` ]
      ]);
    });

    context('when no message is specified', () => {
      it('should write only warning indicator and new line to output stream', () => {
        const logger = new Logger({
          errorStream: errorStreamStub,
          outputStream: outputStreamStub
        });

        assert.strictEqual(logger.warn(), logger);

        assert.ok(!errorStreamStub.write.called);
        assert.ok(outputStreamStub.write.calledOnce);
        assert.deepEqual(outputStreamStub.write.args, [
          [ `${chalk.yellow('Warning!')}${EOL}` ]
        ]);
      });
    });

    context('when no output stream was specified', () => {
      beforeEach(() => {
        sinon.stub(process.stdout, 'write');
      });

      afterEach(() => {
        process.stdout.write.restore();
      });

      it('should write message to process.stdout', () => {
        const logger = new Logger({ errorStream: errorStreamStub });

        assert.strictEqual(logger.warn('foo'), logger);

        assert.ok(!errorStreamStub.write.called);
        assert.ok(process.stdout.write.calledOnce);
        assert.deepEqual(process.stdout.write.args, [
          [ `${chalk.yellow('Warning!')} foo${EOL}` ]
        ]);
      });
    });

    context('when disabled', () => {
      it('should do nothing', () => {
        const logger = new Logger({
          enabled: false,
          errorStream: errorStreamStub,
          outputStream: outputStreamStub
        });

        assert.strictEqual(logger.warn('foo'), logger);

        assert.ok(!outputStreamStub.write.called);
        assert.ok(!errorStreamStub.write.called);
      });
    });
  });
});
