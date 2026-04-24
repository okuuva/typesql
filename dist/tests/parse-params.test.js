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
const describe_query_1 = require("../src/describe-query");
const queryExectutor_1 = require("../src/queryExectutor");
const Either_1 = require("fp-ts/lib/Either");
describe('Test parse parameters', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    it('SELECT ? from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT ? from mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'any',
                notNull: true //changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT ?+id from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT ?+id from mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'double',
                notNull: true //changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT id+? from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id+? from mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'double',
                notNull: true //changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT :value+id from mytable1 where :value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT :value+id from mytable1 where :value is not null
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'value',
                columnType: 'double',
                notNull: true //changed at v0.0.2
            },
            {
                name: 'value',
                columnType: 'double',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT ? > 1 from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT ? > 1 from mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it(`SELECT ? > 'a' from mytable1`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT ? > 'a' from mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'varchar',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT (select ? from mytable2) from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT (select ? from mytable2) from mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'any',
                notNull: true //changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT (select id from mytable2 where name = ?) from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT (select id from mytable2 where name = ?) from mytable1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'varchar',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT * from mytable1 where id > ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from mytable1 where id > ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT * from mytable1 where ? > id', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from mytable1 where ? > id
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it.skip(`SELECT * from mytable1 where concat_ws('/', ?) < id`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from mytable1 where concat_ws('/', ?) < id
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'varchar',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it(`SELECT * from mytable1 where concat_ws('/', ?) is null`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from mytable1 where concat_ws('/', ?) is null
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'varchar',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it.skip(`SELECT * from mytable1 where id > concat_ws('/', ?)`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from mytable1 where id > concat_ws('/', ?)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'varchar',
                notNull: true //changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT * from mytable1 where ? > (select id from mytable2 where id = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from mytable1 where ? > (select id from mytable2 where id = 1)
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error:`, actual.left);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT * from mytable1 where (select id from mytable2 where id = 1) < ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from mytable1 where (select id from mytable2 where id = 1) < ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT * from mytable2 where ? is null or id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from mytable2 where ? is null or id = ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'any',
                notNull: false
            },
            {
                name: 'param2',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT * from mytable2 where id = ? or id > ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from mytable2 where id = ? or id > ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it.skip(`select name from mytable2 where concat('/', id) > :p or id = :p`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where concat('/', id) > ? or id = ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'varchar',
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('select concat(?, ?) from mytable2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select concat(?, ?) from mytable2
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'varchar',
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'varchar',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    //TODO: new test: SELECT * FROM mytable1 t WHERE value in (select value from mytable1 m2 where m2.value is null) or value is null;
    it('SELECT * FROM mytable1 t WHERE ? in (select id from mytable1 m2 )', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1 t WHERE ? in (select id from mytable1 m2 )
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT * FROM mytable1 t WHERE ? in (select name from mytable2 m2 )', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1 t WHERE ? in (select name from mytable2 m2 )
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'varchar',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    //type mismatch
    it.skip('SELECT * FROM mytable1 t WHERE ? in (UNION - type mismatch)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1 t WHERE ? in (
            select id from mytable1
            union
            select name from mytable2
        )
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'varchar',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT * FROM mytable1 t WHERE ? in (UNION)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1 t WHERE ? in (
            select value from mytable1
            union
            select id+id from mytable2
        )
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'bigint',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT * FROM mytable1 WHERE id in (?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id FROM mytable1 WHERE id in (?)`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'int[]',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT * FROM mytable1 WHERE id = :param or value = :param', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * FROM mytable1 WHERE id = :param or value = :param`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expectedParameters = [
            {
                name: 'param',
                columnType: 'int',
                notNull: true
            },
            {
                name: 'param',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    }));
    it('SELECT CASE WHEN id = 1 THEN ? ELSE id END from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT CASE WHEN id = 1 THEN ? ELSE id END from mytable1`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true //changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    }));
    it('SELECT CASE WHEN id = 1 THEN id ELSE ? END from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT CASE WHEN id = 1 THEN id ELSE ? END from mytable1`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true //changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    }));
    it('parse select with case when expression (multiple parameters)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            CASE
                WHEN id = 1 THEN id
                WHEN id = 2 THEN ?
                WHEN id = 3 THEN id+id
                ELSE ?
            END
        FROM mytable1`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'bigint',
                notNull: true //changed at v0.0.2
            },
            {
                name: 'param2',
                columnType: 'bigint',
                notNull: true //changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    }));
    it('parse select with case when expression  (id+id)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            CASE
                WHEN id = ? THEN ?
                ELSE id+id
            END
        FROM mytable1`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'bigint',
                notNull: true //changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    }));
    it('parse select with case when expression (? in  not null)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            CASE WHEN (? IS NOT NULL)
              THEN ?
              ELSE 'a'
            END
        FROM mytable2`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'any', //changed at v0.0.2
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'varchar',
                notNull: true ////changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    }));
    it('parse select with case when expression 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            CASE WHEN id = 1
              THEN ?+id
              ELSE 20
            END
        FROM mytable2`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'double',
                notNull: true //changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    }));
    it('parse select with case when expression 3', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            CASE
                WHEN id = 1 THEN ? + id
                WHEN id = 2 THEN 2
                WHEN id = 3 then ?
                ELSE 1
            END as result
        FROM mytable1`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'double',
                notNull: true //changed at v0.0.2
            },
            {
                name: 'param2',
                columnType: 'double',
                notNull: true //changed at v0.0.2
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    }));
    it('select id from mytable2 where (name, id) = (select ?, ? from mytable2 where id = ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id FROM mytable2 WHERE (?, ?) = (select name, id from mytable2 where id = ?)`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'varchar',
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'int',
                notNull: true
            },
            {
                name: 'param3',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    }));
    it('SELECT id FROM mytable2 WHERE ? = CASE WHEN id = 1 THEN id ELSE ? END', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id FROM mytable2 WHERE ? = CASE WHEN id = 1 THEN id ELSE ? END`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    }));
    it('Param within WITH clause', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH
            names AS (SELECT id, name FROM mytable2 where id = ?)
        SELECT id
        FROM names`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    }));
    it('WITH result AS (query1 UNION query2) with parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id from mytable1 where mytable1.id = :a1
        UNION
        SELECT id from mytable2 where mytable2.id = :a1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'a1',
                columnType: 'int',
                notNull: true
            },
            {
                name: 'a1',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('WITH result AS (query1 UNION query2) with parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH result AS (
            SELECT id from mytable1 where mytable1.id = :a1
            UNION
            SELECT id from mytable2 where mytable2.id = :a1
        )
        SELECT * FROM result
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'a1',
                columnType: 'int',
                notNull: true
            },
            {
                name: 'a1',
                columnType: 'int',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
    it('SELECT ?, ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT ?, ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'param1',
                columnType: 'any',
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'any',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expected);
    }));
});
//# sourceMappingURL=parse-params.test.js.map