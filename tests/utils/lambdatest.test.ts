/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import {describe, it} from 'node:test';

import {
  buildLambdaTestWsEndpoint,
  buildLambdaTestWsEndpointFromEnv,
} from '../../src/utils/lambdatest.js';

describe('buildLambdaTestWsEndpoint', () => {
  it('builds a wss:// endpoint with the CDP capabilities encoded', () => {
    const endpoint = buildLambdaTestWsEndpoint({
      user: 'my-user',
      accessKey: 'my-key',
    });
    assert.match(
      endpoint,
      /^wss:\/\/cdp\.lambdatest\.com\/puppeteer\?capabilities=/,
    );

    const capabilities = JSON.parse(
      decodeURIComponent(endpoint.split('capabilities=')[1]!),
    );
    assert.strictEqual(capabilities.browserName, 'Chrome');
    assert.strictEqual(capabilities.browserVersion, 'latest');
    assert.deepStrictEqual(capabilities['LT:Options'], {
      user: 'my-user',
      accessKey: 'my-key',
      platform: 'Windows 10',
    });
  });

  it('includes optional LT:Options fields when provided', () => {
    const endpoint = buildLambdaTestWsEndpoint({
      user: 'my-user',
      accessKey: 'my-key',
      browserVersion: '120',
      build: 'my-build',
      name: 'my-test',
      platform: 'Windows 10',
      resolution: '1366x768',
      network: true,
      video: true,
      console: true,
      tunnel: true,
      tunnelName: 'my-tunnel',
    });
    const capabilities = JSON.parse(
      decodeURIComponent(endpoint.split('capabilities=')[1]!),
    );
    assert.strictEqual(capabilities.browserVersion, '120');
    assert.deepStrictEqual(capabilities['LT:Options'], {
      user: 'my-user',
      accessKey: 'my-key',
      build: 'my-build',
      name: 'my-test',
      platform: 'Windows 10',
      resolution: '1366x768',
      network: true,
      video: true,
      console: true,
      tunnel: true,
      tunnelName: 'my-tunnel',
    });
  });

  it('throws if the username or access key is missing', () => {
    assert.throws(() => {
      return buildLambdaTestWsEndpoint({user: '', accessKey: 'key'});
    }, /LambdaTest username and access key are required/);
    assert.throws(() => {
      return buildLambdaTestWsEndpoint({user: 'user', accessKey: ''});
    }, /LambdaTest username and access key are required/);
  });
});

describe('buildLambdaTestWsEndpointFromEnv', () => {
  it('reads LT_* environment variables', () => {
    const endpoint = buildLambdaTestWsEndpointFromEnv({
      LT_USERNAME: 'env-user',
      LT_ACCESS_KEY: 'env-key',
      LT_BUILD: 'env-build',
      LT_NETWORK: 'true',
    });
    const capabilities = JSON.parse(
      decodeURIComponent(endpoint.split('capabilities=')[1]!),
    );
    assert.deepStrictEqual(capabilities['LT:Options'], {
      user: 'env-user',
      accessKey: 'env-key',
      build: 'env-build',
      platform: 'Windows 10',
      network: true,
    });
  });

  it('throws a helpful error when credentials are missing', () => {
    assert.throws(() => {
      return buildLambdaTestWsEndpointFromEnv({});
    }, /LT_USERNAME and LT_ACCESS_KEY/);
  });
});
