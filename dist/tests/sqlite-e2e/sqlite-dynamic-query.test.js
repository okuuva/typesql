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
const dynamic_query01_1 = require("./sql/dynamic-query01");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const sql_1 = require("./sql");
describe('e2e-sqlite-dynamic-query', () => {
    const db = new better_sqlite3_1.default('./mydb.db');
    it('dynamicQuery01 - without filters', () => {
        const result = (0, dynamic_query01_1.dynamicQuery01)(db);
        const expectedResult = [
            {
                id: 1,
                value: 1,
                name: 'one',
                description: 'descr-one'
            },
            {
                id: 2,
                value: 2,
                name: 'two',
                description: 'descr-two'
            },
            {
                id: 3,
                value: 3,
                name: 'three',
                description: 'descr-three'
            },
            {
                id: 4,
                value: 4,
                name: 'four',
                //@ts-ignore
                description: null
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamicQuery01 - select columns', () => {
        const result = (0, dynamic_query01_1.dynamicQuery01)(db, {
            select: {
                id: true,
                name: true
            }
        });
        const expectedResult = [
            {
                id: 1,
                name: 'one'
            },
            {
                id: 2,
                name: 'two'
            },
            {
                id: 3,
                name: 'three'
            },
            {
                id: 4,
                name: 'four'
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamicQuery01 - where BETWEEN', () => {
        const result = (0, dynamic_query01_1.dynamicQuery01)(db, {
            select: {
                id: true,
                name: true
            },
            where: [
                { column: 'id', op: 'BETWEEN', value: [2, 3] }
            ]
        });
        const expectedResult = [
            {
                id: 2,
                name: 'two'
            },
            {
                id: 3,
                name: 'three'
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamicQuery01 - IN', () => {
        const result = (0, dynamic_query01_1.dynamicQuery01)(db, {
            select: {
                id: true,
                name: true
            },
            where: [
                { column: 'id', op: 'IN', value: [1, 4] }
            ]
        });
        const expectedResult = [
            {
                id: 1,
                name: 'one'
            },
            {
                id: 4,
                name: 'four'
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamicQuery01 - NOT IN', () => {
        const result = (0, dynamic_query01_1.dynamicQuery01)(db, {
            select: {
                id: true,
                name: true
            },
            where: [
                { column: 'id', op: 'NOT IN', value: [1, 4] }
            ]
        });
        const expectedResult = [
            {
                id: 2,
                name: 'two'
            },
            {
                id: 3,
                name: 'three'
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamicQuery01 - >= and <=', () => {
        const result = (0, dynamic_query01_1.dynamicQuery01)(db, {
            select: {
                id: true,
                name: true
            },
            where: [
                { column: 'id', op: '>=', value: 2 },
                { column: 'id', op: '<=', value: 3 }
            ]
        });
        const expectedResult = [
            {
                id: 2,
                name: 'two'
            },
            {
                id: 3,
                name: 'three'
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamic-query02 - derivated-table', () => {
        const result = (0, sql_1.dynamicQuery02)(db, {
            params: {
                subqueryName: 'two'
            }
        });
        const expectedResult = [
            {
                id: 2,
                name: 'two'
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamic-query-03', () => {
        const result = (0, sql_1.dynamicQuery03)(db, {
            select: {
                value: true
            },
            where: [
                { column: 'value', op: '=', value: 2 }
            ]
        });
        const expectedResult = [
            {
                value: 2
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamic-query-04 - LIKE o%', () => {
        const result = (0, sql_1.dynamicQuery04)(db, {
            select: {
                value: true,
                name: true
            },
            where: [
                { column: 'name', op: 'LIKE', value: 'o%' }
            ]
        });
        const expectedResult = [
            {
                value: 1,
                name: 'one'
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamic-query-04 - LIKE %o%', () => {
        const result = (0, sql_1.dynamicQuery04)(db, {
            select: {
                value: true,
                name: true
            },
            where: [
                { column: 'name', op: 'LIKE', value: '%o%' }
            ]
        });
        const expectedResult = [
            {
                value: 1,
                name: 'one'
            },
            {
                value: 2,
                name: 'two'
            },
            {
                value: 4,
                name: 'four'
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamic-query-05 - cte', () => {
        const result = (0, sql_1.dynamicQuery05)(db, {
            select: {
                id: true,
                name: true
            },
            where: [
                { column: 'name', op: '=', value: 'two' }
            ]
        });
        const expectedResult = [
            {
                id: 2,
                name: 'two'
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamic-query-05 - exclude CTE', () => {
        const result = (0, sql_1.dynamicQuery05)(db, {
            select: {
                id: true
            },
            where: [
                { column: 'id', op: '=', value: 1 }
            ]
        });
        const expectedResult = [
            {
                id: 1
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    });
    it('dynamic-query-10 - limit and offset', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.dynamicQuery10)(db, {
            params: {
                name: 'two',
                limit: 2,
                offset: 0
            }
        });
        const expectedResult = [
            {
                id: 1,
                name: 'one'
            },
            {
                id: 3,
                name: 'three'
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
    it('dynamic-query-10 - limit, offset and where', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, sql_1.dynamicQuery10)(db, {
            params: {
                name: 'two',
                limit: 2,
                offset: 0
            },
            where: [
                { column: 'id', op: '=', value: 1 }
            ]
        });
        const expectedResult = [
            {
                id: 1,
                name: 'one'
            }
        ];
        node_assert_1.default.deepStrictEqual(result, expectedResult);
    }));
});
//# sourceMappingURL=sqlite-dynamic-query.test.js.map