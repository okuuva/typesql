"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const parse_1 = require("../../src/mysql-query-analyzer/parse");
const create_schema_1 = require("./create-schema");
describe('type-inference test', () => {
    it('SELECT id FROM mytable1', () => {
        const sql = 'INSERT INTO mytable1 (value) VALUES (?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: [],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('INSERT INTO mydb.mytable1 (value) VALUES (?)', () => {
        const sql = 'INSERT INTO mydb.mytable1 (value) VALUES (?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: [],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('INSERT INTO alltypes (double_column, int_column, varchar_column) VALUES (?, ?, ?)', () => {
        const sql = 'INSERT INTO all_types (double_column, int_column, varchar_column) VALUES (?, ?, ?)';
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: [],
            parameters: ['double', 'int', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('INSERT INTO mytable1 VALUES (DEFAULT, ?, ?, DEFAULT)', () => {
        //values(int, int, double, bigint)
        const sql = 'INSERT INTO mytable1 VALUES (DEFAULT, ?, ?, DEFAULT)';
        const newSchema = [
            ...create_schema_1.dbSchema,
            {
                column: 'column3',
                column_type: 'double',
                columnKey: '',
                table: 'mytable1',
                schema: 'mydb',
                notNull: false,
                hidden: 0
            },
            {
                column: 'column4',
                column_type: 'bigint',
                columnKey: '',
                table: 'mytable1',
                schema: 'mydb',
                notNull: false,
                hidden: 0
            }
        ];
        const actual = (0, parse_1.parseAndInfer)(sql, newSchema);
        const expected = {
            columns: [],
            parameters: ['int', 'double']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('INSERT INTO all_types (double_column) VALUE (subquery)', () => {
        const sql = `INSERT INTO all_types (double_column)
                     VALUES (
                        (SELECT double_value FROM mytable3 WHERE id = ?)
                    )`;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: [],
            parameters: ['int']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('INSERT INTO alltypes (double_column, int_column) VALUES (?, ?)', () => {
        const sql = `INSERT INTO all_types (bigint_column)
                     VALUES (
                        (SELECT ? from mytable2)
                    )`;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: [],
            parameters: ['bigint']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('INSERT INTO alltypes (double_column, int_column) VALUES (?, ?)', () => {
        const sql = `INSERT INTO all_types (double_column, bigint_column)
                     VALUES (
                        (SELECT double_column+? FROM all_types WHERE int_column = ?),
                        (SELECT id + id + ? from mytable2 WHERE name = ?)
                    )`;
        const actual = (0, parse_1.parseAndInfer)(sql, create_schema_1.dbSchema);
        const expected = {
            columns: [],
            parameters: ['double', 'int', 'bigint', 'varchar']
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
});
//# sourceMappingURL=type-inference-insert-stmt.test.js.map