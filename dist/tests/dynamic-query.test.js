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
const queryExectutor_1 = require("../src/queryExectutor");
const Either_1 = require("fp-ts/lib/Either");
const describe_query_1 = require("../src/describe-query");
describe('dynamic-query', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    it('WHERE m2.name = :name AND m2.descr = :description', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT m1.id, m1.value, m2.name, m2.descr as description
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m1.id = m2.id
        WHERE m2.name = :name
        AND m2.descr = :description

        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm1.value',
                    fragmentWitoutAlias: 'm1.value',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [2],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.descr as description',
                    fragmentWitoutAlias: 'm2.descr',
                    dependOnFields: [3],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m1.id = m2.id',
                    dependOnFields: [2, 3],
                    dependOnParams: ['name', 'description'],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: 'AND m2.name = ?',
                    dependOnFields: [],
                    dependOnParams: ['name'],
                    parameters: ['name']
                },
                {
                    fragment: 'AND m2.descr = ?',
                    dependOnFields: [],
                    dependOnParams: ['description'],
                    parameters: ['description']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('WHERE m2.id = 1 AND m2.name = :name AND m2.descr = :description', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT m1.id, m1.value, m2.name, m2.descr as description
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m1.id = m2.id
        WHERE m2.id = 1
            AND m2.name = :name
            AND m2.descr = :description

        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm1.value',
                    fragmentWitoutAlias: 'm1.value',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [2],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.descr as description',
                    fragmentWitoutAlias: 'm2.descr',
                    dependOnFields: [3],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m1.id = m2.id',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: 'AND m2.id = 1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'AND m2.name = ?',
                    dependOnFields: [],
                    dependOnParams: ['name'],
                    parameters: ['name']
                },
                {
                    fragment: 'AND m2.descr = ?',
                    dependOnFields: [],
                    dependOnParams: ['description'],
                    parameters: ['description']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('WHERE m2.id in (:ids)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT m1.id, m2.name, m2.descr as description
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m1.id = m2.id
        WHERE m2.id in (:ids)
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.descr as description',
                    fragmentWitoutAlias: 'm2.descr',
                    dependOnFields: [2],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m1.id = m2.id',
                    dependOnFields: [1, 2],
                    dependOnParams: ['ids'],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: 'AND m2.id in (?)',
                    dependOnFields: [],
                    dependOnParams: ['ids'],
                    parameters: ['ids']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('mytable1 m1 INNER JOIN mytable2 ... INNER JOIN mytable3', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
            -- @dynamicQuery
            SELECT m1.id, m2.name, m3.double_value as value
            FROM mytable1 m1
            INNER JOIN mytable2 m2 on m2.id = m1.id
            INNER JOIN mytable3 m3 on m3.id = m2.id
            WHERE m3.id in (:ids)
            `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm3.double_value as value',
                    fragmentWitoutAlias: 'm3.double_value',
                    dependOnFields: [2],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m2.id = m1.id',
                    dependOnFields: [1, 2],
                    dependOnParams: ['ids'],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable3 m3 on m3.id = m2.id',
                    dependOnFields: [2],
                    dependOnParams: ['ids'],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: 'AND m3.id in (?)',
                    dependOnFields: [],
                    dependOnParams: ['ids'],
                    parameters: ['ids']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('WHERE m2.name = :name AND m2.descr = :description', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT m1.id, m2.name
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m1.id = m2.id
        WHERE m2.name = concat('A', :name, 'B', :name, :name2)
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m1.id = m2.id',
                    dependOnFields: [1],
                    dependOnParams: ['name', 'name2'],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: `AND m2.name = concat('A', ?, 'B', ?, ?)`,
                    dependOnFields: [],
                    dependOnParams: ['name', 'name', 'name2'],
                    parameters: ['name', 'name', 'name2']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it(`m2.name like concat('%', :name, '%')`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT m1.id, m2.name
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m1.id = m2.id
        WHERE m2.name like concat('%', :name, '%')
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m1.id = m2.id',
                    dependOnFields: [1],
                    dependOnParams: ['name'],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: `AND m2.name like concat('%', ?, '%')`,
                    dependOnFields: [],
                    dependOnParams: ['name'],
                    parameters: ['name']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it(`SELECT concat(m1.value, ': ', m2.name) as valueAndName`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT m1.id, m1.value, m2.name, concat(m1.value, ': ', m2.name) as valueAndName
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m1.id = m2.id
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm1.value',
                    fragmentWitoutAlias: 'm1.value',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [2],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: `concat(m1.value, ': ', m2.name) as valueAndName`,
                    fragmentWitoutAlias: `concat(m1.value, ': ', m2.name)`,
                    dependOnFields: [3],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m1.id = m2.id',
                    dependOnFields: [2, 3],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            where: []
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it(`SELECT concat(m1.value, ': ', m2.name) as valueAndName`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT m1.id, m1.value, m2.name
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m1.id = m2.id
        WHERE lower(m2.name) like lower(concat('%', :name, '%'))
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm1.value',
                    fragmentWitoutAlias: 'm1.value',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [2],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m1.id = m2.id',
                    dependOnFields: [2],
                    dependOnParams: ['name'],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: `AND lower(m2.name) like lower(concat('%', ?, '%'))`,
                    dependOnFields: [],
                    dependOnParams: ['name'],
                    parameters: ['name']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('(select name from mytable1 where id = 1) as subQuery', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT
            m1.id,
            m2.name,
            (select id from mytable1 where id = 1) as subQuery
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m1.id = m2.id
        WHERE m2.name = :name
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: '(select id from mytable1 where id = 1) as subQuery',
                    fragmentWitoutAlias: '(select id from mytable1 where id = 1)',
                    dependOnFields: [2],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m1.id = m2.id',
                    dependOnFields: [1],
                    dependOnParams: ['name'],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: 'AND m2.name = ?',
                    dependOnFields: [],
                    dependOnParams: ['name'],
                    parameters: ['name']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('(select name from mytable1 where id = m2.id) as subQuery', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT
            m1.id,
            m2.name,
            (select name from mytable1 where id = m2.id) as subQuery
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m1.id = m2.id
        WHERE m2.name = :name
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: '(select name from mytable1 where id = m2.id) as subQuery',
                    fragmentWitoutAlias: '(select name from mytable1 where id = m2.id)',
                    dependOnFields: [2],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m1.id = m2.id',
                    dependOnFields: [1, 2],
                    dependOnParams: ['name'],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: 'AND m2.name = ?',
                    dependOnFields: [],
                    dependOnParams: ['name'],
                    parameters: ['name']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('(select name from mytable1 where id = m2.id) as subQuery', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT
            m1.id,
            m2.name,
            (select name from mytable1 m3 where m3.id = m2.id) as subQuery
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m1.id = m2.id
        WHERE m2.name = :name
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: '(select name from mytable1 m3 where m3.id = m2.id) as subQuery',
                    fragmentWitoutAlias: '(select name from mytable1 m3 where m3.id = m2.id)',
                    dependOnFields: [2],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m1.id = m2.id',
                    dependOnFields: [1, 2],
                    dependOnParams: ['name'],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: 'AND m2.name = ?',
                    dependOnFields: [],
                    dependOnParams: ['name'],
                    parameters: ['name']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('INNER JOIN (SELECT FROM ...)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT
            m1.id,
            m2.name
        FROM mytable1 m1
        INNER JOIN ( -- derivated table
            SELECT id, name from mytable2 m
            WHERE m.name = :subqueryName
        ) m2
        WHERE m2.name = :name
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: `INNER JOIN ( -- derivated table
            SELECT id, name from mytable2 m
            WHERE m.name = ?
        ) m2`,
                    dependOnFields: [1],
                    dependOnParams: ['name'],
                    parameters: ['subqueryName']
                }
            ],
            where: [
                {
                    fragment: 'AND m2.name = ?',
                    dependOnFields: [],
                    dependOnParams: ['name'],
                    parameters: ['name']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it(`SELECT concat(m1.value, ': ', m2.name) as valueAndName`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT
            m1.id,
            m2.name
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m1.id = m2.id
        WHERE (:name is null OR m2.name = :name)
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m1.id = m2.id',
                    dependOnFields: [1],
                    dependOnParams: ['name'],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: 'AND (? is null OR m2.name = ?)',
                    dependOnFields: [],
                    dependOnParams: ['name', 'name'],
                    parameters: ['name', 'name']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('SELECT * FROM mytable1 m1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        -- @dynamicQuery
        SELECT
           *
        FROM mytable1 m1
        INNER JOIN mytable2 m2 on m2.id = m1.id
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm1.value',
                    fragmentWitoutAlias: 'm1.value',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.id',
                    fragmentWitoutAlias: 'm2.id',
                    dependOnFields: [2],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [3],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.descr',
                    fragmentWitoutAlias: 'm2.descr',
                    dependOnFields: [4],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m2.id = m1.id',
                    dependOnFields: [2, 3, 4],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            where: []
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('SELECT m1.id, name, descr as description FROM mytable1 m1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
SELECT
	m1.id, name, descr as description
FROM mytable1 m1
INNER JOIN mytable2 m2 on m2.id = m1.id
        `;
        const sqlFragments = {
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'name',
                    fragmentWitoutAlias: 'name',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'descr as description',
                    fragmentWitoutAlias: 'descr',
                    dependOnFields: [2],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN mytable2 m2 on m2.id = m1.id',
                    dependOnFields: [1, 2],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            where: []
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('SELECT m1.id, name, descr as description FROM mytable1 m1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
WITH cte as (
	select id, name from mytable2
)
SELECT
	m1.id,
	m2.name
FROM mytable1 m1
INNER JOIN cte m2 on m2.id = m1.id
WHERE m2.name LIKE :name
        `;
        const sqlFragments = {
            with: [
                {
                    fragment: `cte as (
	select id, name from mytable2
)`,
                    dependOnFields: [1],
                    dependOnParams: ['name'],
                    parameters: []
                }
            ],
            select: [
                {
                    fragment: 'm1.id',
                    fragmentWitoutAlias: 'm1.id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'm2.name',
                    fragmentWitoutAlias: 'm2.name',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 m1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'INNER JOIN cte m2 on m2.id = m1.id',
                    dependOnFields: [1],
                    dependOnParams: ['name'],
                    parameters: []
                }
            ],
            where: [
                {
                    fragment: 'AND m2.name LIKE ?',
                    dependOnFields: [],
                    dependOnParams: ['name'],
                    parameters: ['name']
                }
            ]
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
    it('SELECT m1.id, name, descr as description FROM mytable1 m1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
SELECT id, exists(SELECT 1 FROM mytable2 where id = t1.id) as has from mytable1 t1`;
        const sqlFragments = {
            select: [
                {
                    fragment: 'id',
                    fragmentWitoutAlias: 'id',
                    dependOnFields: [0],
                    dependOnParams: [],
                    parameters: []
                },
                {
                    fragment: 'exists(SELECT 1 FROM mytable2 where id = t1.id) as has',
                    fragmentWitoutAlias: 'exists(SELECT 1 FROM mytable2 where id = t1.id)',
                    dependOnFields: [1],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            from: [
                {
                    fragment: 'FROM mytable1 t1',
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: []
                }
            ],
            where: []
        };
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.dynamicSqlQuery, sqlFragments);
    }));
});
//# sourceMappingURL=dynamic-query.test.js.map