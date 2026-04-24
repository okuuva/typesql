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
const replace_list_params_1 = require("../../src/sqlite-query-analyzer/replace-list-params");
describe('sqlite-teste-replace-list-params', () => {
    it('SELECT id FROM mytable1 WHERE id in (?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 WHERE id in (?)';
        const newSql = (0, replace_list_params_1.replaceListParams)(sql, getParamIndices(sql));
        const expected = "SELECT id FROM mytable1 WHERE id in (${params.param1.map(() => '?')})";
        node_assert_1.default.deepStrictEqual(newSql, expected);
    }));
    it('multiples parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 WHERE id in (?) and value in (1, 2, ?)';
        const newSql = (0, replace_list_params_1.replaceListParams)(sql, getParamIndices(sql));
        const expected = "SELECT id FROM mytable1 WHERE id in (${params.param1.map(() => '?')}) and value in (1, 2, ${params.param2.map(() => '?')})";
        node_assert_1.default.deepStrictEqual(newSql, expected);
    }));
    it('multiple lines', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT id FROM mytable1
        WHERE id in (?)
        and value in (1, 2, ?)`;
        const newSql = (0, replace_list_params_1.replaceListParams)(sql, getParamIndices(sql));
        const expected = `SELECT id FROM mytable1
        WHERE id in (\${params.param1.map(() => \'?\')})
        and value in (1, 2, \${params.param2.map(() => \'?\')})`;
        node_assert_1.default.deepStrictEqual(newSql, expected);
    }));
});
function getParamIndices(sql) {
    const indices = [];
    for (let i = 0; i < sql.length; i++) {
        if (sql[i] === '?') {
            indices.push({
                name: `param${indices.length + 1}`,
                paramPosition: i
            });
        }
    }
    return indices;
}
//# sourceMappingURL=sqlite-teste-replace-list-params.test.js.map