"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const select_columns_1 = require("../../src/mysql-query-analyzer/select-columns");
const util_1 = require("../../src/mysql-query-analyzer/util");
const collect_constraints_1 = require("../../src/mysql-query-analyzer/collect-constraints");
const unify_1 = require("../../src/mysql-query-analyzer/unify");
describe('Utility functions tests', () => {
    it('findColumn should be case insensitive', () => {
        const colDef = [
            {
                columnName: 'name',
                columnType: (0, collect_constraints_1.freshVar)('varchar', 'varchar'),
                columnKey: '',
                notNull: true,
                table: 'mytable2',
                hidden: 0
            }
        ];
        const fieldName = (0, select_columns_1.splitName)('name');
        const actual = (0, select_columns_1.findColumn)(fieldName, colDef);
        node_assert_1.default.deepStrictEqual(actual, colDef[0]);
        const fieldNameUperCase = (0, select_columns_1.splitName)('NAME');
        const actualUpperCase = (0, select_columns_1.findColumn)(fieldNameUperCase, colDef);
        node_assert_1.default.deepStrictEqual(actualUpperCase, colDef[0]);
    });
    it('test unionTypeResult', () => {
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('tinyint', 'tinyint'), 'tinyint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('tinyint', 'smallint'), 'smallint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('tinyint', 'mediumint'), 'mediumint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('tinyint', 'int'), 'int');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('tinyint', 'bigint'), 'bigint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('smallint', 'tinyint'), 'smallint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('smallint', 'smallint'), 'smallint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('smallint', 'mediumint'), 'mediumint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('smallint', 'int'), 'int');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('smallint', 'bigint'), 'bigint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('mediumint', 'tinyint'), 'mediumint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('mediumint', 'smallint'), 'mediumint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('mediumint', 'mediumint'), 'mediumint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('mediumint', 'int'), 'int');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('mediumint', 'bigint'), 'bigint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('int', 'tinyint'), 'int');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('int', 'smallint'), 'int');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('int', 'mediumint'), 'int');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('int', 'int'), 'int');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('int', 'bigint'), 'bigint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('bigint', 'tinyint'), 'bigint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('bigint', 'smallint'), 'bigint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('bigint', 'mediumint'), 'bigint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('bigint', 'int'), 'bigint');
        node_assert_1.default.deepStrictEqual((0, unify_1.unionTypeResult)('bigint', 'bigint'), 'bigint');
    });
    it('test getIndex', () => {
        const namedParameters = ['a', 'b', 'b', 'c', 'c', 'd'];
        const actual = (0, util_1.getParameterIndexes)(namedParameters);
        const expected = [
            {
                paramName: 'a',
                indexes: [0]
            },
            {
                paramName: 'b',
                indexes: [1, 2]
            },
            {
                paramName: 'c',
                indexes: [3, 4]
            },
            {
                paramName: 'd',
                indexes: [5]
            }
        ];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
});
//# sourceMappingURL=utility-functions.test.js.map