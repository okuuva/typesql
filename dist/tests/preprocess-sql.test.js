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
const util_1 = require("../src/postgres-query-analyzer/util");
describe('preprocess-sql', () => {
    it('preprocess sql with one parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select * from mytable1 where :id = 10';
        const actual = (0, describe_query_1.preprocessSql)(sql, 'mysql');
        const expected = {
            sql: 'select * from mytable1 where ? = 10',
            namedParameters: [{ paramName: 'id', paramNumber: 1 }]
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('preprocess sql with one parameter (?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select * from mytable1 where ? = 10';
        const actual = (0, describe_query_1.preprocessSql)(sql, 'mysql');
        const expected = {
            sql: 'select * from mytable1 where ? = 10',
            namedParameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('preprocess sql with one parameter ($1)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select * from mytable1 where $1 = 10';
        const actual = (0, describe_query_1.preprocessSql)(sql, 'postgres');
        const expected = {
            sql: 'select * from mytable1 where $1 = 10',
            namedParameters: [{ paramName: 'param1', paramNumber: 1 },]
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('preprocess sql with several parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select * from mytable1 where :id = 10 or :id=1 or : name > 10or:param1>0and :PARAM>0 and :PARAM1>0 and 10>20';
        const actual = (0, describe_query_1.preprocessSql)(sql, 'mysql');
        const expected = {
            sql: 'select * from mytable1 where ? = 10 or ?=1 or : name > 10or?>0and ?>0 and ?>0 and 10>20',
            namedParameters: [
                { paramName: 'id', paramNumber: 1 },
                { paramName: 'id', paramNumber: 1 },
                { paramName: 'param1', paramNumber: 2 },
                { paramName: 'PARAM', paramNumber: 3 },
                { paramName: 'PARAM1', paramNumber: 4 },
            ],
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('preprocess sql with undescore and dollar in the param name', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select * from mytable1 where id = :emp_id or id = :$1';
        const actual = (0, describe_query_1.preprocessSql)(sql, 'mysql');
        const expected = {
            sql: 'select * from mytable1 where id = ? or id = ?',
            namedParameters: [
                { paramName: 'emp_id', paramNumber: 1 },
                { paramName: '$1', paramNumber: 2 }
            ]
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('preprocess sql without parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select * from mytable1';
        const actual = (0, describe_query_1.preprocessSql)(sql, 'mysql');
        const expected = {
            sql: 'select * from mytable1',
            namedParameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('preprocess with string literal', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT HOUR('13:01:02')`;
        const actual = (0, describe_query_1.preprocessSql)(sql, 'mysql');
        const expected = {
            sql: `SELECT HOUR('13:01:02')`,
            namedParameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('preprocess with string literal', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT HOUR("13:01:02")`;
        const actual = (0, describe_query_1.preprocessSql)(sql, 'mysql');
        const expected = {
            sql: `SELECT HOUR("13:01:02")`,
            namedParameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it.skip('preprocess sql with invalid parameter names', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select * from mytable1 where :1 > 0 or :=0 or :111 > 0';
        const actual = (0, describe_query_1.preprocessSql)(sql, 'mysql');
        const expected = {
            sql: 'select * from mytable1',
            namedParameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('verify @nested comment', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @nested
        `;
        const actual = (0, describe_query_1.hasAnnotation)(sql, '@nested');
        node_assert_1.default.deepStrictEqual(actual, true);
    }));
    it('verify without @nested comment', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1
        `;
        const actual = (0, describe_query_1.hasAnnotation)(sql, '@nested');
        node_assert_1.default.deepStrictEqual(actual, false);
    }));
    it('verify without @nested not int comment', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id as @nested FROM mytable1
        `;
        const actual = (0, describe_query_1.hasAnnotation)(sql, '@nested');
        node_assert_1.default.deepStrictEqual(actual, false);
    }));
    it('@safeIntegers:true in comments', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @safeIntegers:true
        select * from mytable1`;
        const actual = (0, describe_query_1.preprocessSql)(sql, 'mysql');
        const expected = {
            sql: `
        -- @safeIntegers:true
        select * from mytable1`,
            namedParameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('postgres-replace named paramters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select :value1, :value1, :value2, :value3, :value2 from mytable1`;
        const actual = (0, describe_query_1.preprocessSql)(sql, 'postgres');
        const expected = {
            sql: `
        select $1, $1, $2, $3, $2 from mytable1`,
            namedParameters: [
                { paramName: 'value1', paramNumber: 1 },
                { paramName: 'value1', paramNumber: 1 },
                { paramName: 'value2', paramNumber: 2 },
                { paramName: 'value3', paramNumber: 3 },
                { paramName: 'value2', paramNumber: 2 },
            ],
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('handle type-cast id::int2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id::int2 from mytable1`;
        const actual = (0, describe_query_1.preprocessSql)(sql, 'postgres');
        const expected = {
            sql: `
        select id::int2 from mytable1`,
            namedParameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
});
describe('replaceOrderByParamWithPlaceholder', () => {
    it('replaces ORDER BY with a parameter placeholder', () => {
        const sql = 'SELECT * FROM mytable1 ORDER BY $1';
        const actual = (0, util_1.replaceOrderByParamWithPlaceholder)(sql);
        const expected = {
            sql: 'SELECT * FROM mytable1 ORDER BY /*__orderByPlaceholder__*/ 1',
            replaced: true,
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('replaces ORDER BY with a named parameter placeholder', () => {
        const sql = 'SELECT * FROM mytable1 ORDER BY :sortKey';
        const actual = (0, util_1.replaceOrderByParamWithPlaceholder)(sql);
        const expected = {
            sql: 'SELECT * FROM mytable1 ORDER BY /*__orderByPlaceholder__*/ 1',
            replaced: true,
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('returns original sql if no ORDER BY with param found', () => {
        const sql = 'SELECT * FROM mytable1 ORDER BY id DESC';
        const actual = (0, util_1.replaceOrderByParamWithPlaceholder)(sql);
        const expected = {
            sql,
            replaced: false,
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
});
describe('replaceOrderByPlaceholderWithBuildOrderBy', () => {
    it('replaces the orderBy placeholder with buildOrderBy call', () => {
        const sql = 'SELECT * FROM mytable ORDER BY /*__orderByPlaceholder__*/ 1';
        const actual = (0, util_1.replaceOrderByPlaceholderWithBuildOrderBy)(sql);
        const expected = 'SELECT * FROM mytable ORDER BY ${buildOrderBy(params.orderBy)}';
        node_assert_1.default.strictEqual(actual, expected);
    });
    it('works with different casing for ORDER BY', () => {
        const sql = 'select * from mytable order by /*__orderByPlaceholder__*/ 1';
        const actual = (0, util_1.replaceOrderByPlaceholderWithBuildOrderBy)(sql);
        const expected = 'select * from mytable order by ${buildOrderBy(params.orderBy)}';
        node_assert_1.default.strictEqual(actual, expected);
    });
    it('returns original sql if placeholder not present', () => {
        const sql = 'SELECT * FROM mytable ORDER BY created_at DESC';
        const actual = (0, util_1.replaceOrderByPlaceholderWithBuildOrderBy)(sql);
        node_assert_1.default.strictEqual(actual, sql);
    });
    it('does not replace ORDER BY with numeric constant 1', () => {
        const sql = 'SELECT * FROM mytable ORDER BY 1';
        const actual = (0, util_1.replaceOrderByPlaceholderWithBuildOrderBy)(sql);
        // Should return the original SQL unchanged
        node_assert_1.default.strictEqual(actual, sql);
    });
});
//# sourceMappingURL=preprocess-sql.test.js.map