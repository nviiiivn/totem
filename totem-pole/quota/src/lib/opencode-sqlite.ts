export interface SqliteConn {
  all<T = unknown>(sql: string, params?: unknown[]): T[];
  get<T = unknown>(sql: string, params?: unknown[]): T | null;
  close(): void;
}

interface SqliteStatement {
  all(...params: unknown[]): unknown[];
  get(...params: unknown[]): unknown;
  run(...params: unknown[]): unknown;
}

interface BunSqliteDatabase {
  query(sql: string): SqliteStatement;
  close(): void;
}

interface BunSqliteModule {
  Database: new (path: string, options: { readonly: boolean }) => BunSqliteDatabase;
}

interface PreparedSqliteDatabase {
  prepare(sql: string): SqliteStatement;
  close(): void;
}

interface NodeSqliteDatabase extends PreparedSqliteDatabase {
  exec(sql: string): unknown;
}

interface NodeSqliteModule {
  DatabaseSync: new (
    path: string,
    options?: {
      readOnly?: boolean;
      enableForeignKeyConstraints?: boolean;
      open?: boolean;
    },
  ) => NodeSqliteDatabase;
}

interface BetterSqlite3Module {
  default: new (path: string, options?: { readonly?: boolean }) => PreparedSqliteDatabase;
}

function toParams(params?: unknown[]): unknown[] {
  return Array.isArray(params) ? params : [];
}

function runBunPragma(db: BunSqliteDatabase, sql: string): void {
  try {
    db.query(sql).run();
  } catch {
    // ignore
  }
}

function runPreparedPragma(db: PreparedSqliteDatabase, sql: string): void {
  try {
    db.prepare(sql).run();
  } catch {
    // ignore
  }
}

function runNodePragma(db: NodeSqliteDatabase, sql: string): void {
  try {
    db.exec(sql);
  } catch {
    // ignore
  }
}

function createPreparedSqliteConn(db: PreparedSqliteDatabase): SqliteConn {
  return {
    all<T = unknown>(sql: string, params?: unknown[]): T[] {
      const stmt = db.prepare(sql);
      return stmt.all(...toParams(params)) as T[];
    },

    get<T = unknown>(sql: string, params?: unknown[]): T | null {
      const stmt = db.prepare(sql);
      const row = stmt.get(...toParams(params)) as T | undefined;
      return row ?? null;
    },

    close(): void {
      try {
        db.close();
      } catch {
        // ignore
      }
    },
  };
}

async function openWithBunSqlite(dbPath: string): Promise<SqliteConn> {
  const mod = (await import("bun:sqlite")) as unknown as BunSqliteModule;
  const db = new mod.Database(dbPath, { readonly: true });

  // Keep reads deterministic and avoid accidental writes.
  runBunPragma(db, "PRAGMA query_only = ON;");

  // Avoid transient SQLITE_BUSY errors (WAL).
  runBunPragma(db, "PRAGMA busy_timeout = 5000;");

  return {
    all<T = unknown>(sql: string, params?: unknown[]): T[] {
      const stmt = db.query(sql);
      return stmt.all(...toParams(params)) as T[];
    },

    get<T = unknown>(sql: string, params?: unknown[]): T | null {
      const stmt = db.query(sql);
      const row = stmt.get(...toParams(params)) as T | undefined;
      return row ?? null;
    },

    close(): void {
      try {
        db.close();
      } catch {
        // ignore
      }
    },
  };
}

async function importNodeSqlite(): Promise<NodeSqliteModule | null> {
  try {
    return (await import("node:sqlite")) as unknown as NodeSqliteModule;
  } catch {
    return null;
  }
}

async function openWithNodeSqlite(dbPath: string, mod: NodeSqliteModule): Promise<SqliteConn> {
  const db = new mod.DatabaseSync(dbPath, {
    readOnly: true,
    enableForeignKeyConstraints: true,
    open: true,
  });

  // Keep reads deterministic and avoid accidental writes.
  runNodePragma(db, "PRAGMA query_only = ON;");

  // Avoid transient SQLITE_BUSY errors (WAL).
  runNodePragma(db, "PRAGMA busy_timeout = 5000;");

  return createPreparedSqliteConn(db);
}

async function openWithBetterSqlite3(dbPath: string): Promise<SqliteConn> {
  // VENDORED ADAPTATION (totem): better-sqlite3 is an OPTIONAL runtime backend
  // and is not a dependency here, so a literal specifier makes tsc fail to
  // resolve it. Going through a variable keeps the runtime behaviour identical
  // (this is already inside a fallback chain) while leaving the module
  // unresolved at type-check time, which is the honest description of it.
  // VENDORED ADAPTATION (totem): better-sqlite3 is an OPTIONAL runtime backend,
  // intentionally not installed — this call sits in a fallback chain and other
  // sqlite drivers are tried first. It is marked external in script/build.ts so
  // the bundler skips it; this silences the matching type-level resolution error
  // rather than pretending the module is present.
  // @ts-ignore -- optional peer, resolved at runtime only when actually present
  const mod = (await import("better-sqlite3")) as unknown as BetterSqlite3Module;
  const db = new mod.default(dbPath, { readonly: true });

  // Keep reads deterministic and avoid accidental writes.
  runPreparedPragma(db, "PRAGMA query_only = ON;");

  // Avoid transient SQLITE_BUSY errors (WAL).
  runPreparedPragma(db, "PRAGMA busy_timeout = 5000;");

  return createPreparedSqliteConn(db);
}

async function openWithNodeRuntimeSqlite(dbPath: string): Promise<SqliteConn> {
  const nodeSqlite = await importNodeSqlite();

  if (nodeSqlite) {
    return openWithNodeSqlite(dbPath, nodeSqlite);
  }

  try {
    return await openWithBetterSqlite3(dbPath);
  } catch (cause) {
    throw new Error(
      "OpenCode SQLite backend unavailable in this Node runtime; node:sqlite or optional better-sqlite3 is required for local history reads.",
      { cause },
    );
  }
}

export async function openOpenCodeSqliteReadOnly(dbPath: string): Promise<SqliteConn> {
  if (typeof globalThis === "object" && "Bun" in globalThis) {
    return openWithBunSqlite(dbPath);
  }

  return openWithNodeRuntimeSqlite(dbPath);
}
