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
describe('e2e-postgres-dynamic-query', () => {
    const pool = new pg_1.default.Pool({
        connectionString: 'postgres://postgres:password@127.0.0.1:5432/postgres'
    });
    it('selectJsonBuildObject01', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.selectJsonBuildObject01)(pool);
        const expectedResult = {
            value1: {
                key1: 'str1'
            },
            value2: {
                key2: 10
            },
            value3: {
                key3: 'str2'
            },
            value4: {
                key4: 20
            }
        };
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
    it('selectJsonBuildObject02', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.selectJsonBuildObject02)(pool);
        const expectedResult = {
            result: [
                {
                    key: 'a',
                    key2: 1
                },
                {
                    key: 'b',
                    key2: 2
                }
            ]
        };
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
    it('selectJsonBuildArray01', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.selectJsonBuildArray01)(pool);
        const expectedResult = {
            value1: ['a', 'b'],
            value2: [null, 'c', 10]
        };
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
    it('select-json10', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.selectJson10)(pool);
        const expectedResult = {
            result1: {
                '1': 1,
                '2': 2,
                '3': 3,
                '4': 4,
            },
            result2: {
                '1': {
                    id: 1,
                    value: 1
                },
                '2': {
                    id: 2,
                    value: 2
                },
                '3': {
                    id: 3,
                    value: 3
                },
                '4': {
                    id: 4,
                    value: 4
                }
            }
        };
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
});
//# sourceMappingURL=json-functions.test.js.map