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
describe('Test parse complex queries', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    it('parse SELECT t1.name, t2.mycolumn2, t3.mycolumn3, count', () => __awaiter(void 0, void 0, void 0, function* () {
        //mytable1 (id, value); mytable2 (id, name, descr); mytable3 (id)
        const sql = `
        SELECT t1.value, t2.name, t3.id, count(*) AS quantity
        FROM mytable1 t1
        INNER JOIN mytable2 t2 ON t2.id = t1.id
        LEFT JOIN mytable3 t3 ON t3.id = t2.id
        GROUP BY t1.value, t2.name, t3.id
        HAVING count(*) > 1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 't2'
                },
                {
                    name: 'id',
                    type: 'int',
                    notNull: false,
                    table: 't3'
                },
                {
                    name: 'quantity',
                    notNull: true,
                    type: 'bigint',
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('HAVING value > ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            name,
            SUM(double_value) as value
        FROM mytable3
        GROUP BY
            name
        HAVING
            value > ?
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: true,
                    table: 'mytable3'
                },
                {
                    name: 'value',
                    type: 'double',
                    notNull: false,
                    table: 'mytable3'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'double',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('HAVING value > ? and ? <', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            name,
            SUM(double_value) as value,
            SUM(double_value * 0.01) as id
        FROM mytable3
        WHERE id > ? -- this id is from mytable3 column
        GROUP BY
            name
        HAVING
            value > ?
            and id < ? -- this id is from the SELECT alias
            AND SUM(double_value) = ?

        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: true,
                    table: 'mytable3'
                },
                {
                    name: 'value',
                    type: 'double',
                    notNull: false,
                    table: 'mytable3'
                },
                {
                    name: 'id',
                    type: 'double',
                    notNull: false,
                    table: '' //TODO - could be mytable3?
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'double',
                    notNull: true
                },
                {
                    name: 'param3',
                    columnType: 'double',
                    notNull: true
                },
                {
                    name: 'param4',
                    columnType: 'double',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    //https://www.mysqltutorial.org/mysql-subquery/
    it('parse a select with UNION', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id FROM mytable1
        UNION
        SELECT id FROM mytable2
        UNION
        SELECT id FROM mytable3
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('parse a select with UNION (int_column + text_column)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
            SELECT int_column as col FROM all_types
            UNION
            SELECT text_column as col FROM all_types
            `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'col',
                    type: 'text',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    //.only
    it('parse a select with UNION (int_column + int_column, int_column + text_column)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id, value FROM mytable1
        UNION
        SELECT id, name as value FROM mytable2
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        //value is int; name is varchar; result: varchar;
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'value',
                    type: 'varchar',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    //.only
    it('parse a select with UNION with multiples fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id, value FROM mytable1
        UNION
        SELECT id, descr as value FROM mytable2
        UNION
        SELECT id, id as value FROM mytable3
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'value',
                    type: 'varchar',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('subselect in column', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT (SELECT name FROM mytable2 where id = t1.id) as fullname
        FROM mytable1 t1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'fullname',
                    type: 'varchar',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('subselect in column (with parameter)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT (SELECT name as namealias FROM mytable2 where id = ?) as fullname
        FROM mytable1 t1
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'fullname',
                    type: 'varchar',
                    notNull: false,
                    table: '' //TODO - subselect table name should be ''
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH names AS ( SELECT name FROM mytable2 )', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH names AS (
            SELECT name FROM mytable2
        )
        SELECT name from names
        `;
        // const sql = `SELECT name from mytable2`
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 'names'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH names AS (query1), allvalues AS (query2)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH
            names AS (SELECT id, name FROM mytable2),
            allvalues AS (SELECT id, value FROM mytable1)
        SELECT n.id, name, value
        FROM names n
        INNER JOIN allvalues v ON n.id = v.id
        `;
        // const sql = `SELECT name from mytable2`
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'n'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 'n'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 'v'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH names AS (query1) SELECT names.*', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH
            names AS (SELECT id, name FROM mytable2)
        SELECT names.*
        FROM names
        `;
        // const sql = `SELECT name from mytable2`
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'names'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 'names'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH result AS (query1 UNION query2)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH result AS (
            SELECT id as id FROM mytable1
            UNION
            SELECT id as id FROM mytable2
        )
        SELECT *
        FROM result
        `;
        // const sql = `SELECT name from mytable2`
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'result'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH (query with inner join and parameters)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH t1 AS
        (
            SELECT mytable1.*, mytable2.name
            FROM mytable1
            INNER JOIN mytable2 ON mytable1.id = mytable2.id
            WHERE mytable1.value > ? and mytable2.name  = ?
        )
        SELECT t1.*
        FROM t1
        ORDER BY t1.value DESC
        LIMIT 10
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: true,
                    table: 't1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'varchar',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH RECURSIVE seq (n)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH RECURSIVE seq (n) AS
        (
            SELECT 1
            UNION ALL
            SELECT n + 1 FROM seq WHERE n < 5
        )
        SELECT * FROM seq
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'n',
                    type: 'bigint',
                    notNull: true,
                    table: 'seq'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH RECURSIVE conc (a)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH RECURSIVE conc (a) AS
        (
            SELECT CAST('a' AS CHAR(5))
            UNION ALL
            SELECT concat(a, 'a') FROM conc WHERE LENGTH(a) < 5
        )
        SELECT * FROM conc
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'a',
                    type: 'varchar',
                    notNull: true,
                    table: 'conc'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH RECURSIVE cte AS (SELECT 1 AS n ...)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH RECURSIVE cte AS
        (
            SELECT 1 AS n
            UNION ALL
            SELECT n + 1 FROM cte WHERE n < 3
        )
        SELECT * FROM cte
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'n',
                    type: 'bigint',
                    notNull: true,
                    table: 'cte'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH RECURSIVE conc (a)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH RECURSIVE cte AS
        (
        SELECT 1 AS n, CAST('abc' AS CHAR(20)) AS str
        UNION ALL
        SELECT n + 1, CONCAT(str, str) FROM cte WHERE n < 3
        )
        SELECT * FROM cte
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'n',
                    type: 'bigint',
                    notNull: true,
                    table: 'cte'
                },
                {
                    name: 'str',
                    type: 'varchar',
                    notNull: true,
                    table: 'cte'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    //Example from: https://dev.mysql.com/doc/refman/8.0/en/with.html
    it('WITH RECURSIVE dates (date) AS', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH RECURSIVE dates (date) AS
            (
            SELECT MIN(date_column) FROM all_types
            UNION ALL
            SELECT date + INTERVAL 1 DAY FROM dates
            WHERE date + INTERVAL 1 DAY <= (SELECT MAX(date_column) FROM all_types)
            )
        SELECT * FROM dates
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'date',
                    type: 'datetime',
                    notNull: false,
                    table: 'dates'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH RECURSIVE (with inner join and parameters)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH RECURSIVE parent AS (
			SELECT	id,	value FROM	mytable1
			WHERE id = ?
			UNION ALL 
			SELECT	t1.id, t1.value	
			FROM mytable1 t1
			INNER JOIN parent t2 ON t1.id = t2.value
			WHERE t2.value IS NOT NULL
		)
		SELECT id,value FROM parent
		WHERE id <> ?`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'parent'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: false,
                    table: 'parent'
                }
            ],
            parameters: [
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
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH RECURSIVE parent (a, b) (with inner join and parameters)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH RECURSIVE parent (a, b) AS (
			SELECT	id,	value FROM	mytable1
			WHERE id = ?
			UNION ALL 
			SELECT	t1.id, t1.value	
			FROM mytable1 t1
			INNER JOIN parent t2 ON t1.id = t2.a
			WHERE t2.b IS NOT NULL
		)
		SELECT a,b FROM parent
		WHERE a <> ?`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'a',
                    type: 'int',
                    notNull: true,
                    table: 'parent'
                },
                {
                    name: 'b',
                    type: 'int',
                    notNull: false,
                    table: 'parent'
                }
            ],
            parameters: [
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
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('WITH RECURSIVE cte ...SELECT ... INNER JOIN', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH RECURSIVE cte as (
            SELECT     t1.id, 0 as level
            FROM       mytable1 t1
            WHERE      id is null
            UNION ALL
            SELECT     t1.id,
                        level+1 as level
            FROM       cte c
            INNER JOIN mytable1 t1
                    on c.id = t1.id
        )
        SELECT * from cte
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'cte'
                },
                {
                    name: 'level',
                    type: 'bigint',
                    notNull: true,
                    table: 'cte'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('select id, :value from (select id from mytable1 t where t.value = :value) t', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `select id, :value as value from (
            select id from mytable1 t where t.value = :value
        ) t`;
        const expectedSql = `select id, ? as value from (
            select id from mytable1 t where t.value = ?
        ) t`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'int',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'value',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'value',
                    columnType: 'int',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('Infer parameter from with clause', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `WITH names AS (
            SELECT name FROM mytable2 where id = :id
        )
        SELECT name, :id as idFilter from names`;
        const expectedSql = `WITH names AS (
            SELECT name FROM mytable2 where id = ?
        )
        SELECT name, ? as idFilter from names`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'varchar',
                    notNull: false,
                    table: 'names'
                },
                {
                    name: 'idFilter',
                    type: 'int',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'id',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'id',
                    columnType: 'int',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('Infer parameter - union inside with clause', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH
            with1 AS (SELECT id FROM mytable1),
            with2 AS (SELECT :newIndex as id),
            withUnion AS (
                SELECT id FROM with1
                UNION
                SELECT id FROM with2
            )
        SELECT * FROM withUnion`;
        const expectedSql = `
        WITH
            with1 AS (SELECT id FROM mytable1),
            with2 AS (SELECT ? as id),
            withUnion AS (
                SELECT id FROM with1
                UNION
                SELECT id FROM with2
            )
        SELECT * FROM withUnion`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'withUnion'
                }
            ],
            parameters: [
                {
                    name: 'newIndex',
                    columnType: 'int',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT id + 1 FROM mytable1 UNION SELECT ? FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id + 1 as id FROM mytable1
        UNION
        SELECT :newIndex FROM mytable1`;
        const expectedSql = `
        SELECT id + 1 as id FROM mytable1
        UNION
        SELECT ? FROM mytable1`;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'bigint',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'newIndex',
                    columnType: 'bigint',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('3-levels with clause', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH ids AS (
            WITH ids2 AS (
                WITH ids3 AS (SELECT id FROM mytable1)
                SELECT id FROM ids3
            )
            SELECT id FROM ids2
        )
        SELECT id FROM ids
        `;
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    notNull: true,
                    table: 'ids'
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
});
//# sourceMappingURL=parse-select-complex-queries.test.js.map