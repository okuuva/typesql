"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const enum_parser_1 = require("../../src/postgres-query-analyzer/enum-parser");
describe('postgres-enum-parser', () => {
    it('enum-parser', () => {
        const checkConstraint = `CHECK ((enum_constraint = ANY (ARRAY['x-small'::text, 'small'::text, 'medium'::text, 'large'::text, 'x-large'::text])))`;
        const actual = (0, enum_parser_1.transformCheckToEnum)(checkConstraint);
        const expected = `enum('x-small','small','medium','large','x-large')`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
});
//# sourceMappingURL=enum-parser.test.js.map