#!/usr/bin/env node

/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

process.title = 'chrome-devtools-mcp-lambdatest';

import {version} from 'node:process';

const [major, minor] = version.substring(1).split('.').map(Number);

if (major === 20 && minor < 19) {
  console.error(
    `ERROR: \`chrome-devtools-mcp\` does not support Node ${process.version}. Please upgrade to Node 20.19.0 LTS or a newer LTS.`,
  );
  process.exit(1);
}

if (major === 22 && minor < 12) {
  console.error(
    `ERROR: \`chrome-devtools-mcp\` does not support Node ${process.version}. Please upgrade to Node 22.12.0 LTS or a newer LTS.`,
  );
  process.exit(1);
}

if (major < 20) {
  console.error(
    `ERROR: \`chrome-devtools-mcp\` does not support Node ${process.version}. Please upgrade to Node 20.19.0 LTS or a newer LTS.`,
  );
  process.exit(1);
}

const {buildLambdaTestWsEndpointFromEnv} =
  await import('../utils/lambdatest.js');

const hasExplicitConnection = process.argv.some(arg => {
  return (
    arg === '--wsEndpoint' ||
    arg.startsWith('--wsEndpoint=') ||
    arg === '--browserUrl' ||
    arg.startsWith('--browserUrl=')
  );
});

if (!hasExplicitConnection) {
  let wsEndpoint: string;
  try {
    wsEndpoint = buildLambdaTestWsEndpointFromEnv();
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
  process.argv.push(`--wsEndpoint=${wsEndpoint}`);
}

await import('./chrome-devtools-mcp-main.js');
