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
describe('sqlite-parse-delete', () => {
    it('delete from mytable1 where id = ?', () => {
        const sql = 'delete from mytable1 where id = ?';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'delete from mytable1 where id = ?',
            queryType: 'Delete',
            multipleRowsResult: false,
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
    it('delete from mytable1 where id = :id', () => {
        const sql = 'delete from mytable1 where id = :id';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'delete from mytable1 where id = ?',
            queryType: 'Delete',
            multipleRowsResult: false,
            columns: [],
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
    it('DELETE FROM mytable1 WHERE id = :id RETURNING *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'DELETE FROM mytable1 WHERE id = :id RETURNING *';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'DELETE FROM mytable1 WHERE id = ? RETURNING *',
            queryType: 'Delete',
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
    }));
    it('DELETE FROM mytable1 WHERE id = :id RETURNING id, id+id, value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'DELETE FROM mytable1 WHERE id = :id RETURNING id, id+id, value';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'DELETE FROM mytable1 WHERE id = ? RETURNING id, id+id, value',
            queryType: 'Delete',
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
    }));
    it('delete from mytable1 where value = 0 or value is null', () => {
        const sql = 'delete from mytable1 where value = 0 or value is null';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'delete from mytable1 where value = 0 or value is null',
            queryType: 'Delete',
            multipleRowsResult: false,
            columns: [],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
});
//# sourceMappingURL=sqlite-parse-delete.test.js.map