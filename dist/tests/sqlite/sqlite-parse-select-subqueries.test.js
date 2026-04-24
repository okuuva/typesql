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
describe('sqlite-parse-select-subqueries', () => {
    it('parse a select with nested select', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (
            select id from mytable1
        ) t
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
    it('parse a select with nested select2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id, name from (
            select t1.id, t2.name from mytable1 t1
            inner join mytable2 t2 on t1.id = t2.id
        ) t
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
                    table: 't'
                },
                {
                    name: 'name',
                    type: 'TEXT',
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
    it('parse a select with nested select and alias', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (
            select value as id from mytable1
        ) t1
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
    it('parse a select with nested select and alias 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id as code from (
            select value as id from mytable1
        ) t1
        `;
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'code',
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
    }));
    it('select * from (subquery)', () => {
        const sql = `
        select * from (
            select name, name as id from mytable2
        ) t2
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
                    table: 't2'
                },
                {
                    name: 'id',
                    type: 'TEXT',
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
    });
    it('select * from (subquery) where', () => {
        const sql = `
        select * from (
            select name, name as id from mytable2
        ) t2
        WHERE t2.id = ? and t2.name = ?
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
                    notNull: true,
                    table: 't2'
                },
                {
                    name: 'id',
                    type: 'TEXT',
                    notNull: true,
                    table: 't2'
                }
            ],
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
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('parse a select with 3-levels nested select', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (
            select id from (
                select id from mytable1 
            ) t1
        ) t2
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
    it('SELECT id, (select max(id) from mytable2 m2 where m2.id =1) as subQuery FROM mytable1', () => {
        const sql = `
        SELECT
			id, (select max(id) from mytable2 m2 where m2.id =1) as subQuery
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
                    type: 'INTEGER',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'subQuery',
                    type: 'INTEGER',
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
    });
    it('SELECT id, exists(SELECT min(id) FROM mytable2 t2 where t2.id = t1.id) as has from mytable1 t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id, exists(SELECT min(id) FROM mytable2 t2 where t2.id = t1.id) as has from mytable1 t1
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
                    table: 't1'
                },
                {
                    name: 'has',
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
});
//# sourceMappingURL=sqlite-parse-select-subqueries.test.js.map