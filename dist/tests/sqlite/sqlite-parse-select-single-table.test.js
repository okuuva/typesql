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
const Either_1 = require("fp-ts/lib/Either");
const parser_1 = require("../../src/sqlite-query-analyzer/parser");
const create_schema_1 = require("../mysql-query-analyzer/create-schema");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const sqlite_1 = require("../../src/codegen/sqlite");
const query_executor_1 = require("../../src/sqlite-query-analyzer/query-executor");
describe('sqlite-Test simple select statements', () => {
    it('try to parse a empty query', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = {
            type: 'better-sqlite3',
            client: new better_sqlite3_1.default('./mydb.db')
        };
        const sql = '';
        const actual = (0, sqlite_1.validateAndGenerateCode)(client, sql, 'queryName', create_schema_1.sqliteDbSchema);
        const expected = 'Invalid sql';
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.deepStrictEqual(actual.left.name, expected);
        }
        else {
            node_assert_1.default.fail('should return an InvalidSqlError');
        }
    }));
    it('try to parse a empty query', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = {
            type: 'better-sqlite3',
            client: new better_sqlite3_1.default('./mydb.db')
        };
        const sql = 'SELECT id2 from mytable1';
        const actual = (0, sqlite_1.validateAndGenerateCode)(client, sql, 'queryName', create_schema_1.sqliteDbSchema);
        const expected = {
            name: 'Invalid sql',
            description: 'no such column: id2'
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.deepStrictEqual(actual.left, expected);
        }
        else {
            node_assert_1.default.fail('should return an InvalidSqlError');
        }
    }));
    it('SELECT id FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT id as name FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id as name FROM mytable1';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT id as "customQuotedName" FROM mytable1 - quoted alias', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id as "customQuotedName" FROM mytable1';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'customQuotedName',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT * FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM mytable1';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT mytable1.* FROM mytable1', () => {
        const sql = 'SELECT mytable1.* FROM mytable1';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT t.* FROM mytable1 t', () => {
        const sql = 'SELECT t.* FROM mytable1 t';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT mytable1.id, mytable1.value FROM mytable1', () => {
        const sql = 'SELECT mytable1.id, mytable1.value FROM mytable1';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT id, name, descr as description FROM mytable2', () => {
        const sql = 'SELECT id, name, descr as description FROM mytable2';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable2'
                },
                {
                    name: 'name',
                    type: 'TEXT',
                    notNull: false,
                    table: 'mytable2'
                },
                {
                    name: 'description',
                    type: 'TEXT',
                    notNull: false,
                    table: 'mytable2'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT distinct id, value FROM mytable1', () => {
        const sql = 'SELECT distinct id, value FROM mytable1';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('parse select distinct *', () => {
        const sql = 'SELECT distinct * FROM mytable1';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT id FROM main.mytable1', () => {
        const sql = 'SELECT id FROM main.mytable1';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT * FROM mytable1 WHERE id = ?', () => {
        const sql = 'SELECT * FROM mytable1 WHERE id = ?';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('parse a select with a single parameter (not using *)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 WHERE id = ? and value = 10';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false, //changed at v.0.3.0
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT value FROM mytable1 WHERE id = ? or value > ?', () => {
        const sql = 'SELECT value FROM mytable1 WHERE id = ? or value > ?';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT ? FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT ? FROM mytable1';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: '?', //TODO - PARAM1
                    type: 'any',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'any',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT id FROM mytable1 where value between :start and :end', () => {
        const sql = 'SELECT id FROM mytable1 where value between :start and :end';
        const expectedSql = 'SELECT id FROM mytable1 where value between ? and ?';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'start',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'end',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT id FROM mytable1 where id = 0 and value between :start and :end', () => {
        //todo - new
        const sql = 'SELECT id FROM mytable1 where id = 0 and value between :start and :end';
        const expectedSql = 'SELECT id FROM mytable1 where id = 0 and value between ? and ?';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'start',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'end',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT ? as name FROM mytable1', () => {
        const sql = 'SELECT ? as name FROM mytable1';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'any',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'any',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('parse a select with multiples params', () => {
        const sql = `
        SELECT ? as name, id, descr as description
        FROM mytable2 
        WHERE (name = ? or descr = ?) and id > ?
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'any',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable2'
                },
                {
                    name: 'description',
                    type: 'TEXT',
                    notNull: false,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'any',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'TEXT',
                    notNull: true
                },
                {
                    name: 'param3',
                    columnType: 'TEXT',
                    notNull: true
                },
                {
                    name: 'param4',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT t.* FROM mytable1 t WHERE t.id = ?', () => {
        const sql = `
        SELECT t.* FROM mytable1 t WHERE t.id = ?
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false, //changed at v0.3.0
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT * FROM mytable1 WHERE id in (1, 2, 3)', () => {
        const sql = `
        SELECT * FROM mytable1 WHERE id in (1, 2, 3)
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT * FROM mytable1 WHERE id not in (1, 2, 3)', () => {
        const sql = `
        SELECT * FROM mytable1 WHERE id not in (1, 2, 3)
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT t.* FROM mytable1 t WHERE t.id in (1, 2, 3)', () => {
        const sql = `
        SELECT t.* FROM mytable1 t WHERE t.id in (1, 2, 3)
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT * FROM mytable1 t WHERE id in (1, 2, 3, ?)', () => {
        const sql = 'SELECT * FROM mytable1 t WHERE id in (1, 2, 3, ?)';
        const expectedSql = `SELECT * FROM mytable1 t WHERE id in (1, 2, 3, \${params.param1.map(() => '?')})`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER[]',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT * FROM mytable1 t WHERE id not in (1, 2, 3, ?)', () => {
        const sql = 'SELECT * FROM mytable1 t WHERE id not in (1, 2, 3, ?)';
        const expectedSql = `SELECT * FROM mytable1 t WHERE id not in (1, 2, 3, \${params.param1.map(() => '?')})`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER[]',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT * FROM mytable1 t WHERE :value is null OR id IN (:ids)', () => {
        const sql = 'SELECT * FROM mytable1 t WHERE :value is null OR id IN (:ids)';
        const expectedSql = `SELECT * FROM mytable1 t WHERE ? is null OR id IN (\${params.ids.map(() => '?')})`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'value',
                    columnType: 'any',
                    notNull: false
                },
                {
                    name: 'ids',
                    columnType: 'INTEGER[]',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT * FROM mytable1 t WHERE (:value is null OR id IN (:ids)) OR (:value2 is null OR value in (:values))', () => {
        const sql = 'SELECT * FROM mytable1 t WHERE (:value is null OR id IN (:ids)) OR (:value2 is null OR value IN (:values))';
        const expectedSql = `SELECT * FROM mytable1 t WHERE (? is null OR id IN (\${params.ids.map(() => '?')})) OR (? is null OR value IN (\${params.values.map(() => '?')}))`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'value',
                    columnType: 'any',
                    notNull: false
                },
                {
                    name: 'ids',
                    columnType: 'INTEGER[]',
                    notNull: true
                },
                {
                    name: 'value2',
                    columnType: 'any',
                    notNull: false
                },
                {
                    name: 'values',
                    columnType: 'INTEGER[]',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT id FROM mytable1 t WHERE id in (select id from mytable2 where id > :id)', () => {
        const sql = 'SELECT id FROM mytable1 t WHERE id in (select id from mytable2 where id > :id)';
        const expectedSql = 'SELECT id FROM mytable1 t WHERE id in (select id from mytable2 where id > ?)';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'id',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT id FROM mytable1 t WHERE id not in (select id from mytable2 where id > :id)', () => {
        const sql = 'SELECT id FROM mytable1 t WHERE id not in (select id from mytable2 where id > :id)';
        const expectedSql = 'SELECT id FROM mytable1 t WHERE id not in (select id from mytable2 where id > ?)';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'id',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT * FROM mytable1 t WHERE ? in (1, 2, 3)', () => {
        const sql = `
        SELECT id FROM mytable1 t WHERE ? in (1, 2, 3)
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it(`SELECT * FROM mytable1 t WHERE ? in ('a', 'b', 'c')`, () => {
        const sql = `
        SELECT id FROM mytable1 t WHERE ? in ('a', 'b', 'c')
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'TEXT',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT * FROM mytable1 WHERE id = (select id from mytable2 where id = ?)', () => {
        const sql = `
        SELECT * FROM mytable1 WHERE id = (select id from mytable2 where id = ?)
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false, //changed at v0.3.0
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select t1.id > 1 AS bigger from mytable1 t1', () => {
        const sql = `
        select t1.id > 1 AS bigger from mytable1 t1
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'bigger',
                    type: 'INTEGER', //changed at v0.0.2
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it(`select t2.name > 'a' AS bigger from mytable2 t2`, () => {
        const sql = `
        select t2.name > 'a' AS bigger from mytable2 t2
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'bigger',
                    type: 'INTEGER',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select id from mytable2 where name like ?', () => {
        const sql = `
        select id from mytable2 where name like ?
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'TEXT',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select id from mytable2 where ? like name', () => {
        const sql = `
        select id from mytable2 where ? like name
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'TEXT',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT mytable1.* FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT mytable1.* FROM mytable1';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('parse a select with in operator', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1 WHERE id in (1, 2, 3)
        `;
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select id from mytable2 where name GLOB ?', () => {
        const sql = `
        select id from mytable2 where name GLOB ?
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'TEXT',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('parse select with CASE WHEN', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT 
            CASE 
                WHEN id = 1 THEN 'one'
                WHEN id = 2 THEN 'two'
            END as id
        FROM mytable1
        `;
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'TEXT',
                    notNull: false, //not null can't be inferred
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('parse select with CASE WHEN ... ELSE', () => {
        const sql = `
        SELECT
            CASE
                WHEN id = 1 THEN 'one'
                WHEN id = 2 THEN 'two'
                ELSE 'other'
            END as id
        FROM mytable1
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'TEXT',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('parse select with CASE WHEN using IN operator', () => {
        const sql = `
        select id from mytable2 where ? in (
            SELECT
                CASE
                    WHEN id = 1 THEN 'one'
                    WHEN id = 2 THEN 'two'
                END
            FROM mytable1
        )
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'TEXT',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT SUM(ID) as sumById FROM mytable1 t1 GROUP BY id', () => {
        const sql = `
        SELECT SUM(ID) as sumById
        FROM mytable1 t1
        GROUP BY id
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'sumById',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT id as id2, SUM(ID) as sumById FROM mytable1 t1 GROUP BY id2', () => {
        const sql = `
        SELECT id as id2, SUM(ID) as sumById
        FROM mytable1 t1
        GROUP BY id2;
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id2',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'sumById',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT SUM(real_column) as sumById FROM all_types t1 GROUP BY int_column', () => {
        const sql = `
        SELECT SUM(real_column) as sumById
        FROM all_types t1
        GROUP BY int_column
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'sumById',
                    type: 'REAL',
                    notNull: false,
                    table: 't1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select value from mytable1 where value is not null', () => {
        const sql = `
        select value from mytable1 where value is not null or (id > 0 and value is not null) 
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select id from mytable1 where 1 = 1', () => {
        const sql = `
        select id from mytable1 where 1 = 1
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it(`select enum_column from all_types where enum_column = 'medium' or 'short' = enum_column`, () => {
        const sql = `
        select enum_column from all_types where enum_column = 'medium' or 'short' = enum_column
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'enum_column',
                    type: `ENUM('x-small','small','medium','large','x-large')`,
                    notNull: true,
                    table: 'all_types'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ` + actual.left.description);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select value from mytable1 order by ?', () => {
        const sql = `
        select value from mytable1 order by ?
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            orderByColumns: ['id', 'mytable1.id', 'value', 'mytable1.value'],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select value as myValue from mytable1 order by ?', () => {
        const sql = `
        select value as myValue from mytable1 order by ?
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'myValue',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            orderByColumns: ['id', 'mytable1.id', 'value', 'mytable1.value', 'myValue'],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select value from mytable1 order by value', () => {
        const sql = `
        select value from mytable1 order by value
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            //shouldn't include order by columns because there is no parameters on the order by clause
            //orderByColumns: ['id', 'value'],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('order by with case when expression', () => {
        const sql = `
        select value, case when value = 1 then 1 else 2 end as ordering from mytable1 order by ?
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                },
                {
                    name: 'ordering',
                    type: 'INTEGER',
                    notNull: true,
                    table: ''
                }
            ],
            orderByColumns: ['id', 'mytable1.id', 'value', 'mytable1.value', 'ordering'],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('order by with case when expression2', () => {
        const sql = `
            select 
            id, 
            case when name = 'a' then 1 else 0 end as sort
        from mytable2 t2
        order by sort asc
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't2'
                },
                {
                    name: 'sort',
                    type: 'INTEGER',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('order by with subselect', () => {
        const sql = `
        select value from (
        select id, value, case when value = 1 then 1 else 2 end as ordering from mytable1
        ) t order by ?
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't'
                }
            ],
            orderByColumns: ['id', 't.id', 'value', 't.value', 'ordering'],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select with order by function', () => {
        const sql = `
        select name from mytable2 order by concat(name, ?)
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'TEXT',
                    notNull: false,
                    table: 'mytable2'
                }
            ],
            //shouldn't include order by columns because there is no parameters on the order by clause
            //orderByColumns: ['id', 'value'],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'TEXT',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('remove the ordering column from select', () => {
        const sql = `
        select value from (
        select id, value, case when value = 1 then 1 else 2 end from mytable1
        ) t order by ?
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't'
                }
            ],
            orderByColumns: ['id', 't.id', 'value', 't.value', 'case when value = 1 then 1 else 2 end'],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('SELECT id FROM mytable1 LIMIT ?, ?', () => {
        const sql = 'SELECT id FROM mytable1 LIMIT ?, ?';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    //fix: was getting type from year function instead of column
    it('SELECT year FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT year FROM mytable4';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'year',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable4'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('attach - select * from users.users', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM users.users';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'users'
                },
                {
                    name: 'username',
                    type: 'TEXT',
                    notNull: true,
                    table: 'users'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('attach - select * from users', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM users';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'users'
                },
                {
                    name: 'name',
                    type: 'TEXT',
                    notNull: true,
                    table: 'users'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT vector_extract(blob_column) as vector, vector(:vector), vector_distance_cos(blob_column, :vector) FROM all_types', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT vector_extract(blob_column) as vector, 
        vector(:vector) as embedded, 
        vector_distance_cos(blob_column, :vector) as vector_distance_cos
        FROM all_types`;
        const expectedSql = `
        SELECT vector_extract(blob_column) as vector, 
        vector(?) as embedded, 
        vector_distance_cos(blob_column, ?) as vector_distance_cos
        FROM all_types`;
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'vector',
                    type: 'TEXT',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'embedded',
                    type: 'BLOB',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'vector_distance_cos',
                    type: 'REAL',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'vector',
                    columnType: 'TEXT',
                    notNull: true
                },
                {
                    name: 'vector',
                    columnType: 'TEXT',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT 1 + 1 as col_alias WHERE col_alias > 0', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT 1 + 1 as col_alias WHERE col_alias > 0';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'col_alias',
                    type: 'INTEGER',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT "id", "mytable1"."value" from "mytable1" where "mytable1"."id" = 0', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT "id", "mytable1"."value" from "mytable1" where "mytable1"."id" = 0;';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('multipleRowsResult for table with composite key', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = new better_sqlite3_1.default('./mydb.db');
        const dbSchemaResult = (0, query_executor_1.loadDbSchema)(db);
        if (dbSchemaResult.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const sql = 'select * from playlist_track where PlaylistId = 1';
        const actual = yield (0, parser_1.parseSql)(sql, dbSchemaResult.value);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'PlaylistId',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'playlist_track'
                },
                {
                    name: 'TrackId',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'playlist_track'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('multipleRowsResult for table with composite key (all keys)', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = new better_sqlite3_1.default('./mydb.db');
        const dbSchemaResult = (0, query_executor_1.loadDbSchema)(db);
        if (dbSchemaResult.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const sql = 'select * from playlist_track where PlaylistId = 1 and TrackId = 1';
        const actual = yield (0, parser_1.parseSql)(sql, dbSchemaResult.value);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'PlaylistId',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'playlist_track'
                },
                {
                    name: 'TrackId',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'playlist_track'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('multipleRowsResult for table with composite key (all keys, with OR)', () => __awaiter(void 0, void 0, void 0, function* () {
        const db = new better_sqlite3_1.default('./mydb.db');
        const dbSchemaResult = (0, query_executor_1.loadDbSchema)(db);
        if (dbSchemaResult.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const sql = 'select * from playlist_track where PlaylistId = 1 OR TrackId = 1';
        const actual = yield (0, parser_1.parseSql)(sql, dbSchemaResult.value);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'PlaylistId',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'playlist_track'
                },
                {
                    name: 'TrackId',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'playlist_track'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
});
//# sourceMappingURL=sqlite-parse-select-single-table.test.js.map