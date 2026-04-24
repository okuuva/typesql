"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const parse_1 = require("../../src/mysql-query-analyzer/parse");
describe('Infer param nullability', () => {
    it('SELECT ? FROM mytable1', () => {
        const sql = 'SELECT ? FROM mytable1';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT ? + id FROM mytable1', () => {
        const sql = 'SELECT ? + id, ?+?, (id+?)*? FROM mytable1';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true, true, true, true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it(`SELECT ? > 1, 1 < ?, ? > 'a', 'a' > ?, ? from mytable1`, () => {
        const sql = `SELECT ? > 1, 1 < ?, ? > 'a', 'a' > ?, ? from mytable1`;
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true, true, true, true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT (select ? from mytable2) from mytable1', () => {
        const sql = 'SELECT (select ?, ?+? from mytable2) from mytable1';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true, true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT (select ? from mytable2) from mytable1', () => {
        const sql = 'SELECT (select ? from mytable2), ?+id from mytable1';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT * from mytable1 where id > ?', () => {
        const sql = 'SELECT * from mytable1 WHERE id > ? OR id < ?';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT * FROM mytable2 where name like ?', () => {
        const sql = 'SELECT * FROM mytable2 where name like ?';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it(`SELECT concat(?, ?) from mytable1 where concat_ws(' / ', ?) < id`, () => {
        const sql = 'SELECT concat(?, ?) from mytable1';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT concat(nullif(?, null), ?) from mytable1', () => {
        const sql = 'SELECT concat(nullif(?, null), ?) from mytable1';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [false, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT concat(nullif(?, null), ?) from mytable1', () => {
        const sql = 'SELECT concat(nullif(?, 10), ?) from mytable1';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT year(?), month(?), day(?)', () => {
        const sql = 'SELECT year(?), month(?), day(?)';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true, true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT lpad(?, ?, ?)', () => {
        const sql = 'SELECT lpad(?, ?, ?)';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true, true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('SELECT INTERVAL ? MONTH + ?', () => {
        const sql = 'SELECT INTERVAL ? MONTH + ?';
        const actual = (0, parse_1.parseAndInferParamNullability)(sql);
        const expected = [true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
});
//# sourceMappingURL=infer-param-nullability.test.js.map