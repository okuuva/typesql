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
describe('parse update statements', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    const columns = [
        {
            name: 'affectedRows',
            type: 'int',
            notNull: true
        }
    ];
    it('update mytable1 set value = ? where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        update mytable1 set value = ? where id = ?
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [
                {
                    name: 'value',
                    columnType: 'int',
                    notNull: false
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
    it('UPDATE mytable2 SET name = :name, descr= :descr WHERE id = :id', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        UPDATE mytable2 SET name = ?, descr= ? WHERE id = ?
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [
                {
                    name: 'name',
                    columnType: 'varchar',
                    notNull: false
                },
                {
                    name: 'descr',
                    columnType: 'varchar',
                    notNull: false
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
    it('update mytable1 set value = :value where id > :min and id < :max', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        update mytable1 set value = :value where id > :min and id < :max
            `;
        const expectedSql = `
        update mytable1 set value = ? where id > ? and id < ?
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [
                {
                    name: 'value',
                    columnType: 'int',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'min',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'max',
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
    it('update mytable1 set value = :value where id > :value or id < :value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        update mytable1 set value = :value where id > :value or id < :value
            `;
        const expectedSql = `
        update mytable1 set value = ? where id > ? or id < ?
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [
                {
                    name: 'value',
                    columnType: 'int',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'value',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'value',
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
    it('UPDATE mytable1 SET id = IFNULL(:id, id)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        UPDATE mytable1 SET id = IFNULL(:id, id)
            `;
        const expectedSql = `
        UPDATE mytable1 SET id = IFNULL(?, id)
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [
                {
                    name: 'id',
                    columnType: 'int',
                    notNull: false
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('UPDATE mytable1 t1 SET t1.value = 10 WHERE t1.id = 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
            UPDATE mytable1 t1
            SET t1.value = 10
            WHERE t1.id = 1`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('UPDATE mytable2 t2, mytable3 t3 SET t2.name = t3.name WHERE t2.id = t3.id', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
            UPDATE mytable2 t2, mytable3 t3
            SET t2.name = t3.name
            WHERE t2.id = t3.id`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it(' WITH withTable3 as (...) UPDATE mytable2 t2, withTable3 t3', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH withTable3 as (
            select * from mytable3 where id = :id
        )
        UPDATE mytable2 t2, withTable3 t3
        SET t2.name = t3.name
        WHERE t2.id = t3.id`;
        const expectedSql = `
        WITH withTable3 as (
            select * from mytable3 where id = ?
        )
        UPDATE mytable2 t2, withTable3 t3
        SET t2.name = t3.name
        WHERE t2.id = t3.id`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [],
            parameters: [
                {
                    name: 'id',
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
    it(' WITH withTable3 as (...) UPDATE mytable2 t2, withTable3 t3', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH withTable3 as (
            select * from mytable3 where id = :id
        )
        UPDATE mytable2 t2, withTable3 t3
        SET t2.name = t3.name, t2.descr = :descr
        WHERE t2.id = t3.id
        AND t3.double_value = :value`;
        const expectedSql = `
        WITH withTable3 as (
            select * from mytable3 where id = ?
        )
        UPDATE mytable2 t2, withTable3 t3
        SET t2.name = t3.name, t2.descr = ?
        WHERE t2.id = t3.id
        AND t3.double_value = ?`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [
                {
                    name: 'descr',
                    columnType: 'varchar',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'id',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'value',
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
});
//# sourceMappingURL=parse-update.test.js.map