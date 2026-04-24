"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const path_1 = __importDefault(require("path"));
const load_config_1 = require("../src/load-config");
describe('resolveConfig', () => {
    const fakeConfigPath = '/project/src/sql/typesql.json';
    const configDir = path_1.default.dirname(fakeConfigPath);
    it('resolves relative databaseUri and sqlDir paths', () => {
        const input = {
            databaseUri: './mydb.db',
            sqlDir: './sql',
            client: 'bun:sqlite',
            includeCrudTables: []
        };
        const actual = (0, load_config_1.resolveConfig)(fakeConfigPath, input);
        const expected = {
            databaseUri: path_1.default.resolve(configDir, './mydb.db'),
            sqlDir: path_1.default.resolve(configDir, './sql'),
            client: 'bun:sqlite',
            includeCrudTables: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('does not resolve absolute databaseUri', () => {
        const absPath = '/var/data/mydb.db';
        const input = {
            databaseUri: absPath,
            sqlDir: './sql',
            client: 'bun:sqlite',
            includeCrudTables: []
        };
        const actual = (0, load_config_1.resolveConfig)(fakeConfigPath, input);
        const expected = {
            databaseUri: absPath,
            sqlDir: path_1.default.resolve(configDir, './sql'),
            client: 'bun:sqlite',
            includeCrudTables: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('does not resolve databaseUri if it looks like a connection string', () => {
        const input = {
            databaseUri: 'postgres://user:pass@host/db',
            sqlDir: './sql',
            client: 'pg',
            includeCrudTables: []
        };
        const actual = (0, load_config_1.resolveConfig)(fakeConfigPath, input);
        const expected = {
            databaseUri: 'postgres://user:pass@host/db',
            sqlDir: path_1.default.resolve(configDir, './sql'),
            client: 'pg',
            includeCrudTables: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('handles empty or whitespace databaseUri as relative path', () => {
        const inputs = [
            { databaseUri: '', sqlDir: './sql' },
            { databaseUri: '   ', sqlDir: './sql' }
        ];
        for (const input of inputs) {
            const config = {
                databaseUri: input.databaseUri,
                sqlDir: input.sqlDir,
                client: 'bun:sqlite',
                includeCrudTables: []
            };
            const actual = (0, load_config_1.resolveConfig)(fakeConfigPath, config);
            const expected = {
                databaseUri: path_1.default.resolve(configDir, input.databaseUri),
                sqlDir: path_1.default.resolve(configDir, input.sqlDir),
                client: 'bun:sqlite',
                includeCrudTables: []
            };
            node_assert_1.default.deepStrictEqual(actual, expected);
        }
    });
});
describe('resolveEnvVars', () => {
    it('does not replace databaseUri if no env var pattern', () => {
        const input = {
            databaseUri: 'postgres://user:pass@host/db',
            sqlDir: './sql',
            client: 'pg',
            includeCrudTables: []
        };
        const actual = (0, load_config_1.resolveEnvVars)(input);
        const expected = Object.assign({}, input);
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('replaces ${ENV_VAR} with process.env value', () => {
        process.env.TEST_DB = 'postgres://env-user:env-pass@env-host/env-db';
        process.env.AUTH_TOKEN = 'secret-token';
        const input = {
            databaseUri: '${TEST_DB}',
            authToken: '${AUTH_TOKEN}',
            sqlDir: './sql',
            client: 'pg',
            includeCrudTables: []
        };
        const actual = (0, load_config_1.resolveEnvVars)(input);
        const expected = Object.assign(Object.assign({}, input), { databaseUri: process.env.TEST_DB, authToken: 'secret-token' });
        node_assert_1.default.deepStrictEqual(actual, expected);
        delete process.env.TEST_DB;
    });
    it('replaces ${ENV_VAR} with empty string and warns if env var missing', () => {
        const input = {
            databaseUri: '${MISSING_VAR}',
            sqlDir: './sql',
            client: 'pg',
            includeCrudTables: []
        };
        let warnCalled = false;
        const originalWarn = console.warn;
        console.warn = (msg) => {
            if (msg.includes('MISSING_VAR'))
                warnCalled = true;
        };
        const actual = (0, load_config_1.resolveEnvVars)(input);
        const expected = Object.assign(Object.assign({}, input), { databaseUri: '' });
        node_assert_1.default.deepStrictEqual(actual, expected);
        node_assert_1.default.strictEqual(warnCalled, true);
        console.warn = originalWarn;
    });
});
describe('resolveTsFilePath', () => {
    it('resolves path when outDir is not provided (defaults to sqlDir)', () => {
        const sqlDir = path_1.default.resolve('/myapp/sql');
        const sqlPath = path_1.default.resolve('/myapp/sql/users/get-user.sql');
        const actual = (0, load_config_1.resolveTsFilePath)(sqlPath, sqlDir);
        const expected = path_1.default.resolve('/myapp/sql/users/get-user.ts');
        node_assert_1.default.strictEqual(actual, expected);
    });
    it('resolves path when outDir is provided and sqlPath is in subdirectory', () => {
        const sqlDir = path_1.default.resolve('/myapp/sql');
        const outDir = path_1.default.resolve('/myapp/generated');
        const sqlPath = path_1.default.resolve('/myapp/sql/users/other/select-user.sql');
        const actual = (0, load_config_1.resolveTsFilePath)(sqlPath, sqlDir, outDir);
        const expected = path_1.default.resolve('/myapp/generated/users/other/select-user.ts');
        node_assert_1.default.strictEqual(actual, expected);
    });
    it('resolves path when sqlPath is directly in sqlDir', () => {
        const sqlDir = path_1.default.resolve('/myapp/sql');
        const outDir = path_1.default.resolve('/myapp/out');
        const sqlPath = path_1.default.resolve('/myapp/sql/find-user.sql');
        const actual = (0, load_config_1.resolveTsFilePath)(sqlPath, sqlDir, outDir);
        const expected = path_1.default.resolve('/myapp/out/find-user.ts');
        node_assert_1.default.strictEqual(actual, expected);
    });
    it('resolves path correctly with relative sqlDir and outDir', () => {
        const baseDir = process.cwd(); // simulate like configDir in your example
        const sqlDir = './sql';
        const outDir = './generated';
        const sqlPath = path_1.default.join(baseDir, 'sql/users/get-user.sql');
        const actual = (0, load_config_1.resolveTsFilePath)(sqlPath, path_1.default.resolve(baseDir, sqlDir), path_1.default.resolve(baseDir, outDir));
        const expected = path_1.default.resolve(baseDir, 'generated/users/get-user.ts');
        node_assert_1.default.strictEqual(actual, expected);
    });
});
//# sourceMappingURL=config.test.js.map