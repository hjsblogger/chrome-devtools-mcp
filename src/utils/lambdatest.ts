/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Builds the `wss://cdp.lambdatest.com/puppeteer` endpoint used to connect
 * to a browser session on the TestMu AI / LambdaTest Browser Cloud. See
 * https://www.testmuai.com/support/docs/puppeteer-testing/ for the
 * capabilities format.
 */
export interface LambdaTestCloudOptions {
  user: string;
  accessKey: string;
  browserVersion?: string;
  build?: string;
  name?: string;
  platform?: string;
  resolution?: string;
  network?: boolean;
  video?: boolean;
  console?: boolean;
  tunnel?: boolean;
  tunnelName?: string;
}

export function buildLambdaTestWsEndpoint(
  options: LambdaTestCloudOptions,
): string {
  const {user, accessKey} = options;
  if (!user || !accessKey) {
    throw new Error(
      'LambdaTest username and access key are required. Set LT_USERNAME and LT_ACCESS_KEY (see https://accounts.lambdatest.com/security to generate an access key).',
    );
  }

  const ltOptions: Record<string, unknown> = {user, accessKey};
  if (options.build) {
    ltOptions['build'] = options.build;
  }
  if (options.name) {
    ltOptions['name'] = options.name;
  }
  // LambdaTest rejects sessions that omit `platform` ("platform capability
  // is missing"), so unlike the other optional fields this always needs a
  // value.
  ltOptions['platform'] = options.platform ?? 'Windows 10';
  if (options.resolution) {
    ltOptions['resolution'] = options.resolution;
  }
  if (options.network !== undefined) {
    ltOptions['network'] = options.network;
  }
  if (options.video !== undefined) {
    ltOptions['video'] = options.video;
  }
  if (options.console !== undefined) {
    ltOptions['console'] = options.console;
  }
  if (options.tunnel !== undefined) {
    ltOptions['tunnel'] = options.tunnel;
  }
  if (options.tunnelName) {
    ltOptions['tunnelName'] = options.tunnelName;
  }

  const capabilities = {
    browserName: 'Chrome',
    browserVersion: options.browserVersion ?? 'latest',
    'LT:Options': ltOptions,
  };

  return `wss://cdp.lambdatest.com/puppeteer?capabilities=${encodeURIComponent(
    JSON.stringify(capabilities),
  )}`;
}

function envFlag(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value === 'true' || value === '1';
}

/**
 * Reads `LT_*` environment variables and builds the corresponding
 * LambdaTest Puppeteer WebSocket endpoint.
 */
export function buildLambdaTestWsEndpointFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): string {
  return buildLambdaTestWsEndpoint({
    user: env['LT_USERNAME'] ?? '',
    accessKey: env['LT_ACCESS_KEY'] ?? '',
    browserVersion: env['LT_BROWSER_VERSION'],
    build: env['LT_BUILD'],
    name: env['LT_NAME'],
    platform: env['LT_PLATFORM'],
    resolution: env['LT_RESOLUTION'],
    network: envFlag(env['LT_NETWORK']),
    video: envFlag(env['LT_VIDEO']),
    console: envFlag(env['LT_CONSOLE']),
    tunnel: envFlag(env['LT_TUNNEL']),
    tunnelName: env['LT_TUNNEL_NAME'],
  });
}
