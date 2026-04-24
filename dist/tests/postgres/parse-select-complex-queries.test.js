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
const describe_1 = require("../../src/postgres-query-analyzer/describe");
const schema_1 = require("./schema");
describe('parse-select-complex-queries', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
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
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'text',
                    notNull: false,
                    table: 't2'
                },
                {
                    name: 'id',
                    type: 'int4',
                    notNull: false,
                    table: 't3'
                },
                {
                    name: 'quantity',
                    notNull: true,
                    type: 'int8',
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
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
            SUM(double_value) > $1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'text',
                    notNull: true,
                    table: 'mytable3'
                },
                {
                    name: 'value',
                    type: 'float4',
                    notNull: false, //SUM(double_value) > $1; then notNull should be true
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'float4',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('HAVING value > ? and ? <', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
            name,
            SUM(double_value) as value,
            SUM(double_value * 0.01) as id
        FROM mytable3
        WHERE id > $1 -- this id is from mytable3 column
        GROUP BY
            name
        HAVING
            SUM(double_value) > $2
            and SUM(double_value * 0.01) < $3 -- this id is from the SELECT alias
            AND SUM(double_value) = $4

        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'text',
                    notNull: true,
                    table: 'mytable3'
                },
                {
                    name: 'value',
                    type: 'float4',
                    notNull: false,
                    table: ''
                },
                {
                    name: 'id',
                    type: 'float8',
                    notNull: false,
                    table: '' //TODO - could be mytable3?
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'param2',
                    type: 'float4',
                    notNull: true
                },
                {
                    name: 'param3',
                    type: 'float8',
                    notNull: true
                },
                {
                    name: 'param4',
                    type: 'float4',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse a select with UNION', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id FROM mytable1
        UNION
        SELECT id FROM mytable2
        UNION
        SELECT id FROM mytable3
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse a select with UNION (int4_column + int8_column)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
            SELECT int4_column as col FROM all_types
			UNION
			SELECT int8_column as col FROM all_types
            `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'col',
                    type: 'int8',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('subselect in column', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT (SELECT name FROM mytable2 where id = t1.id) as fullname
        FROM mytable1 t1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'fullname',
                    type: 'text',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('subselect in column (with parameter)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT (SELECT name as namealias FROM mytable2 where id = $1) as fullname
        FROM mytable1 t1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'fullname',
                    type: 'text',
                    notNull: false,
                    table: '' //TODO - subselect table name should be ''
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('WITH names AS ( SELECT name FROM mytable2 )', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH names AS (
            SELECT name FROM mytable2
        )
        SELECT name from names
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'text',
                    notNull: false,
                    table: 'names'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
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
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'n'
                },
                {
                    name: 'name',
                    type: 'text',
                    notNull: false,
                    table: 'n'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'v'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('WITH names AS (query1), allvalues AS (query2)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
       	WITH
            names AS (SELECT id, name FROM mytable2),
            allvalues AS (SELECT t1.id, name FROM mytable1 t1 INNER JOIN names n ON t1.id = n.id)
        SELECT * from allvalues;
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'allvalues'
                },
                {
                    name: 'name',
                    type: 'text',
                    notNull: false,
                    table: 'allvalues'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('WITH names AS (query1) SELECT names.*', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH
            names AS (SELECT id, name FROM mytable2)
        SELECT names.*
        FROM names
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'names'
                },
                {
                    name: 'name',
                    type: 'text',
                    notNull: false,
                    table: 'names'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
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
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'result'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('WITH (query with inner join and parameters)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        WITH t1 AS
        (
            SELECT mytable1.*, mytable2.name
            FROM mytable1
            INNER JOIN mytable2 ON mytable1.id = mytable2.id
            WHERE mytable1.value > $1 and mytable2.name = $2
        )
        SELECT t1.*
        FROM t1
        ORDER BY t1.value DESC
		LIMIT 100
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: true,
                    table: 't1'
                },
                {
                    name: 'name',
                    type: 'text',
                    notNull: true,
                    table: 't1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'param2',
                    type: 'text',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
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
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'n',
                    type: 'int4',
                    notNull: true,
                    table: 'seq'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('WITH RECURSIVE conc (a)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			WITH RECURSIVE conc (a) AS
			(
				SELECT 'a'
				UNION ALL
				SELECT concat(a, 'a') FROM conc WHERE LENGTH(a) < 5
			)
			SELECT * FROM conc
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'a',
                    type: 'text',
                    notNull: true,
                    table: 'conc'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
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
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'n',
                    type: 'int4',
                    notNull: true,
                    table: 'cte'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('WITH RECURSIVE conc (a)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			WITH RECURSIVE cte AS
			(
			SELECT 1 AS n, 'abc' AS str
			UNION ALL
			SELECT n + 1, CONCAT(str, str) FROM cte WHERE n < 3
			)
			SELECT * FROM cte
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'n',
                    type: 'int4',
                    notNull: true,
                    table: 'cte'
                },
                {
                    name: 'str',
                    type: 'text',
                    notNull: true,
                    table: 'cte'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('WITH RECURSIVE dates (date) AS', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			WITH RECURSIVE dates(date) AS (
				SELECT MIN(date_column)::timestamp FROM all_types
				UNION ALL
				SELECT date + INTERVAL '1 day' FROM dates
				WHERE date + INTERVAL '1 day' <= (SELECT MAX(date_column) FROM all_types)
			)
			SELECT * FROM dates
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'date',
                    type: 'timestamp',
                    notNull: false,
                    table: 'dates'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('WITH RECURSIVE (with inner join and parameters)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			WITH RECURSIVE parent AS (
				SELECT	id,	value FROM mytable1
				WHERE id = $1
				UNION ALL 
				SELECT	t1.id + 1, t1.value	
				FROM mytable1 t1
				INNER JOIN parent t2 ON t1.id = t2.value
				WHERE t2.value IS NOT null and t2.value < 10
			)
			SELECT id, value FROM parent
			WHERE id <> $2`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'parent'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'parent'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'param2',
                    type: 'int4',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('WITH RECURSIVE parent (a, b) (with inner join and parameters)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			WITH RECURSIVE parent (a, b) AS (
				SELECT	id,	value FROM	mytable1
				WHERE id = $1
				UNION ALL 
				SELECT	t1.id + 1, t1.value	
				FROM mytable1 t1
				INNER JOIN parent t2 ON t1.id = t2.a
				WHERE t2.b IS NOT null and t2.b < 10
			)
			SELECT a,b FROM parent
			WHERE a <> $2`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'a',
                    type: 'int4',
                    notNull: true,
                    table: 'parent'
                },
                {
                    name: 'b',
                    type: 'int4',
                    notNull: false,
                    table: 'parent'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'param2',
                    type: 'int4',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
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
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'cte'
                },
                {
                    name: 'level',
                    type: 'int4',
                    notNull: true,
                    table: 'cte'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
});
//# sourceMappingURL=parse-select-complex-queries.test.js.map