import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { crossSpawn } from '../utils/compat';

let cachedTotemPath: string | null = null;

function resolvePathCommand(command: string): string | null {
  try {
    const resolver = process.platform === 'win32' ? 'where' : 'which';
    const result = spawnSync(resolver, [command], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    if (result.status !== 0) {
      return null;
    }

    const resolved = result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);

    return resolved ?? null;
  } catch {
    return null;
  }
}

function canExecute(command: string, args: string[]): boolean {
  try {
    const result = spawnSync(command, args, {
      stdio: 'ignore',
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

function getTotemPaths(): string[] {
  const home = process.env.HOME || process.env.USERPROFILE || '';

  return [
    // PATH (try this first)
    'totem',
    // User local installations (Linux & macOS)
    `${home}/.local/bin/totem`,
    `${home}/.totem/bin/totem`,
    `${home}/bin/totem`,
    // System-wide installations
    '/usr/local/bin/totem',
    '/opt/totem/bin/totem',
    '/usr/bin/totem',
    '/bin/totem',
    // macOS specific
    '/Applications/Totem.app/Contents/MacOS/totem',
    `${home}/Applications/Totem.app/Contents/MacOS/totem`,
    // Homebrew (macOS & Linux)
    '/opt/homebrew/bin/totem',
    '/home/linuxbrew/.linuxbrew/bin/totem',
    `${home}/homebrew/bin/totem`,
    // macOS user Library
    `${home}/Library/Application Support/totem/bin/totem`,
    // Snap (Linux)
    '/snap/bin/totem',
    '/var/snap/totem/current/bin/totem',
    // Flatpak (Linux)
    '/var/lib/flatpak/exports/bin/ai.totem.Totem',
    `${home}/.local/share/flatpak/exports/bin/ai.totem.Totem`,
    // Nix (Linux/macOS)
    '/nix/store/totem/bin/totem',
    `${home}/.nix-profile/bin/totem`,
    '/run/current-system/sw/bin/totem',
    // Cargo (Rust toolchain)
    `${home}/.cargo/bin/totem`,
    // npm/npx global
    `${home}/.npm-global/bin/totem`,
    '/usr/local/lib/node_modules/totem/bin/totem',
    // Yarn global
    `${home}/.yarn/bin/totem`,
    // PNPM
    `${home}/.pnpm-global/bin/totem`,
  ];
}

export function resolveTotemPath(): string {
  if (cachedTotemPath) {
    return cachedTotemPath;
  }

  const pathTotemPath = resolvePathCommand('totem');
  if (pathTotemPath) {
    cachedTotemPath = pathTotemPath;
    return pathTotemPath;
  }

  const paths = getTotemPaths();

  for (const totemPath of paths) {
    if (totemPath === 'totem') continue;
    try {
      const stat = statSync(totemPath);
      if (stat.isFile()) {
        cachedTotemPath = totemPath;
        return totemPath;
      }
    } catch {
      // Try next path
    }
  }

  // Fallback to 'totem' and hope it's in PATH
  return 'totem';
}

export async function isTotemInstalled(): Promise<boolean> {
  const pathTotemPath = resolvePathCommand('totem');

  if (pathTotemPath && canExecute(pathTotemPath, ['--version'])) {
    cachedTotemPath = pathTotemPath;
    return true;
  }

  const paths = getTotemPaths();

  for (const totemPath of paths) {
    if (totemPath === 'totem') continue;
    try {
      const proc = crossSpawn([totemPath, '--version'], {
        stdout: 'pipe',
        stderr: 'pipe',
      });
      await proc.exited;
      if (proc.exitCode === 0) {
        cachedTotemPath = totemPath;
        return true;
      }
    } catch {
      // Try next path
    }
  }
  return false;
}

export async function isTmuxInstalled(): Promise<boolean> {
  try {
    const proc = crossSpawn(['tmux', '-V'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await proc.exited;
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}

export async function getTotemVersion(): Promise<string | null> {
  const totemPath = resolveTotemPath();
  try {
    const proc = crossSpawn([totemPath, '--version'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const outputPromise = proc.stdout();
    await proc.exited;
    if (proc.exitCode === 0) {
      return (await outputPromise).trim();
    }
  } catch {
    // Failed
  }
  return null;
}

export function getTotemPath(): string | null {
  const path = resolveTotemPath();
  return path === 'totem' ? null : path;
}

export async function fetchLatestVersion(
  packageName: string,
): Promise<string | null> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
    if (!res.ok) return null;
    const data = (await res.json()) as { version: string };
    return data.version;
  } catch {
    return null;
  }
}
