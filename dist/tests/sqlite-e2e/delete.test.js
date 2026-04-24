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
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const sql_1 = require("./sql");
describe('sqlite-delete', () => {
    const db = new better_sqlite3_1.default('./mydb.db');
    it('delete02-returning *', () => __awaiter(void 0, void 0, void 0, function* () {
        const deleteTx = db.transaction(() => {
            const actual = (0, sql_1.delete02)(db, { param1: 2 });
            const expected = {
                id: 2,
                value: 2
            };
            node_assert_1.default.deepStrictEqual(actual, expected);
            throw new Error('Rollback this transaction');
        });
        try {
            deleteTx();
        }
        catch (e) {
            if (e instanceof Error) {
                node_assert_1.default.strictEqual(e.message, 'Rollback this transaction');
            }
            else {
                throw e;
            }
        }
    }));
});
//# sourceMappingURL=delete.test.js.map