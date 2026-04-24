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
const parser_1 = require("../../src/sqlite-query-analyzer/parser");
const create_schema_1 = require("../mysql-query-analyzer/create-schema");
describe('sqlite-parse-select-complex-queries', () => {
    it('parse SELECT t1.name, t2.mycolumn2, t3.mycolumn3, count', () => {
        //mytable1 (id, value); mytable2 (id, name, descr); mytable3 (id)
        const sql = `
        SELECT t1.value, t2.name, t3.id, count(*) AS quantity
        FROM mytable1 t1
        INNER JOIN mytable2 t2 ON t2.id = t1.id
        LEFT JOIN mytable3 t3 ON t3.id = t2.id
        GROUP BY t1.value, t2.name, t3.id
        HAVING count(*) > 1
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'TEXT',
                    notNull: false,
                    table: 't2'
                },
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: false,
                    table: 't3'
                },
                {
                    name: 'quantity',
                    notNull: true,
                    type: 'INTEGER',
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('HAVING value > ?', () => {
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
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'TEXT',
                    notNull: true,
                    table: 'mytable3'
                },
                {
                    name: 'value',
                    type: 'REAL',
                    notNull: true, //diff from mysql
                    table: 'mytable3'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'REAL',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('HAVING value > ? and ? <', () => {
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
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'TEXT',
                    notNull: true,
                    table: 'mytable3'
                },
                {
                    name: 'value',
                    type: 'REAL',
                    notNull: true, //diff from mysql
                    table: 'mytable3'
                },
                {
                    name: 'id',
                    type: 'REAL',
                    notNull: true, //diff from mysql
                    table: '' //TODO - could be mytable3?
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'REAL',
                    notNull: true
                },
                {
                    name: 'param3',
                    columnType: 'REAL',
                    notNull: true
                },
                {
                    name: 'param4',
                    columnType: 'REAL',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('parse a select with UNION', () => {
        const sql = `
        SELECT id FROM mytable1
        UNION
        SELECT id FROM mytable2
        UNION
        SELECT id FROM mytable3
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
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
    });
    it('subselect in column', () => {
        const sql = `
        SELECT (SELECT name FROM mytable2 where id = t1.id) as fullname
        FROM mytable1 t1
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'fullname',
                    type: 'TEXT',
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
    });
    it('subselect in column (with parameter)', () => {
        const sql = `
        SELECT (SELECT name as namealias FROM mytable2 where id = ?) as fullname
        FROM mytable1 t1
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'fullname',
                    type: 'TEXT',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('WITH names AS ( SELECT name FROM mytable2 )', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH names AS ( 
            SELECT name FROM mytable2
        )
        SELECT name from names
        `;
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'TEXT',
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
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'n'
                },
                {
                    name: 'name',
                    type: 'TEXT',
                    notNull: false,
                    table: 'n'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
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
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'names'
                },
                {
                    name: 'name',
                    type: 'TEXT',
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
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
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
    it('WITH (query with inner join and parameters)', () => {
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
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'TEXT',
                    notNull: true,
                    table: 't1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'TEXT',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('WITH RECURSIVE seq (n)', () => {
        const sql = `
        WITH RECURSIVE seq (n) AS
        (
            SELECT 1
            UNION ALL
            SELECT n + 1 FROM seq WHERE n < 5
        )
        SELECT * FROM seq
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'n',
                    type: 'INTEGER',
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
    });
    it('WITH RECURSIVE conc (a)', () => {
        const sql = `
        WITH RECURSIVE conc (a) AS
        (
            SELECT 'a'
            UNION ALL
            SELECT concat(a, 'a') FROM conc WHERE LENGTH(a) < 5
        )
        SELECT * FROM conc
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'a',
                    type: 'TEXT',
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
    });
    it('WITH RECURSIVE cte AS (SELECT 1 AS n ...)', () => {
        const sql = `
        WITH RECURSIVE cte AS
        (
            SELECT 1 AS n
            UNION ALL
            SELECT n + 1 FROM cte WHERE n < 3
        )
        SELECT * FROM cte
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'n',
                    type: 'INTEGER',
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
    });
    it('WITH RECURSIVE conc (a)', () => {
        const sql = `
        WITH RECURSIVE cte AS
        (
        SELECT 1 AS n, 'abc' AS str
        UNION ALL
        SELECT n + 1, CONCAT(str, str) FROM cte WHERE n < 3
        )
        SELECT * FROM cte
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'n',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'cte'
                },
                {
                    name: 'str',
                    type: 'TEXT',
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
    });
    it('WITH RECURSIVE dates (date) AS', () => {
        const sql = `
        WITH RECURSIVE dates (date) AS
            (
            SELECT MIN(date(date_column, 'auto')) FROM all_types
            UNION ALL
            SELECT date(date, '+1 day') FROM dates
            WHERE date(date, '+1 day') <= (SELECT MAX(date(date_column, 'auto')) FROM all_types)
            )
        SELECT * FROM dates
        `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'date',
                    type: 'DATE',
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
    });
    it('WITH RECURSIVE (with inner join and parameters)', () => {
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
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'parent'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'parent'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('WITH RECURSIVE parent (a, b) (with inner join and parameters)', () => {
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
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'a',
                    type: 'INTEGER',
                    notNull: true,
                    table: 'parent'
                },
                {
                    name: 'b',
                    type: 'INTEGER',
                    notNull: false,
                    table: 'parent'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'param2',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('select id, :value from (select id from mytable1 t where t.value = :value) t', () => {
        const sql = `select id, :value as value from (
            select id from mytable1 t where t.value = :value
        ) t`;
        const expectedSql = `select id, ? as value from (
            select id from mytable1 t where t.value = ?
        ) t`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true,
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('Infer parameter from with clause', () => {
        const sql = `WITH names AS (
            SELECT name FROM mytable2 where id = :id
        )
        SELECT name, :id as idFilter from names`;
        const expectedSql = `WITH names AS (
            SELECT name FROM mytable2 where id = ?
        )
        SELECT name, ? as idFilter from names`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'TEXT',
                    notNull: false,
                    table: 'names'
                },
                {
                    name: 'idFilter',
                    type: 'INTEGER',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'id',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'id',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
});
//# sourceMappingURL=sqlite-parse-select-complex-queries.test.js.map