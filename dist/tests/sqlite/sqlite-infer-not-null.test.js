"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const Either_1 = require("fp-ts/lib/Either");
const parser_1 = require("../../src/sqlite-query-analyzer/parser");
const create_schema_1 = require("../mysql-query-analyzer/create-schema");
describe('sqlite-infer-not-null.test', () => {
    it('select with left join', () => {
        const sql = `
        select t1.id, t2.id, t1.value, t2.name 
        from mytable1 t1 
        left join mytable2 t2 on t1.id = t2.id;
        `;
        const result = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        if ((0, Either_1.isLeft)(result)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${result.left.description}`);
        }
        const actual = getColumnNullability(result.right.columns);
        const expected = [true, false, false, false];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('select value from mytable1 where value >= 1', () => {
        const sql = 'select value from mytable1 where value >= 1';
        const result = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        if ((0, Either_1.isLeft)(result)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${result.left.description}`);
        }
        const actual = getColumnNullability(result.right.columns);
        node_assert_1.default.deepStrictEqual(actual, [true]);
    });
    it('select value from mytable1 where value <= 1', () => {
        const sql = 'select value from mytable1 where value <= 1';
        const result = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        if ((0, Either_1.isLeft)(result)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${result.left.description}`);
        }
        const actual = getColumnNullability(result.right.columns);
        node_assert_1.default.deepStrictEqual(actual, [true]);
    });
});
function getColumnNullability(columns) {
    return columns.map((col) => col.notNull);
}
//# sourceMappingURL=sqlite-infer-not-null.test.js.map