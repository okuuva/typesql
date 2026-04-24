"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const create_schema_1 = require("./create-schema");
const infer_column_nullability_1 = require("../../src/mysql-query-analyzer/infer-column-nullability");
describe('column-nullability - functions', () => {
    it('SELECT id FROM mytable1', () => {
        const sql = 'SELECT NOW(), CURDATE(), CURTIME()';
        const actual = (0, infer_column_nullability_1.parseAndInferNotNull)(sql, create_schema_1.dbSchema);
        const expected = [true, true, true];
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
});
//# sourceMappingURL=column-nullability-functions.test.js.map