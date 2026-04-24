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
const Either_1 = require("fp-ts/lib/Either");
const queryExectutor_1 = require("../src/queryExectutor");
describe('Test simple select statements', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    it('try to parse a empty query', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = '';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = 'Invalid sql';
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.deepStrictEqual(actual.left.name, expected);
        }
        else {
            node_assert_1.default.fail('should return an InvalidSqlError');
        }
    }));
    it('SELECT id FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
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
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'int',
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
        const sql = `SELECT id as "customQuotedName", id as 'customQuotedName2', id as \`customQuotedName3\` FROM mytable1`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'customQuotedName',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'customQuotedName2',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'customQuotedName3',
                    type: 'int',
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
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int',
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
    it('SELECT mytable1.* FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT mytable1.* FROM mytable1';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int',
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
    it('SELECT t.* FROM mytable1 t', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT t.* FROM mytable1 t';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'int',
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
    }));
    it('SELECT mytable1.id, mytable1.value FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT mytable1.id, mytable1.value FROM mytable1';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int',
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
    it('SELECT id, name, descr as description FROM mytable2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id, name, descr as description FROM mytable2';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable2'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 'mytable2'
                },
                {
                    name: 'description',
                    type: 'varchar',
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
    }));
    it('SELECT distinct id, value FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT distinct id, value FROM mytable1';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int',
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
    it('parse select distinct *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT distinct * FROM mytable1';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int',
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
    it('SELECT id FROM mydb.mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mydb.mytable1';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
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
    it('SELECT * FROM mytable1 WHERE id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM mytable1 WHERE id = ?';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false, //changed at v0.3.0
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    it('SELECT id FROM mytable1 WHERE id = ? and value = 10', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 WHERE id = ? and value = 10';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false, //changed at v.0.3.0
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    it('SELECT value FROM mytable1 WHERE id = ? or value > ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT value FROM mytable1 WHERE id = ? or value > ?';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 'mytable1'
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
    it('SELECT ? FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT ? FROM mytable1';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
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
                    notNull: true //todo - changed v0.0.2
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT id FROM mytable1 where value between :start and :end', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 where value between :start and :end';
        const expectedSql = 'SELECT id FROM mytable1 where value between ? and ?';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'start',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'end',
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
    it('SELECT id FROM mytable1 where id = 0 and value between :start and :end', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 where id = 0 and value between :start and :end';
        const expectedSql = 'SELECT id FROM mytable1 where id = 0 and value between ? and ?';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'start',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'end',
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
    //TODO - no reference to table.
    it('SELECT ? as name FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT ? as name FROM mytable1';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
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
                    notNull: true //changed on v0.0.2
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('parse a select with multiples params', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT ? as name, id, descr as description
        FROM mytable2
        WHERE (name = ? or descr = ?) and id > ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
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
                    type: 'int',
                    notNull: true,
                    table: 'mytable2'
                },
                {
                    name: 'description',
                    type: 'varchar',
                    notNull: false,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'any',
                    notNull: true //changed at v0.0.2
                },
                {
                    name: 'param2',
                    columnType: 'varchar',
                    notNull: true
                },
                {
                    name: 'param3',
                    columnType: 'varchar',
                    notNull: true
                },
                {
                    name: 'param4',
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
    it('parse a select with table alias', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT t.name FROM mytable2 t
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'varchar',
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
    }));
    it('SELECT t.* FROM mytable1 t WHERE t.id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT t.* FROM mytable1 t WHERE t.id = ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false, //changed at v0.3.0
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    it('SELECT * FROM mytable1 WHERE id in (1, 2, 3)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1 WHERE id in (1, 2, 3)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int',
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
    it('SELECT * FROM mytable1 WHERE id not in (1, 2, 3)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1 WHERE id not in (1, 2, 3)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int',
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
    it('SELECT t.* FROM mytable1 t WHERE t.id in (1, 2, 3)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT t.* FROM mytable1 t WHERE t.id in (1, 2, 3)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'int',
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
    }));
    it('SELECT * FROM mytable1 t WHERE id in (1, 2, 3, ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1 t WHERE id in (1, 2, 3, ?)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int[]',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT * FROM mytable1 t WHERE id not in (1, 2, 3, ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1 t WHERE id not in (1, 2, 3, ?)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int[]',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT * FROM mytable1 t WHERE ? in (1, 2, 3)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id FROM mytable1 t WHERE ? in (1, 2, 3)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    it(`SELECT * FROM mytable1 t WHERE ? in ('a', 'b', 'c')`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id FROM mytable1 t WHERE ? in ('a', 'b', 'c')
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    it.skip(`SELECT id FROM mytable1 t WHERE ? in (1, 2, 'a', 'b')`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id FROM mytable1 t WHERE ? in (1, 2, 'a', 'b')
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    it('SELECT * FROM mytable1 WHERE id = (select id from mytable2 where id = ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1 WHERE id = (select id from mytable2 where id = ?)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false, //changed at v0.3.0
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    it('select t1.id > 1 AS bigger from mytable1 t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select t1.id > 1 AS bigger from mytable1 t1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'bigger',
                    type: 'tinyint', //changed at v0.0.2
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
    it(`select t2.name > 'a' AS bigger from mytable2 t2`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select t2.name > 'a' AS bigger from mytable2 t2
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'bigger',
                    type: 'tinyint', //changed at v0.0.2
                    notNull: false, //TODO - not null true
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
    it('select id from mytable2 where name like ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from mytable2 where name like ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    it('select id from mytable2 where ? like name', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from mytable2 where ? like name
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    //TODO - CREATE TEST WITH ELSE; not null can be inferred
    it('parse select with CASE WHEN', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            CASE
                WHEN id = 1 THEN 'one'
                WHEN id = 2 THEN 'two'
            END as id
        FROM mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'varchar',
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
    it('parse select with CASE WHEN ... ELSE', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            CASE
                WHEN id = 1 THEN 'one'
                WHEN id = 2 THEN 'two'
                ELSE 'other'
            END as id
        FROM mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'varchar',
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
    it('parse select with CASE WHEN using IN operator', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    it('SELECT SUM(ID) as sumById FROM mytable1 t1 GROUP BY id', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT SUM(ID) as sumById
        FROM mytable1 t1
        GROUP BY id
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'sumById',
                    type: 'decimal',
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
    }));
    it('parse select using ANY operator', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from mytable1 where value > any(select id from mytable2 where name like ?)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    it('parse select using ANY operator with parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from mytable1 where ? > any(select id from mytable2 where name like ?)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
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
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    //the mysql drive tell value is nullable even if there is a 'where value is not null' clause
    it('select value from mytable1 where value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value is not null or (id > 0 and value is not null)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int',
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
    it('select id from mytable1 where 1 = 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from mytable1 where 1 = 1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
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
    it(`select enum_column from all_types where enum_column = 'medium' or 'short' = enum_column`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select enum_column from all_types where enum_column = 'medium' or 'short' = enum_column
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'enum_column',
                    type: `enum('x-small','small','medium','large','x-large')`,
                    notNull: true,
                    table: 'all_types'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: `, actual.left.description);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select :ano - year_column as result from all_types where int_column = 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select ? - year_column as result from all_types where int_column = 1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'result',
                    type: 'double',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'double',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select value from mytable1 order by ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 order by ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int',
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
    }));
    it('select value as myValue from mytable1 order by ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value as myValue from mytable1 order by ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'myValue',
                    type: 'int',
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
    }));
    it('select value from mytable1 order by value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 order by value
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int',
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
    }));
    it('order by with case when expression', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value, case when value = 1 then 1 else 2 end as ordering from mytable1 order by ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 'mytable1'
                },
                {
                    name: 'ordering',
                    type: 'int',
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
    }));
    it('order by with subselect', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from (
        select id, value, case when value = 1 then 1 else 2 end as ordering from mytable1
        ) t order by ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int',
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
    }));
    it('select with order by function', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 order by concat(name, ?)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 'mytable2'
                }
            ],
            //shouldn't include order by columns because there is no parameters on the order by clause
            //orderByColumns: ['id', 'value'],
            parameters: [
                {
                    name: 'param1',
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
    it('remove the ordering column from select', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from (
        select id, value, case when value = 1 then 1 else 2 end from mytable1
        ) t order by ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int',
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
    }));
    it('SELECT id FROM mytable1 LIMIT ?, ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 LIMIT ?, ?';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'bigint',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'bigint',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it(`SELECT id FROM mytable1 LIMIT 'a', ?`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT id FROM mytable1 LIMIT 'a', ?`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isRight)(actual)) {
            node_assert_1.default.fail('Should return an error');
        }
        const expectedMessage = 'Invalid sql';
        node_assert_1.default.deepStrictEqual(actual.left.name, expectedMessage);
    }));
    it('try to parse a SQL with type coercion error', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT MONTH('ASDF')`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = 'Type mismatch: varchar and date';
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.deepStrictEqual(actual.left.description, expected);
        }
        else {
            node_assert_1.default.fail('should return an InvalidSqlError');
        }
    }));
    it('SELECT bit_column FROM all_types WHERE bit_column = 1 or bit_column = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT bit_column FROM all_types WHERE bit_column = 1 or bit_column = ?';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'bit_column',
                    type: 'bit',
                    notNull: true,
                    table: 'all_types'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'bit',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('try to parse with reserved word desc', () => {
        //SELECT id, name, desc as description FROM MYTABLE
    });
});
//# sourceMappingURL=parse-select-single-table.test.js.map