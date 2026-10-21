/// <reference types="bun-types" />

import { describe, expect, mock, test } from 'bun:test';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  fetchLatestVersion,
  getTotemVersion,
  isTotemInstalled,
  isTmuxInstalled,
} from './system';

describe('system', () => {
  test('isTotemInstalled detects totem in ~/.totem/bin', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'totem-system-test-'));
    const originalPath = process.env.PATH;
    const originalHome = process.env.HOME;

    try {
      const totemPath = join(dir, '.totem', 'bin', 'totem');
      mkdirSync(join(dir, '.totem', 'bin'), { recursive: true });
      writeFileSync(totemPath, '#!/bin/sh\necho 1.2.3\n');
      chmodSync(totemPath, 0o755);
      process.env.HOME = dir;
      process.env.PATH = '/usr/bin:/bin:/usr/sbin:/sbin';

      const system = await import(`./system?test=home-detect-${Date.now()}`);
      expect(await system.isTotemInstalled()).toBe(true);
    } finally {
      process.env.PATH = originalPath;
      process.env.HOME = originalHome;
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('isTotemInstalled returns boolean', async () => {
    // We don't necessarily want to depend on the host system
    // but for a basic test we can just check it returns a boolean
    const result = await isTotemInstalled();
    expect(typeof result).toBe('boolean');
  });

  test('isTmuxInstalled returns boolean', async () => {
    const result = await isTmuxInstalled();
    expect(typeof result).toBe('boolean');
  });

  test('fetchLatestVersion returns version string or null', async () => {
    // Mock global fetch
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      return {
        ok: true,
        json: async () => ({ version: '1.2.3' }),
      };
    }) as any;

    try {
      const version = await fetchLatestVersion('any-package');
      expect(version).toBe('1.2.3');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('fetchLatestVersion returns null on error', async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = mock(async () => {
        return {
          ok: false,
        };
      }) as any;

      const version = await fetchLatestVersion('any-package');
      expect(version).toBeNull();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('getTotemVersion returns string or null', async () => {
    const version = await getTotemVersion();
    if (version !== null) {
      expect(typeof version).toBe('string');
    } else {
      expect(version).toBeNull();
    }
  });
});
