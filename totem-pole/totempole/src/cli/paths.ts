import { existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

function getDefaultTotemConfigDir(): string {
  const userConfigDir = process.env.XDG_CONFIG_HOME
    ? process.env.XDG_CONFIG_HOME
    : join(homedir(), '.config');

  return join(userConfigDir, 'totem');
}

function getCustomTotemConfigDir(): string | undefined {
  const configDir = process.env.TOTEM_CONFIG_DIR?.trim();
  return configDir || undefined;
}

function getCustomTuiConfigPath(): string | undefined {
  const configPath = process.env.TOTEM_TUI_CONFIG?.trim();
  return configPath || undefined;
}

/**
 * Get the Totem plugin config directory.
 *
 * Resolution order:
 * 1. TOTEM_CONFIG_DIR (custom Totem directory)
 * 2. XDG_CONFIG_HOME/totem
 * 3. ~/.config/totem
 */
export function getConfigDir(): string {
  const customConfigDir = getCustomTotemConfigDir();
  if (customConfigDir) {
    return customConfigDir;
  }

  return getDefaultTotemConfigDir();
}

/**
 * Get Totem config directories in read/search order.
 *
 * Resolution order:
 * 1. TOTEM_CONFIG_DIR (if set)
 * 2. XDG_CONFIG_HOME/totem or ~/.config/totem
 *
 * Duplicate entries are removed.
 */
export function getConfigSearchDirs(): string[] {
  const dirs = [getCustomTotemConfigDir(), getDefaultTotemConfigDir()];

  return dirs.filter((dir, index): dir is string => {
    return Boolean(dir) && dirs.indexOf(dir) === index;
  });
}

export function getTotemConfigPaths(): string[] {
  const configDir = getConfigDir();
  return [join(configDir, 'totem.json'), join(configDir, 'totem.jsonc')];
}

export function getConfigJson(): string {
  return getTotemConfigPaths()[0];
}

export function getConfigJsonc(): string {
  return getTotemConfigPaths()[1];
}

export function getLiteConfig(): string {
  return join(getConfigDir(), 'totempole.json');
}

export function getLiteConfigJsonc(): string {
  return join(getConfigDir(), 'totempole.jsonc');
}

export function getTuiConfig(): string {
  const customConfigPath = getCustomTuiConfigPath();
  if (customConfigPath) return customConfigPath;

  return join(getConfigDir(), 'tui.json');
}

export function getTuiConfigJsonc(): string {
  return join(getConfigDir(), 'tui.jsonc');
}

export function getExistingLiteConfigPath(): string {
  const jsonPath = getLiteConfig();
  if (existsSync(jsonPath)) return jsonPath;

  const jsoncPath = getLiteConfigJsonc();
  if (existsSync(jsoncPath)) return jsoncPath;

  return jsonPath;
}

export function getExistingTuiConfigPath(): string {
  const customConfigPath = getCustomTuiConfigPath();
  if (customConfigPath) return customConfigPath;

  const jsonPath = join(getConfigDir(), 'tui.json');
  if (existsSync(jsonPath)) return jsonPath;

  const jsoncPath = getTuiConfigJsonc();
  if (existsSync(jsoncPath)) return jsoncPath;

  return jsonPath;
}

export function getExistingConfigPath(): string {
  const jsonPath = getConfigJson();
  if (existsSync(jsonPath)) return jsonPath;

  const jsoncPath = getConfigJsonc();
  if (existsSync(jsoncPath)) return jsoncPath;

  return jsonPath;
}

export function ensureConfigDir(): void {
  const configDir = getConfigDir();
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

export function ensureTuiConfigDir(): void {
  const configDir = dirname(getTuiConfig());
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

/**
 * Ensure the directory for Totem's main config file exists.
 */
export function ensureTotemConfigDir(): void {
  const configDir = dirname(getConfigJson());
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}
