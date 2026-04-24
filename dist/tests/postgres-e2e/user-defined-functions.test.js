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
const pg_1 = __importDefault(require("pg"));
const sql_1 = require("./sql");
const select_user_function01_1 = require("./sql/select-user-function01");
describe('e2e-postgres-user-defined-functions', () => {
    const pool = new pg_1.default.Pool({
        connectionString: 'postgres://postgres:password@127.0.0.1:5432/postgres'
    });
    it('get_mytable1()', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, select_user_function01_1.selectUserFunction01)(pool);
        const expectedResult = [
            {
                id: 1,
                value: 1
            },
            {
                id: 2,
                value: 2
            },
            {
                id: 3,
                value: 3
            },
            {
                id: 4,
                value: 4
            },
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
    it('get_mytable1_by_id(:id)', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.selectUserFunction02)(pool, { id: 2 });
        const expectedResult = {
            id: 2,
            value: 2
        };
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
});
//# sourceMappingURL=user-defined-functions.test.js.map