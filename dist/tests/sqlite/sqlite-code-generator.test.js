"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const test_utils_1 = require("../test-utils");
const sqlite_1 = require("../../src/codegen/sqlite");
const create_schema_1 = require("../mysql-query-analyzer/create-schema");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const Either_1 = require("fp-ts/lib/Either");
const query_executor_1 = require("../../src/sqlite-query-analyzer/query-executor");
describe('sqlite-code-generator', () => {
    const db = new better_sqlite3_1.default('./mydb.db');
    it('select01 - select id, name from mytable2 where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id, name from mytable2 where id = ?';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select01', create_schema_1.sqliteDbSchema, 'better-sqlite3');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select01.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select01-libsql - select id, name from mytable2 where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id, name from mytable2 where id = ?';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select01', create_schema_1.sqliteDbSchema, 'libsql', false);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select01-libsql.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select01-bun - select id, name from mytable2 where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id, name from mytable2 where id = ?';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select01', create_schema_1.sqliteDbSchema, 'bun:sqlite', false);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select01-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select01-d1 - select id, name from mytable2 where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id, name from mytable2 where id = ?';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select01', create_schema_1.sqliteDbSchema, 'd1', false);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select01-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select02 - select without parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id from mytable1';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select02', create_schema_1.sqliteDbSchema, 'better-sqlite3');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select02.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select02-libsql - select without parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id from mytable1';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select02', create_schema_1.sqliteDbSchema, 'libsql', false);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select02-libsql.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select02-bun - select without parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id from mytable1';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select02', create_schema_1.sqliteDbSchema, 'bun:sqlite');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select02-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select02-d1 - select without parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id from mytable1';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select02', create_schema_1.sqliteDbSchema, 'd1');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select02-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select03 - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id from mytable1 where id = :id or id = :id';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select03', create_schema_1.sqliteDbSchema, 'better-sqlite3');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select03.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select03-bun - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id from mytable1 where id = :id or id = :id';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select03', create_schema_1.sqliteDbSchema, 'bun:sqlite');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select03-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select03-d1 - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id from mytable1 where id = :id or id = :id';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select03', create_schema_1.sqliteDbSchema, 'd1');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select03-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select04 - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	text_column,
	date(text_column) as date_text,
	datetime(text_column) as datetime_text,
	integer_column,
	date(integer_column, 'auto') as date_integer,
	datetime(integer_column, 'auto') as datetime_integer
FROM all_types
WHERE date(text_column) = :date
AND date(integer_column, 'auto') = :date
AND datetime(text_column) = :date_time
AND datetime(integer_column, 'auto') = :date_time`;
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select04', create_schema_1.sqliteDbSchema, 'better-sqlite3');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select04.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select04-bun - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	text_column,
	date(text_column) as date_text,
	datetime(text_column) as datetime_text,
	integer_column,
	date(integer_column, 'auto') as date_integer,
	datetime(integer_column, 'auto') as datetime_integer
FROM all_types
WHERE date(text_column) = :date
AND date(integer_column, 'auto') = :date
AND datetime(text_column) = :date_time
AND datetime(integer_column, 'auto') = :date_time`;
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select04', create_schema_1.sqliteDbSchema, 'bun:sqlite');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select04-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select04-d1 - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	text_column,
	date(text_column) as date_text,
	datetime(text_column) as datetime_text,
	integer_column,
	date(integer_column, 'auto') as date_integer,
	datetime(integer_column, 'auto') as datetime_integer
FROM all_types
WHERE date(text_column) = :date
AND date(integer_column, 'auto') = :date
AND datetime(text_column) = :date_time
AND datetime(integer_column, 'auto') = :date_time`;
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'select04', create_schema_1.sqliteDbSchema, 'd1');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select04-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert01 - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) values(10)';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'insert01', create_schema_1.sqliteDbSchema, 'better-sqlite3');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/insert01.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert01-libsql - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) values(10)';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'insert01', create_schema_1.sqliteDbSchema, 'libsql', false);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/insert01-libsql.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert01-bun - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) values(10)';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'insert01', create_schema_1.sqliteDbSchema, 'bun:sqlite');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/insert01-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert01-d1 - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) values(10)';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'insert01', create_schema_1.sqliteDbSchema, 'd1');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/insert01-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert02 - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) values(?)';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'insert02', create_schema_1.sqliteDbSchema, 'better-sqlite3');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/insert02.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert02-bun - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) values(?)';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'insert02', create_schema_1.sqliteDbSchema, 'bun:sqlite');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/insert02-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert02-d1 - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) values(?)';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'insert02', create_schema_1.sqliteDbSchema, 'd1');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/insert02-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert03 - INSERT INTO mytable1(value) VALUES(:value) RETURNING *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) VALUES(:value) RETURNING *';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'insert03', create_schema_1.sqliteDbSchema, 'better-sqlite3', false);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/insert03.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert03-libsql - INSERT INTO mytable1(value) VALUES(:value) RETURNING *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) VALUES(:value) RETURNING *';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'insert03', create_schema_1.sqliteDbSchema, 'libsql', false);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/insert03-libsql.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert03-d1 - INSERT INTO mytable1(value) VALUES(:value) RETURNING *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) VALUES(:value) RETURNING *';
        const actual = yield (0, sqlite_1.generateTsCode)(sql, 'insert03', create_schema_1.sqliteDbSchema, 'd1', false);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/insert03-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('update01 - UPDATE mytable1 SET value=? WHERE id=?', () => {
        const sql = 'UPDATE mytable1 SET value=? WHERE id=?';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'update01', create_schema_1.sqliteDbSchema, 'better-sqlite3');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/update01.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('update02 - update-no-data - UPDATE with no SET parameters should not include data parameter', () => {
        const sql = 'UPDATE mytable1 SET value = 42 WHERE id = :id';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'update02', create_schema_1.sqliteDbSchema, 'better-sqlite3');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/update02.ts.txt');
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('update01-libsql - UPDATE mytable1 SET value=? WHERE id=?', () => {
        const sql = 'UPDATE mytable1 SET value=? WHERE id=?';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'update01', create_schema_1.sqliteDbSchema, 'libsql', false);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/update01-libsql.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('update02-libsql - update-no-data - UPDATE with no SET parameters should not include data parameter', () => {
        const sql = 'UPDATE mytable1 SET value = 42 WHERE id = :id';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'update02', create_schema_1.sqliteDbSchema, 'libsql');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/update02-libsql.ts.txt');
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('update01-bun - UPDATE mytable1 SET value=? WHERE id=?', () => {
        const sql = 'UPDATE mytable1 SET value=? WHERE id=?';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'update01', create_schema_1.sqliteDbSchema, 'bun:sqlite');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/update01-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('update02-bun - update-no-data - UPDATE with no SET parameters should not include data parameter', () => {
        const sql = 'UPDATE mytable1 SET value = 42 WHERE id = :id';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'update02', create_schema_1.sqliteDbSchema, 'bun:sqlite');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/update02-bun.ts.txt');
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('update01-d1 - UPDATE mytable1 SET value=? WHERE id=?', () => {
        const sql = 'UPDATE mytable1 SET value=? WHERE id=?';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'update01', create_schema_1.sqliteDbSchema, 'd1');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/update01-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('update02-d1 - update-no-data - UPDATE with no SET parameters should not include data parameter', () => {
        const sql = 'UPDATE mytable1 SET value = 42 WHERE id = :id';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'update02', create_schema_1.sqliteDbSchema, 'd1');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/update02-d1.ts.txt');
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('update03 - returning *', () => {
        const sql = 'UPDATE mytable1 SET value = ? WHERE id = ? RETURNING *';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'update03', create_schema_1.sqliteDbSchema, 'better-sqlite3');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/update03.ts.txt');
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('delete01 - DELETE FROM mytable1 WHERE id=?', () => {
        const sql = 'DELETE FROM mytable1 WHERE id=?';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'delete01', create_schema_1.sqliteDbSchema, 'better-sqlite3');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/delete01.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('delete01-libsql - DELETE FROM mytable1 WHERE id=?', () => {
        const sql = 'DELETE FROM mytable1 WHERE id=?';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'delete01', create_schema_1.sqliteDbSchema, 'libsql', false);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/delete01-libsql.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('delete01-bun - DELETE FROM mytable1 WHERE id=?', () => {
        const sql = 'DELETE FROM mytable1 WHERE id=?';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'delete01', create_schema_1.sqliteDbSchema, 'bun:sqlite');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/delete01-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('delete01-bun - DELETE FROM mytable1 WHERE id=?', () => {
        const sql = 'DELETE FROM mytable1 WHERE id=?';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'delete01', create_schema_1.sqliteDbSchema, 'd1');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/delete01-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('delete02 - returning *', () => {
        const sql = 'DELETE FROM mytable1 WHERE id=? RETURNING *';
        const actual = (0, sqlite_1.generateTsCode)(sql, 'delete02', create_schema_1.sqliteDbSchema, 'better-sqlite3');
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/delete02.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('crud-select01', () => {
        const actual = (0, sqlite_1.generateCrud)('better-sqlite3', 'Select', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-select01.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-select01-libsql', () => {
        const actual = (0, sqlite_1.generateCrud)('libsql', 'Select', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-select01-libsql.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-select01-bun', () => {
        const actual = (0, sqlite_1.generateCrud)('bun:sqlite', 'Select', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-select01-bun.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-select01-d1', () => {
        const actual = (0, sqlite_1.generateCrud)('d1', 'Select', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-select01-d1.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-insert01', () => {
        const actual = (0, sqlite_1.generateCrud)('better-sqlite3', 'Insert', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-insert01.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-insert01-libsql', () => {
        const actual = (0, sqlite_1.generateCrud)('libsql', 'Insert', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-insert01-libsql.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-insert01-bun', () => {
        const actual = (0, sqlite_1.generateCrud)('bun:sqlite', 'Insert', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-insert01-bun.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-insert01-d1', () => {
        const actual = (0, sqlite_1.generateCrud)('d1', 'Insert', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-insert01-d1.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-update01', () => {
        const actual = (0, sqlite_1.generateCrud)('better-sqlite3', 'Update', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-update01.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-update01-libsql', () => {
        const actual = (0, sqlite_1.generateCrud)('libsql', 'Update', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-update01-libsql.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-update01-bun', () => {
        const actual = (0, sqlite_1.generateCrud)('bun:sqlite', 'Update', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-update01-bun.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-update01-d1', () => {
        const actual = (0, sqlite_1.generateCrud)('d1', 'Update', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-update01-d1.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-update02', () => {
        const actual = (0, sqlite_1.generateCrud)('better-sqlite3', 'Update', 'mytable2', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-update02.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-update03', () => {
        const actual = (0, sqlite_1.generateCrud)('better-sqlite3', 'Update', 'mytable3', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-update03.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-delete01', () => {
        const actual = (0, sqlite_1.generateCrud)('better-sqlite3', 'Delete', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-delete01.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-delete01-libsql', () => {
        const actual = (0, sqlite_1.generateCrud)('libsql', 'Delete', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-delete01-libsql.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-delete01-bun', () => {
        const actual = (0, sqlite_1.generateCrud)('bun:sqlite', 'Delete', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-delete01-bun.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-delete01-d1', () => {
        const actual = (0, sqlite_1.generateCrud)('d1', 'Delete', 'mytable1', create_schema_1.sqliteDbSchema);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/crud-delete01-d1.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select05 - SELECT id FROM mytable1 ORDER BY ?', () => {
        const sql = 'SELECT id FROM mytable1 ORDER BY ?';
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'select05', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select05.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select05-bun - SELECT id FROM mytable1 ORDER BY ?', () => {
        const sql = 'SELECT id FROM mytable1 ORDER BY ?';
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'select05', create_schema_1.sqliteDbSchema, 'bun:sqlite', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select05-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select05-d1 - SELECT id FROM mytable1 ORDER BY ?', () => {
        const sql = 'SELECT id FROM mytable1 ORDER BY ?';
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'select05', create_schema_1.sqliteDbSchema, 'd1', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select05-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select06 - SELECT id FROM mytable1 ORDER BY ?', () => {
        const sql = `SELECT id
FROM mytable2
WHERE id IN (:ids)
AND name IN (:names)`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'select06', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select06.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select06-bun - SELECT id FROM mytable1 ORDER BY ?', () => {
        const sql = `SELECT id
FROM mytable2
WHERE id IN (:ids)
AND name IN (:names)`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'select06', create_schema_1.sqliteDbSchema, 'bun:sqlite', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select06-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select06-d1 - SELECT id FROM mytable1 ORDER BY ?', () => {
        const sql = `SELECT id
FROM mytable2
WHERE id IN (:ids)
AND name IN (:names)`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'select06', create_schema_1.sqliteDbSchema, 'd1', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select06-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select07 - fts', () => {
        const sql = `SELECT
	id,
	name,
	descr
FROM mytable2_fts
WHERE mytable2_fts MATCH :match
LIMIT 20`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'select07', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select07-fts.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select08 - boolean', () => {
        const sql = `SELECT
	id,
	:param1 as param1,
	:param2 as param2
FROM mytable1
WHERE :param1 is true OR (:param2 is true OR :param2 is null)`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'select08', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select08-boolean.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select09 - enum', () => {
        const sql = `SELECT
	enum_column
FROM all_types
where enum_column = :enum_value`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'select09', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select09-enum.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select09-libsql - enum', () => {
        const sql = `SELECT
	enum_column
FROM all_types
where enum_column = :enum_value`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'select09', create_schema_1.sqliteDbSchema, 'libsql', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select09-libsql-enum.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select09-bun - enum', () => {
        const sql = `SELECT
	enum_column
FROM all_types
where enum_column = :enum_value`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'select09', create_schema_1.sqliteDbSchema, 'bun:sqlite', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/select09-bun-enum.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('nested01 - FROM users u INNER JOIN posts p', () => {
        const sql = `-- @nested
SELECT
	u.id as user_id,
	u.name as user_name,
	p.id as post_id,
	p.title as post_title
FROM users u
INNER JOIN posts p on p.fk_user = u.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'nested01', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/nested01.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('nested01-libsql - FROM users u INNER JOIN posts p', () => {
        const sql = `-- @nested
SELECT
	u.id as user_id,
	u.name as user_name,
	p.id as post_id,
	p.title as post_title
FROM users u
INNER JOIN posts p on p.fk_user = u.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'nested01', create_schema_1.sqliteDbSchema, 'libsql', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/nested01-libsql.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('nested01-bun - FROM users u INNER JOIN posts p', () => {
        const sql = `-- @nested
SELECT
	u.id as user_id,
	u.name as user_name,
	p.id as post_id,
	p.title as post_title
FROM users u
INNER JOIN posts p on p.fk_user = u.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'nested01', create_schema_1.sqliteDbSchema, 'bun:sqlite', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/nested01-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('nested01-d1 - FROM users u INNER JOIN posts p', () => {
        const sql = `-- @nested
SELECT
	u.id as user_id,
	u.name as user_name,
	p.id as post_id,
	p.title as post_title
FROM users u
INNER JOIN posts p on p.fk_user = u.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'nested01', create_schema_1.sqliteDbSchema, 'd1', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/nested01-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('nested02 - self relation', () => {
        const sql = `-- @nested
SELECT
	c.id,
	a1.*,
	a2.*
FROM clients as c
INNER JOIN addresses as a1 ON a1.id = c.primaryAddress
LEFT JOIN addresses as a2 ON a2.id = c.secondaryAddress
WHERE c.id = :clientId`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'nested02', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/nested02-clients-with-addresses.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('nested02-bun - self relation', () => {
        const sql = `-- @nested
SELECT
	c.id,
	a1.*,
	a2.*
FROM clients as c
INNER JOIN addresses as a1 ON a1.id = c.primaryAddress
LEFT JOIN addresses as a2 ON a2.id = c.secondaryAddress
WHERE c.id = :clientId`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'nested02', create_schema_1.sqliteDbSchema, 'bun:sqlite', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/nested02-bun-clients-with-addresses.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('nested02-d1 - self relation', () => {
        const sql = `-- @nested
SELECT
	c.id,
	a1.*,
	a2.*
FROM clients as c
INNER JOIN addresses as a1 ON a1.id = c.primaryAddress
LEFT JOIN addresses as a2 ON a2.id = c.secondaryAddress
WHERE c.id = :clientId`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'nested02', create_schema_1.sqliteDbSchema, 'd1', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/nested02-d1-clients-with-addresses.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('nested03 - many to many', () => {
        const sql = `-- @nested
SELECT
	s.id as surveyId,
	s.name as surveyName,
	u.id as userId,
	u.name as userName
FROM surveys s
INNER JOIN participants p on p.fk_survey = s.id
INNER JOIN users u on u.id = p.fk_user`;
        const schemaResult = (0, query_executor_1.loadDbSchema)(db);
        if (schemaResult.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${schemaResult.error.description}`);
        }
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'nested03', schemaResult.value, 'libsql', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/nested03-libsql-many-to-many.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('nested03-bun - many to many', () => {
        const sql = `-- @nested
SELECT
	s.id as surveyId,
	s.name as surveyName,
	u.id as userId,
	u.name as userName
FROM surveys s
INNER JOIN participants p on p.fk_survey = s.id
INNER JOIN users u on u.id = p.fk_user`;
        const schemaResult = (0, query_executor_1.loadDbSchema)(db);
        if (schemaResult.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${schemaResult.error.description}`);
        }
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'nested03', schemaResult.value, 'bun:sqlite', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/nested03-bun-many-to-many.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-01', () => {
        const sql = `-- @dynamicQuery
SELECT m1.id, m1.value, m2.name, m2.descr as description
FROM mytable1 m1
INNER JOIN mytable2 m2 on m1.id = m2.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query-01', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query01.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-01-libsql', () => {
        const sql = `-- @dynamicQuery
SELECT m1.id, m1.value, m2.name, m2.descr as description
FROM mytable1 m1
INNER JOIN mytable2 m2 on m1.id = m2.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query-01', create_schema_1.sqliteDbSchema, 'libsql', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query01-libsql.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-01-bun', () => {
        const sql = `-- @dynamicQuery
SELECT m1.id, m1.value, m2.name, m2.descr as description
FROM mytable1 m1
INNER JOIN mytable2 m2 on m1.id = m2.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query-01', create_schema_1.sqliteDbSchema, 'bun:sqlite', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query01-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-01-d1', () => {
        const sql = `-- @dynamicQuery
SELECT m1.id, m1.value, m2.name, m2.descr as description
FROM mytable1 m1
INNER JOIN mytable2 m2 on m1.id = m2.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query-01', create_schema_1.sqliteDbSchema, 'd1', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query01-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-02', () => {
        const sql = `-- @dynamicQuery
SELECT m1.id, m2.name
FROM mytable1 m1
INNER JOIN ( -- derivated table
	SELECT id, name from mytable2 m 
	WHERE m.name = :subqueryName
) m2 on m2.id = m1.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'derivated-table', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query02.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-02-bun', () => {
        const sql = `-- @dynamicQuery
SELECT m1.id, m2.name
FROM mytable1 m1
INNER JOIN ( -- derivated table
	SELECT id, name from mytable2 m 
	WHERE m.name = :subqueryName
) m2 on m2.id = m1.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'derivated-table', create_schema_1.sqliteDbSchema, 'bun:sqlite', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query02-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-02-d1', () => {
        const sql = `-- @dynamicQuery
SELECT m1.id, m2.name
FROM mytable1 m1
INNER JOIN ( -- derivated table
	SELECT id, name from mytable2 m 
	WHERE m.name = :subqueryName
) m2 on m2.id = m1.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query02', create_schema_1.sqliteDbSchema, 'd1', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query02-d1.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-03', () => {
        const sql = `-- @dynamicQuery
SELECT t1.id, t1.value
FROM mytable1 t1`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query03', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query03.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-03-bun', () => {
        const sql = `-- @dynamicQuery
SELECT t1.id, t1.value
FROM mytable1 t1`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query03', create_schema_1.sqliteDbSchema, 'bun:sqlite', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query03-bun.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-04', () => {
        const sql = `-- @dynamicQuery
SELECT 
    *
FROM mytable1 m1
INNER JOIN mytable2 m2 on m2.id = m1.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query04', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query04.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-05', () => {
        const sql = `-- @dynamicQuery
WITH 
cte as (
	select id, name from mytable2
)
SELECT 
	m1.id,
	m2.name
FROM mytable1 m1
INNER JOIN cte m2 on m2.id = m1.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'cte', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query05.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-06', () => {
        const sql = `-- @dynamicQuery
SELECT 
    *
FROM mytable1 m1
INNER JOIN mytable2 m2 on m2.id = m1.id
ORDER BY ?`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query06', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query06.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-07', () => {
        const sql = `-- @dynamicQuery
SELECT 
    m1.id as myId,
    m2.name
FROM mytable1 m1
INNER JOIN mytable2 m2 on m2.id = m1.id
ORDER BY ?`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query07', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query07.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-08 - date', () => {
        const sql = `-- @dynamicQuery
SELECT 
	text_column, 
	date(text_column) as date, 
	datetime(text_column) as date_time 
FROM all_types 
WHERE date(text_column) = :param1 AND datetime(text_column) = :param2`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query08', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query08-date.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-09 - params on select', () => {
        const sql = `-- @dynamicQuery
SELECT 
	t2.id, 
	t3.double_value, 
	:name is null OR concat('%', t2.name, t3.name, '%') LIKE :name as likeName
FROM mytable2 t2
INNER JOIN mytable3 t3 on t3.id = t2.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query09', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query09-params-on-select.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-10 - limit offset', () => {
        const sql = `-- @dynamicQuery
SELECT 
	t1.id, 
	t2.name
FROM mytable1 t1
INNER JOIN mytable2 t2 on t2.id = t1.id
WHERE name = :name
LIMIT :limit OFFSET :offset`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query10', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query10-limit-offset.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-11-multiple-CTEs', () => {
        const sql = `-- @dynamicQuery
WITH 
	cte1 as (
		select id, value from mytable1
		WHERE max(value, :param1) = min(value, :param1)
	),
	cte2 as (
		select id, name from mytable2
		WHERE max(name, :param2) = min(name, :param2)
	)
SELECT 
	c1.id,
	c2.name
FROM cte1 c1
INNER JOIN cte2 c2 on c1.id = c2.id`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query11', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query11.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-12-multiple-CTEs-with-where', () => {
        const sql = `-- @dynamicQuery
WITH 
	cte1 as (
		select id, value from mytable1
		WHERE max(date(value, 'auto'), :param1) = min(date(value, 'auto'), :param1)
	),
	cte2 as (
		select id, name from mytable2
		WHERE max(name, :param2) = min(name, :param2)
	)
SELECT 
	c1.id,
	c2.name
FROM cte1 c1
INNER JOIN cte2 c2 on c1.id = c2.id
WHERE max(c1.id, :param3) = min(c2.id, :param3)`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query12', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query12.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('dynamic-query-13-enum', () => {
        const sql = `-- @dynamicQuery
SELECT
    enum_column
FROM all_types`;
        const isCrud = false;
        const actual = (0, sqlite_1.generateTsCode)(sql, 'dynamic-query13', create_schema_1.sqliteDbSchema, 'better-sqlite3', isCrud);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/sqlite/expected-code/dynamic-query13-enum.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
});
//# sourceMappingURL=sqlite-code-generator.test.js.map