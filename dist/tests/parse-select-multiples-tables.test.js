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
describe('Test select with multiples tables', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    it('parse a basic with inner join', () => __awaiter(void 0, void 0, void 0, function* () {
        //mytable1 (id, value); mytable2 (id, name, descr)
        const sql = `
        SELECT *
        FROM mytable1 t1
        INNER JOIN mytable2 t2 on t2.id = t1.id
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
                    table: 't1'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 't1'
                },
                {
                    name: 'id', //TODO - rename fields
                    type: 'int',
                    notNull: true,
                    table: 't2'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                },
                {
                    name: 'descr',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('FROM mytable1 as t1 INNER JOIN mytable2 as t2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT *
        FROM mytable1 as t1
        INNER JOIN mytable2 as t2 on t2.id = t1.id
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
                    table: 't1'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 't1'
                },
                {
                    name: 'id', //TODO - rename fields
                    type: 'int',
                    notNull: true,
                    table: 't2'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                },
                {
                    name: 'descr',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select t1.* from inner join', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT t1.*
        FROM mytable1 t1
        INNER JOIN mytable2 t2 on t2.id = t1.id
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
                    table: 't1'
                },
                {
                    name: 'value',
                    type: 'int',
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
    it('select t2.* from inner join', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT t2.*
        FROM mytable1 t1
        INNER JOIN mytable2 t2 on t2.id = t1.id
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
                    table: 't2'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                },
                {
                    name: 'descr',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select t2.*, t1.* from inner join', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT t2.*, t1.*
        FROM mytable1 t1
        INNER JOIN mytable2 t2 on t2.id = t1.id
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
                    table: 't2'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                },
                {
                    name: 'descr',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                },
                {
                    name: 'id', //TODO - rename field
                    type: 'int',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'value',
                    type: 'int',
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
    it('parse select with param', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT t1.id
        FROM mytable1 t1
        INNER JOIN mytable2 t2 on t2.id = t1.id
        WHERE t2.id = ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true, //changed at v0.5.13
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't1'
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
    it('parse select with param 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT t1.id, t2.name, t1.value, t2.descr as description, ? as param1
        FROM mytable1 t1
        INNER JOIN mytable2 t2 on t2.id = t1.id
        WHERE t1.id = ? and t2.name = ? and t1.value > ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true, //changed at v0.5.13
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: true, //where t1.name = ?; cannot be null
                    table: 't2'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: true, //where t1.value = ?; cannot be null
                    table: 't1'
                },
                {
                    name: 'description',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                },
                {
                    name: 'param1',
                    type: 'any',
                    notNull: true,
                    table: ''
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
                    columnType: 'int',
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
    it('parse select with param (tablelist)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT t3.id, t2.name, t1.value, ? as param1
        FROM mytable1 t1, mytable2 t2, mytable3 t3
        WHERE t3.id > ? and t1.value = ? and t2.name = ?
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
                    table: 't3'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: true, //where t2.name = ?; cannot be null
                    table: 't2'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: true, //where t1.value = ?; cannot be null
                    table: 't1'
                },
                {
                    name: 'param1',
                    notNull: true,
                    type: 'any',
                    table: ''
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
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'param3',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'param4',
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
    it('parse a select with tablelist', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT t1.id, t2.name
        FROM mytable1 t1, mytable2 t2
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
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('parse a select with tablelist (not ambiguous)', () => __awaiter(void 0, void 0, void 0, function* () {
        // Column 'name' exists only on mytable2
        const sql = `
        SELECT name FROM mytable1, mytable2
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
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('parse a select with tablelist (ambiguous)', () => __awaiter(void 0, void 0, void 0, function* () {
        // Column 'id' exists on mytable1 and mytable2
        const sql = `
        SELECT id FROM mytable1, mytable2
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            name: 'Invalid sql',
            description: `Column \'id\' in field list is ambiguous`
        };
        if ((0, Either_1.isRight)(actual)) {
            node_assert_1.default.fail('Should return an error');
        }
        node_assert_1.default.deepStrictEqual(actual.left, expected);
    }));
    it('parse a select with tablelist (unreferenced alias)', () => __awaiter(void 0, void 0, void 0, function* () {
        // Column 'name' exists only on mytable2
        const sql = `
        SELECT name as fullname FROM mytable1 t1, mytable2 t2
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'fullname',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('parse a select with tablelist and subquery', () => __awaiter(void 0, void 0, void 0, function* () {
        // Column 'name' exists only on mytable2
        const sql = `
        SELECT name FROM (select t1.*, t2.name from mytable1 t1, mytable2 t2) t
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
    it('parse a query with extras parenteses', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from ((( mytable1, (select * from mytable2) t )))
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
    it('parse a query with duplicated names', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select t1.id, t2.id, t1.value as name, t2.name, t1.id, name as descr
        from mytable1 t1
        inner join mytable2 t2 on t1.id = t2.id
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        //Add the sufix _2, _3 to the duplicated names
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'id', //TODO - rename field
                    type: 'int',
                    notNull: true,
                    table: 't2'
                },
                {
                    name: 'name',
                    type: 'int',
                    notNull: false,
                    table: 't1'
                },
                {
                    name: 'name', //TODO - rename field
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                },
                {
                    name: 'id', //TODO - rename field
                    type: 'int',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'descr',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select * from inner join using', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT *
        FROM mytable1 t1
        INNER JOIN mytable2 t2 using(id)
        WHERE name is not null and value > 0
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
                    table: 't1'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: true,
                    table: 't2'
                },
                {
                    name: 'descr',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select * from inner join using (id) and table alias', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT *
        FROM mytable1 t1
        INNER JOIN mytable2 t2 using(id)
        WHERE t2.name is not null and t1.value > 0
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
                    table: 't1'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: true,
                    table: 't2'
                },
                {
                    name: 'descr',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select * from inner join using (id, name)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT *
        FROM mytable2 t1
        INNER JOIN mytable2 t2 using (id, name)
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
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false, //TODO - using(id, name) makes the name notNull
                    table: 't1'
                },
                {
                    name: 'descr',
                    type: 'varchar',
                    notNull: false,
                    table: 't1'
                },
                {
                    name: 'descr', //TODO - must rename
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('multipleRowsResult must be true with inner join WHERE t1.id = 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT t1.id, t1.name
        FROM mytable2 t1
        INNER JOIN mytable2 t2 ON t2.id = t1.id
        WHERE t1.id = 1
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
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'varchar',
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
    it('SELECT mytable1.id, mytable2.id is not null as hasOwner', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            mytable1.id,
            mytable2.id is not null as hasOwner
        FROM mytable1
        LEFT JOIN mytable2 ON mytable1.id = mytable2.id
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
                    name: 'hasOwner',
                    type: 'tinyint',
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
    it('multipleRowsResult=false to LIMIT 1', () => __awaiter(void 0, void 0, void 0, function* () {
        //mytable1 (id, value); mytable2 (id, name, descr)
        const sql = `
        SELECT *
        FROM mytable1 t1
        INNER JOIN mytable2 t2 on t2.id = t1.id
        LIMIT 1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 't1'
                },
                {
                    name: 'id', //TODO - rename fields
                    type: 'int',
                    notNull: true,
                    table: 't2'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                },
                {
                    name: 'descr',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
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
//# sourceMappingURL=parse-select-multiples-tables.test.js.map