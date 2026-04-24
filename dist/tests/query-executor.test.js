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
const query_executor_1 = require("../src/sqlite-query-analyzer/query-executor");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
describe('query-executor tests', () => {
    it('explain query with datetime parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM all_types where datetime_column = ?
        `;
        const db = new better_sqlite3_1.default('./mydb.db');
        const actual = yield (0, query_executor_1.explainSql)(db, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, true);
    }));
});
//# sourceMappingURL=query-executor.test.js.map