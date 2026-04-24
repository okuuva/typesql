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
describe('sqlite-parse-insert', () => {
    it('insert into mytable1 (value) values (?)', () => {
        const sql = 'insert into mytable1 (value) values (?)';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql: 'insert into mytable1 (value) values (?)',
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('insert into mytable1 (id, value) values (:id, :value)', () => {
        const sql = 'insert into mytable1 (id, value) values (:id, :value)';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql: 'insert into mytable1 (id, value) values (?, ?)',
            columns: [],
            parameters: [
                {
                    name: 'id',
                    columnType: 'INTEGER',
                    notNull: false //autoincrement
                },
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    //Not valid syntax
    it('insert into mydb.mytable1 (value) values (?)', () => {
        const sql = `
        insert into mydb.mytable1 (value) values (?)
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = [
            {
                name: 'param1',
                columnType: 'INTEGER',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    });
    it('insert into mytable3 (name, double_value) values (?, ?)', () => {
        const sql = `
        insert into mytable3 (name, double_value) values (?, ?)
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = [
            {
                name: 'param1',
                columnType: 'TEXT',
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'REAL',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    });
    it('insert into mytable3 (double_value, name) values (?, ?)', () => {
        const sql = `
        insert into mytable3 (double_value, name) values (?, ?)
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = [
            {
                name: 'param1',
                columnType: 'REAL',
                notNull: false
            },
            {
                name: 'param2',
                columnType: 'TEXT',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    });
    it('insert into mytable3 (name, double_value) values (:fullname, :value)', () => {
        const sql = `
        insert into mytable3 (name, double_value) values (:fullname, :value)
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = [
            {
                name: 'fullname',
                columnType: 'TEXT',
                notNull: true
            },
            {
                name: 'value',
                columnType: 'REAL',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    });
    it('insert same parameter into two fields', () => {
        const sql = `
        insert into mytable2 (name, descr) values (:name, :name)
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = [
            {
                name: 'name',
                columnType: 'TEXT',
                notNull: false
            },
            {
                name: 'name',
                columnType: 'TEXT',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    });
    //not supported
    // it('insert into mytable1 (id) values (IFNULL(:id, id))', () => {
    //     const sql = `
    //     insert into mytable1 (id) values (IFNULL(:id, id))
    //         `;
    //     const actual = parseSql(sql, sqliteDbSchema);
    //     const expected: ParameterDef[] = [
    //         {
    //             name: 'id',
    //             columnType: 'int',
    //             notNull: false
    //         }
    //     ]
    //     if (isLeft(actual)) {
    //         assert.fail(`Shouldn't return an error: ${actual.left.description}`);
    //     }
    //     assert.deepStrictEqual(actual.right.parameters, expected);
    // })
    it('insert into mytable1 (id) values (IFNULL(:id, :id2))', () => {
        const sql = `
        insert into mytable1 (id) values (IFNULL(:id, :id2))
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = [
            {
                name: 'id',
                columnType: 'INTEGER',
                notNull: false
            },
            {
                name: 'id2',
                columnType: 'INTEGER',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    });
    // it('insert with inexistent columns names', async () => {
    //     const sql = `
    //     insert into mytable1 (name) values (?)
    //         `;
    //     const actual = await parseSql(client, sql);
    //     if (isRight(actual)) {
    //         assert.fail(`Should return an error`);
    //     }
    //     const expectedError = `Unknown column 'name' in 'field list'`;
    //     assert.deepStrictEqual(actual.left.description, expectedError);
    // })
    it('insert into all_types (int_column) values (?+?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into all_types (int_column) values (?+?)';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'insert into all_types (int_column) values (?+?)',
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
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
    }));
    it('insert into all_types (real_column) values (?+?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into all_types (real_column) values (?+?)';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'insert into all_types (real_column) values (?+?)',
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'REAL',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'REAL',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('ON DUPLICATE KEY UPDATE name = ?', () => {
        //
        const sql = `
        INSERT INTO mytable2 (id, name)
        VALUES (?, ?)
        ON CONFLICT(id) DO
        UPDATE SET name = ?`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: false //autoincrement
                },
                {
                    name: 'param2',
                    columnType: 'TEXT',
                    notNull: false
                },
                {
                    name: 'param3',
                    columnType: 'TEXT',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('ON DUPLICATE KEY UPDATE name = excluded.name', () => {
        const sql = `
        INSERT INTO mytable2 (id, name)
        VALUES (?, ?)
        ON CONFLICT(id) DO
        UPDATE SET name = excluded.name`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: false //autoincrement
                },
                {
                    name: 'param2',
                    columnType: 'TEXT',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('ON DUPLICATE KEY UPDATE name = concat(?, ?)', () => {
        const sql = `
        INSERT INTO mytable2 (id, name)
        VALUES (?, ?)
        ON CONFLICT(id) DO
        UPDATE name = concat(?, ?)`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: false //autoincrement
                },
                {
                    name: 'param2',
                    columnType: 'TEXT',
                    notNull: false
                },
                {
                    name: 'param3',
                    columnType: 'TEXT',
                    notNull: true
                },
                {
                    name: 'param4',
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
    it(`ON DUPLICATE KEY UPDATE name = concat(?, 'a', ?)`, () => {
        const sql = `
        INSERT INTO mytable2 (id, name)
        VALUES (?, concat(?, '-a'))
        ON CONFLICT (id) DO
        UPDATE name = concat(?, 'a', ?)`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: false //autoincrement
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
    it(`ON DUPLICATE KEY UPDATE name = name = IF(? != '', ?, name)`, () => {
        const sql = `
        INSERT INTO mytable2 (id, name)
        VALUES (?, ?)
        ON CONFLICT(id) DO
        UPDATE name = IIF(? != '', ?, name)`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: false //autoincrement
                },
                {
                    name: 'param2',
                    columnType: 'TEXT',
                    notNull: false
                },
                {
                    name: 'param3',
                    columnType: 'TEXT',
                    notNull: true //diff from mysql
                },
                {
                    name: 'param4',
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
    it('UPSERT with :ts reused across VALUES and DO UPDATE (issue #118 repro)', () => {
        const sql = `
        INSERT INTO mytable2 (id, name, descr)
        VALUES (:id, :name, :descr)
        ON CONFLICT(id) DO UPDATE SET name = COALESCE(:name, name), descr = :descr`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        // 5 `?` placeholders: :id, :name, :descr in VALUES + :name, :descr in upsert.
        // Before fix: parameters length was 6 with a synthetic `param6` at index 5.
        node_assert_1.default.strictEqual(actual.right.parameters.length, 5);
        const names = actual.right.parameters.map((p) => p.name);
        node_assert_1.default.deepStrictEqual(names, ['id', 'name', 'descr', 'name', 'descr']);
        for (const p of actual.right.parameters) {
            node_assert_1.default.ok(!/^param\d+$/.test(p.name), `synthetic param leaked: ${p.name}`);
        }
    });
    it('UPSERT with two reused named params (direct assign)', () => {
        const sql = `
        INSERT INTO mytable2 (id, name, descr)
        VALUES (:id, :name, :descr)
        ON CONFLICT(id) DO UPDATE SET name = :name, descr = :descr`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.strictEqual(actual.right.parameters.length, 5);
        node_assert_1.default.deepStrictEqual(actual.right.parameters.map((p) => p.name), ['id', 'name', 'descr', 'name', 'descr']);
    });
    it('UPSERT with fresh named params not in VALUES', () => {
        const sql = `
        INSERT INTO mytable2 (id, name, descr)
        VALUES (:id, :name, :descr)
        ON CONFLICT(id) DO UPDATE SET name = :newname, descr = :newdescr`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.strictEqual(actual.right.parameters.length, 5);
        node_assert_1.default.deepStrictEqual(actual.right.parameters.map((p) => p.name), ['id', 'name', 'descr', 'newname', 'newdescr']);
        for (const p of actual.right.parameters) {
            node_assert_1.default.ok(!/^param\d+$/.test(p.name), `synthetic param leaked: ${p.name}`);
        }
    });
    it('INSERT INTO mytable2 (id, name) SELECT ?, ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        INSERT INTO mytable2 (id, name)
        SELECT ?, ?`;
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: false
                },
                {
                    name: 'param2',
                    columnType: 'TEXT',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('INSERT INTO mytable2 (id, name) SELECT id, descr FROM mytable2 WHERE name = ? AND id > ?', () => {
        const sql = `
        INSERT INTO mytable2 (id, name)
        SELECT id, descr
        FROM mytable2 WHERE name = ? AND id > ?`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'TEXT',
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
    it('insert into all_types (varchar_column, int_column) values (concat(?, ?), ?+?)', () => {
        const sql = 'insert into all_types (varchar_column, int_column) values (concat(?, ?), ?+?)';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'insert into all_types (varchar_column, int_column) values (concat(?, ?), ?+?)',
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'TEXT',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'TEXT',
                    notNull: true
                },
                {
                    name: 'param3',
                    columnType: 'INTEGER',
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
    it('INSERT INTO mytable3 (double_value, name) VALUES (?, ?), (?, ?), (?, ?)', () => {
        const sql = `
        INSERT INTO mytable3 (double_value, name)
        VALUES (?, ?), (?, ?), (?, ?)`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'REAL',
                    notNull: false
                },
                {
                    name: 'param2',
                    columnType: 'TEXT',
                    notNull: true
                },
                {
                    name: 'param3',
                    columnType: 'REAL',
                    notNull: false
                },
                {
                    name: 'param4',
                    columnType: 'TEXT',
                    notNull: true
                },
                {
                    name: 'param5',
                    columnType: 'REAL',
                    notNull: false
                },
                {
                    name: 'param6',
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
    it(`INSERT INTO mytable3 (double_value, name) VALUES (?, ?), (10.5, ?), (?, 'name')`, () => {
        const sql = `
        INSERT INTO mytable3 (double_value, name)
        VALUES (:value1, :name1), (10.5, :name2), (:value2, 'name')`;
        const expectedSql = `
        INSERT INTO mytable3 (double_value, name)
        VALUES (?, ?), (10.5, ?), (?, 'name')`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'value1',
                    columnType: 'REAL',
                    notNull: false
                },
                {
                    name: 'name1',
                    columnType: 'TEXT',
                    notNull: true
                },
                {
                    name: 'name2',
                    columnType: 'TEXT',
                    notNull: true
                },
                {
                    name: 'value2',
                    columnType: 'REAL',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('INSERT INTO mytable1 (value) RETURNING *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1 (value) VALUES (:value) RETURNING *';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'INSERT INTO mytable1 (value) VALUES (?) RETURNING *',
            queryType: 'Insert',
            multipleRowsResult: false,
            returning: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('INSERT INTO mytable1 (value) RETURNING id, id+id, value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1 (value) VALUES (:value) RETURNING id, id+id, value';
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'INSERT INTO mytable1 (value) VALUES (?) RETURNING id, id+id, value',
            queryType: 'Insert',
            multipleRowsResult: false,
            returning: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'id+id',
                    type: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert into all_types (blob_column) values (vector(?))', () => {
        const sql = 'insert into all_types (blob_column) values (vector(?))';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql,
            columns: [],
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
    //TODO - nullability test
    it('insert into all_types (integer_column) values (unixepoch(current_timestamp) + :seconds)', () => {
        const sql = 'insert into all_types (integer_column) values (unixepoch(current_timestamp) + :seconds)';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql: 'insert into all_types (integer_column) values (unixepoch(current_timestamp) + ?)',
            columns: [],
            parameters: [
                {
                    name: 'seconds',
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
    it('insert into all_types (integer_column) values (unixepoch(current_timestamp) + ?)', () => {
        const sql = 'insert into all_types (integer_column) values (unixepoch(current_timestamp) + ?)';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql,
            columns: [],
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
    it('insert into all_types (integer_column) values (unixepoch(current_timestamp) * ?)', () => {
        const sql = 'insert into all_types (integer_column) values (unixepoch(current_timestamp) * ?)';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql,
            columns: [],
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
});
//# sourceMappingURL=parse-insert.test.js.map