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
describe('Parse window functions', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    it('SELECT ROW_NUMBER() OVER() as num', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            ROW_NUMBER() OVER() as num
        FROM mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'num',
                    type: 'bigint',
                    notNull: true,
                    table: '' //TODO - not implemented
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT *, (ROW_NUMBER() OVER()) as num', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            *,
            (ROW_NUMBER() OVER()) as num
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
                    type: 'int',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 'mytable1'
                },
                {
                    name: 'num',
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
    it('FIRST_VALUE(id), LAST_VALUE(name), RANK() and DENSE_RANK()', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            FIRST_VALUE(id) OVER() as firstId,
            LAST_VALUE(name) OVER() as lastName,
            RANK() OVER() as rankValue,
            DENSE_RANK() OVER() as denseRankValue
        FROM mytable2
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'firstId',
                    type: 'int',
                    notNull: true,
                    table: 'mytable2'
                },
                {
                    name: 'lastName',
                    type: 'varchar',
                    notNull: false,
                    table: 'mytable2'
                },
                {
                    name: 'rankValue',
                    type: 'bigint',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'denseRankValue',
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
    it('SUM(value) OVER() AS total', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            SUM(value) OVER() AS total
        FROM mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'total',
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
    it('SELECT AVG(value) OVER() as avgResult FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT AVG(value) OVER() as avgResult FROM mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'avgResult',
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
    it('LEAD() and LAG()', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            LEAD(id) OVER() as leadValue,
            LAG(name) OVER() as lagValue
        FROM mytable2
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'leadValue',
                    type: 'int',
                    notNull: false,
                    table: 'mytable2'
                },
                {
                    name: 'lagValue',
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
});
//# sourceMappingURL=parse-window-functions.test.js.map