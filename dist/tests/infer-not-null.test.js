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
describe('infer-not-null', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    //here
    it('select value from mytable1 where value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value is not null
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
    it('select * from mytable1 where value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select * from mytable1 where value is not null
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
    it('select value+10 from mytable1 where value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value+10 from mytable1 where value is not null
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value+10',
                    type: 'bigint',
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
    it('select value+10+? from mytable1 where value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value+? from mytable1 where value is not null
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value+?',
                    type: 'double',
                    notNull: true, //changed at v0.0.2
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'double',
                    notNull: true //changed at v0.0.2
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select t1.value from mytable1 t1 where t1.value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select t1.value from mytable1 t1 where t1.value is not null
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
    it('select t1.value from mytable1 t1 where value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select t1.value from mytable1 t1 where value is not null
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
    it('select value from mytable1 t1 where t1.value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 t1 where t1.value is not null
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
    it('select t1.value + value from mytable1 t1 where t1.value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select t1.value + value from mytable1 t1 where t1.value is not null
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 't1.value + value',
                    type: 'bigint',
                    notNull: true,
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
    it('select value as alias from mytable1 t1 where t1.value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value as alias from mytable1 t1 where t1.value is not null
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'alias',
                    type: 'int',
                    notNull: true,
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
    it('select t1.value from mytable1 t1 where id is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select t1.value from mytable1 t1 where id is not null
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
    it('select value from mytable1 where value is not null or (id > 0 or value is not null)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
            select value from mytable1 where value is not null or (id > 0 or value is not null)
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
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select value from mytable1 where value is not null and (id > 0 or value is not null)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
    select value from mytable1 where value is not null and (id > 0 or value is not null)
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
    it('select value from mytable1 where value is not null or (id > 0 and (id < 10 and value is not null)) ', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value is not null or (id > 0 and (id < 10 and value is not null))
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
    it('select value from mytable1 where id > 0 and id < 10 and value > 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where id > 0 and id < 10 and value > 1
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
    it('select value from mytable1 where value is not null and (value > 1 or value is null)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
    select value from mytable1 where value is not null and (value > 1 or value is null)
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
    it('select value from mytable1 where value is not null or (value > 1 and value is null)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value is not null or (value > 1 and value is null)
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
    it('select value from mytable1 where value > 1 and value is null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value > 1 and value is null
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
    it('select value + value from mytable1 where value > 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value + value from mytable1 where value > 1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value + value',
                    type: 'bigint',
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
    it('select value + value from mytable1 where id > 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value + value from mytable1 where id > 1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value + value',
                    type: 'bigint',
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
    it('select value + id from mytable1 where value > 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value + id from mytable1 where value > 1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value + id',
                    type: 'bigint',
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
    it('select value+id from mytable1 where id > 10', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value+id from mytable1 where id > 10
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value+id',
                    type: 'bigint',
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
    it('select id+id from mytable1 where value > 10', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id+id from mytable1 where value > 10
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id+id',
                    type: 'bigint',
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
    it('select sum(value) from mytable1 where value > 10', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select sum(value) from mytable1 where value > 10
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'sum(value)',
                    type: 'decimal',
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
    it('select sum(value) from mytable1 where value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select sum(value) from mytable1 where value is not null
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'sum(value)',
                    type: 'decimal',
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
    it('UNION 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION
        select id from mytable1
        UNION
        select value from mytable1 where value is not null
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
    it('UNION 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION
        select id from mytable1
        UNION
        select value from mytable1
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
    it('UNION 3', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION
        select name from mytable2
        UNION
        select value from mytable1 where value is not null
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
    it('UNION 4', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION
        select value from mytable1 where value is not null
        UNION
        select value from mytable1
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
    it('UNION 5 - using select *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- id, value, descr
        select *, (select descr from mytable2 where id = 1) from mytable1 where value is not null
        UNION
        -- id, name, descr
        select * from mytable2 where name is not null
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
                    table: ''
                },
                {
                    name: 'value',
                    type: 'varchar',
                    notNull: true,
                    table: ''
                },
                {
                    name: '(select descr from mytable2 where id = 1)',
                    type: 'varchar',
                    notNull: false,
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
    it('UNION 6', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION
        select value + value from mytable1 where value is not null
        UNION
        select value + id from mytable1`;
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
    it('UNION 7', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where name is not null
        UNION
        select value+value as total from mytable1 where value is not null
        UNION
        select value+id from mytable1 where value is not null
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
    it('select with alias', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select (select id from mytable1 where id = 10), name, name as name2 from mytable2 where name = 'abc'
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    type: 'int',
                    name: '(select id from mytable1 where id = 10)',
                    notNull: false,
                    table: ''
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: true,
                    table: 'mytable2'
                },
                {
                    name: 'name2',
                    type: 'varchar',
                    notNull: true,
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
    it('select with subquery', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name, (select id from mytable1 where id = 10) from mytable2 where id is not null
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
                },
                {
                    name: '(select id from mytable1 where id = 10)',
                    type: 'int',
                    notNull: false,
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
    it('select value + subquery', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id + (select id from mytable2 where id = 10 and id is not null) from mytable1 m1 where id is not null
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id + (select id from mytable2 where id = 10 and id is not null)',
                    type: 'bigint',
                    notNull: false,
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
    it('select name from (select name from mytable2 where name is not null) t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from (select name from mytable2 where name is not null) t1
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
                    notNull: true,
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
    it('select name from (select id as name from mytable2) t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from (select id as name from mytable2) t1
        `;
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
    it('select id from (select * from mytable2) t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (select * from mytable2) t1
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
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select * from (select * from mytable2 where name is not null and descr is not null) t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select * from (select * from mytable2 where name is not null and descr is not null) t1
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
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'descr',
                    type: 'varchar',
                    notNull: true,
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
    it('select * from (select * from mytable2 where name is not null or descr is not null) t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select * from (select * from mytable2 where name is not null or descr is not null) t1
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
                    table: 't1' //TODO - Fix
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 't1'
                },
                {
                    name: 'descr',
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
    it('select * from (select * from (select * from mytable2 where name is not null and descr is not null) t1) t2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select * from (select * from (select * from mytable2 where name is not null and descr is not null) t1) t2
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
                    notNull: true,
                    table: 't2'
                },
                {
                    name: 'descr',
                    type: 'varchar',
                    notNull: true,
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
//# sourceMappingURL=infer-not-null.test.js.map