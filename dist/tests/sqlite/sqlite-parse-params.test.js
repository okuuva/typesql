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
describe('sqlite-parse-params', () => {
    it('SELECT * from mytable1 where id > ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from mytable1 where id > ?
        `;
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = [
            {
                name: 'param1',
                columnType: 'INTEGER',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT * from mytable2 where id = ? or id > ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from mytable2 where id = ? or id > ?
        `;
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = [
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
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('select concat(?, ?) from mytable2', () => {
        const sql = `
        select concat(?, ?) from mytable2
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
                columnType: 'TEXT',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    });
});
//# sourceMappingURL=sqlite-parse-params.test.js.map