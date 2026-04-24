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
const describe_query_1 = require("../src/describe-query");
const queryExectutor_1 = require("../src/queryExectutor");
const Either_1 = require("fp-ts/lib/Either");
describe('parse insert statements', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    it('insert into mytable1 (value) values (?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into mytable1 (value) values (?)';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql: 'insert into mytable1 (value) values (?)',
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'insertId',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert into mydb.mytable1 (value) values (?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        insert into mydb.mytable1 (value) values (?)
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('insert into mytable3 (name, double_value) values (?, ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        insert into mytable3 (name, double_value) values (?, ?)
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'varchar',
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'double',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('insert into mytable3 (double_value, name) values (?, ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        insert into mytable3 (double_value, name) values (?, ?)
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'double',
                notNull: false
            },
            {
                name: 'param2',
                columnType: 'varchar',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('insert into mytable3 (name, double_value) values (:fullname, :value)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        insert into mytable3 (name, double_value) values (:fullname, :value)
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'fullname',
                columnType: 'varchar',
                notNull: true
            },
            {
                name: 'value',
                columnType: 'double',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('insert same parameter into two fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        insert into mytable2 (name, descr) values (:name, :name)
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'name',
                columnType: 'varchar',
                notNull: false
            },
            {
                name: 'name',
                columnType: 'varchar',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('insert into mytable1 (id) values (IFNULL(:id, id))', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        insert into mytable1 (id) values (IFNULL(:id, id))
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'id',
                columnType: 'int',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('insert into mytable1 (id) values (IFNULL(:id, :id2))', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        insert into mytable1 (id) values (IFNULL(:id, :id2))
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'id',
                columnType: 'int',
                notNull: false
            },
            {
                name: 'id2',
                columnType: 'int',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('insert with inexistent columns names', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        insert into mytable1 (name) values (?)
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isRight)(actual)) {
            node_assert_1.default.fail('Should return an error');
        }
        const expectedError = `Unknown column 'name' in 'field list'`;
        node_assert_1.default.deepStrictEqual(actual.left.description, expectedError);
    }));
    it('insert into all_types (int_column) values (?+?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into all_types (int_column) values (?+?)';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: 'insert into all_types (int_column) values (?+?)',
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'insertId',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: false
                },
                {
                    name: 'param2',
                    columnType: 'int',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('ON DUPLICATE KEY UPDATE name = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        INSERT INTO mytable2 (id, name)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
        name = ?`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'insertId',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'varchar',
                    notNull: false
                },
                {
                    name: 'param3',
                    columnType: 'varchar',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('ON DUPLICATE KEY UPDATE name = concat(?, ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        INSERT INTO mytable2 (id, name)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
        name = concat(?, ?)`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'insertId',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'varchar',
                    notNull: false
                },
                {
                    name: 'param3',
                    columnType: 'varchar',
                    notNull: false
                },
                {
                    name: 'param4',
                    columnType: 'varchar',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it(`ON DUPLICATE KEY UPDATE name = concat(?, 'a', ?)`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        INSERT INTO mytable2 (id, name)
        VALUES (?, concat(?, '-a'))
        ON DUPLICATE KEY UPDATE
        name = concat(?, 'a', ?)`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'insertId',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'varchar',
                    notNull: false
                },
                {
                    name: 'param3',
                    columnType: 'varchar',
                    notNull: false
                },
                {
                    name: 'param4',
                    columnType: 'varchar',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it(`ON DUPLICATE KEY UPDATE name = name = IF(? != '', ?, name)`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        INSERT INTO mytable2 (id, name)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
        name = IF(? != '', ?, name)`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'insertId',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'varchar',
                    notNull: false
                },
                {
                    name: 'param3',
                    columnType: 'varchar',
                    notNull: false
                },
                {
                    name: 'param4',
                    columnType: 'varchar',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('INSERT INTO mytable2 (id, name) SELECT ?, ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        INSERT INTO mytable2 (id, name)
        SELECT ?, ?`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'insertId',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'varchar',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('INSERT INTO mytable2 (id, name) SELECT id, descr FROM mytable2 WHERE name = ? AND id > ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        INSERT INTO mytable2 (id, name)
        SELECT id, descr
        FROM mytable2 WHERE name = ? AND id > ?`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'insertId',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'varchar',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'int',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('insert into all_types (varchar_column, int_column) values (concat(?, ?), ?+?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into all_types (varchar_column, int_column) values (concat(?, ?), ?+?)';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: 'insert into all_types (varchar_column, int_column) values (concat(?, ?), ?+?)',
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'insertId',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'varchar',
                    notNull: false
                },
                {
                    name: 'param2',
                    columnType: 'varchar',
                    notNull: false
                },
                {
                    name: 'param3',
                    columnType: 'int',
                    notNull: false
                },
                {
                    name: 'param4',
                    columnType: 'int',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('INSERT INTO mytable3 (double_value, name) VALUES (?, ?), (?, ?), (?, ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        INSERT INTO mytable3 (double_value, name)
        VALUES (?, ?), (?, ?), (?, ?)`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'insertId',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'double',
                    notNull: false
                },
                {
                    name: 'param2',
                    columnType: 'varchar',
                    notNull: true
                },
                {
                    name: 'param3',
                    columnType: 'double',
                    notNull: false
                },
                {
                    name: 'param4',
                    columnType: 'varchar',
                    notNull: true
                },
                {
                    name: 'param5',
                    columnType: 'double',
                    notNull: false
                },
                {
                    name: 'param6',
                    columnType: 'varchar',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it(`INSERT INTO mytable3 (double_value, name) VALUES (?, ?), (10.5, ?), (?, 'name')`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        INSERT INTO mytable3 (double_value, name)
        VALUES (:value1, :name1), (10.5, :name2), (:value2, 'name')`;
        const expectedSql = `
        INSERT INTO mytable3 (double_value, name)
        VALUES (?, ?), (10.5, ?), (?, 'name')`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                },
                {
                    name: 'insertId',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'value1',
                    columnType: 'double',
                    notNull: false
                },
                {
                    name: 'name1',
                    columnType: 'varchar',
                    notNull: true
                },
                {
                    name: 'name2',
                    columnType: 'varchar',
                    notNull: true
                },
                {
                    name: 'value2',
                    columnType: 'double',
                    notNull: false
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
});
//# sourceMappingURL=parse-insert.test.js.map