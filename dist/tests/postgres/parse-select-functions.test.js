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
describe('postgres-parse-select-functions', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    it('select sum(value) from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select sum(value) from mytable1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'sum', //different from mysql and sqlite
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
    it('select sum(value) from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select sum(value) as total from mytable1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'total',
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
    it('select sum(t1.value) as total from mytable1 t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select sum(t1.value) as total from mytable1 t1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'total',
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
    it('select count(id) from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select count(id) from mytable1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'count',
                    type: 'int8',
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
    it('select count(*) from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select count(*) from mytable1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'count',
                    type: 'int8',
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
    it('select sum(2*value) from  mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select sum(2*value) from  mytable1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'sum',
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
    it('select avg(value) from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select avg(value) from mytable1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'avg',
                    type: 'numeric',
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
    it('select avg(value + (value + ?)) from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select avg(value + (value + :value)) from mytable1';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'select avg(value + (value + $1)) from mytable1',
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'avg',
                    type: 'numeric',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: [
                {
                    type: 'int4',
                    name: 'value',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select avg(value + (value + coalesce(?, 10))) from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select avg(value + (value + coalesce(:value, 10))) from mytable1';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'select avg(value + (value + coalesce($1, 10))) from mytable1',
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'avg',
                    type: 'numeric',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: [
                {
                    type: 'int4',
                    name: 'value',
                    notNull: false
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT id FROM mytable1 WHERE coalesce(abs($1), id) = 1 and coalesce($2, id) = 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id
		FROM mytable1
		WHERE coalesce(abs(:id1::int4), id) = 1 OR coalesce(:id2, id) = 2
        `;
        const expectedSql = `
        SELECT id
		FROM mytable1
		WHERE coalesce(abs($1::int4), id) = 1 OR coalesce($2, id) = 2
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'id1',
                    type: 'int4',
                    notNull: false
                },
                {
                    name: 'id2',
                    type: 'int4',
                    notNull: false
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse a select with SUM and with expression from multiple tables', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select sum(t2.id + (t1.value + 2)) from mytable1 t1 inner join mytable2 t2 on t1.id = t2.id
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'sum',
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
    it(`SELECT STR_TO_DATE('21/5/2013','%d/%m/%Y')`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
       SELECT TO_DATE('21/5/2013', 'DD/MM/YYYY');
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: `to_date`,
                    type: 'date',
                    notNull: true, // //PostgreSQL gives an error for an invalid date, while MySQL returns NULL;
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
    it('EXTRACT(MONTH FROM timestamp_column)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
         select
			EXTRACT(MONTH FROM t.timestamp_column) as month1,
			EXTRACT(MONTH FROM t.timestamp_not_null_column) as month2,
			EXTRACT(MONTH FROM t.timestamptz_column) as month3,
			EXTRACT(MONTH FROM t.timestamptz_not_null_column) as month4
        from all_types t
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'month1',
                    type: 'float8',
                    notNull: false,
                    table: ''
                },
                {
                    name: 'month2',
                    type: 'float8',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'month3',
                    type: 'float8',
                    notNull: false,
                    table: ''
                },
                {
                    name: 'month4',
                    type: 'float8',
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
    it('parse select without from clause', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select 10, CONCAT_WS('a', 'b'), 'a' as name
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: '?column?', //different from mysql and sqlite
                    type: 'int4',
                    notNull: true,
                    table: ''
                },
                {
                    name: `concat_ws`, //If the separator is NULL, the result is NULL.
                    type: 'text',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'name',
                    type: 'text',
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
    //TODO - infer param types
    it('parse a select with STR_TO_DATE and CONCAT_WS function', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT TO_DATE(CONCAT_WS('/', $1::text, $2::text, $3::text),'DD/MM/YYYY')
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: `to_date`,
                    type: 'date',
                    notNull: true, //PostgreSQL gives an error for an invalid date, while MySQL returns NULL;
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'text',
                    notNull: true
                },
                {
                    name: 'param2',
                    type: 'text',
                    notNull: true
                },
                {
                    name: 'param3',
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
    it('parse a select with STR_TO_DATE and CONCAT_WS function', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT TO_DATE(COALESCE(:date, null),'DD/MM/YYYY')`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: `SELECT TO_DATE(COALESCE($1, null),'DD/MM/YYYY')`,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: `to_date`,
                    type: 'date',
                    notNull: false, //TO_DATE(null, 'DD/MM/YYYY')
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'date',
                    type: 'text',
                    notNull: false
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT datediff(:date1, :date2) as days_stayed', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT :date1::date - :date2::date as days_stayed';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'SELECT $1::date - $2::date as days_stayed',
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'days_stayed',
                    type: 'int4',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'date1',
                    type: 'date',
                    notNull: true
                },
                {
                    name: 'date2',
                    type: 'date',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse a select with datediff function', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT (TO_DATE(CONCAT_WS('/', $1::text, $2::text, $3::text), 'DD/MM/YYYY') - TO_DATE('01/01/2020', 'DD/MM/YYYY')) AS days_stayed
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'days_stayed',
                    type: 'int4',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'text',
                    notNull: true
                },
                {
                    name: 'param2',
                    type: 'text',
                    notNull: true
                },
                {
                    name: 'param3',
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
    it(`SELECT IFNULL(NULL, 'yes') as result1, IFNULL('10', 'yes') as result2`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT coalesce(NULL, 'yes') as result1, coalesce('10', 'yes') as result2
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'result1',
                    type: 'text',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'result2',
                    type: 'text',
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
    it('SELECT IFNULL(value, id) as result from mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT coalesce(value, id) as result from mytable1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'result',
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
    it('SELECT GROUP_CONCAT(name) FROM mytable2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT STRING_AGG(name, ', ') FROM mytable2
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'string_agg',
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
    it('SELECT GROUP_CONCAT(id) FROM mytable2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT STRING_AGG(id::text, ', ') FROM mytable2
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'string_agg',
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
    it(`SELECT GROUP_CONCAT(DISTINCT name ORDER BY id DESC SEPARATOR ';') FROM mytable2`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
       	SELECT STRING_AGG(DISTINCT name, ';' ORDER BY name DESC) AS result
		FROM mytable2;
        `; //different from mysql; must use the displayed column (name) in the ORDER BY
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'result',
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
    it(`SELECT NULLIF(?, 'a') FROM mytable1`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT NULLIF($1, 'a') FROM mytable1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'nullif',
                    type: 'text',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: [
                {
                    type: 'text',
                    name: 'param1',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT generate_series(1, 12) AS month', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
         SELECT generate_series(1, 12) AS month
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'month',
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
    it(`SELECT to_tsvector(name) as tsvector_result, to_tsquery('one') as tsquery_result from mytable2`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
         SELECT
		 	to_tsvector(name) as tsvector_result,
			to_tsvector('str') as tsvector_result2,
			to_tsquery('one') as tsquery_result,
			to_tsquery(null) as tsquery_result2
		from mytable2
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'tsvector_result',
                    type: 'tsvector',
                    notNull: false,
                    table: ''
                },
                {
                    name: 'tsvector_result2',
                    type: 'tsvector',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'tsquery_result',
                    type: 'tsquery',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'tsquery_result2',
                    type: 'tsquery',
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
    it(`SELECT name from mytable2 to_tsvector(name) @@ to_tsquery('one')`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT name FROM mytable2 WHERE to_tsvector(name) @@ to_tsquery(:query)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'SELECT name FROM mytable2 WHERE to_tsvector(name) @@ to_tsquery($1)',
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'text',
                    notNull: false,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'query',
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
    it(`SELECT name, ts_rank(...) from mytable2 WHERE to_tsvector(name) @@ to_tsquery('one')`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
         SELECT
		 	name,
		 	ts_rank(to_tsvector('one'), to_tsquery(:query)) as rank,
		 	ts_rank(to_tsvector(null), to_tsquery(:query)) as rank2
		 FROM mytable2
		 WHERE to_tsvector(name) @@ to_tsquery(:query)
		 ORDER BY rank`;
        const expectedSql = `
         SELECT
		 	name,
		 	ts_rank(to_tsvector('one'), to_tsquery($1)) as rank,
		 	ts_rank(to_tsvector(null), to_tsquery($1)) as rank2
		 FROM mytable2
		 WHERE to_tsvector(name) @@ to_tsquery($1)
		 ORDER BY rank`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'text',
                    notNull: false,
                    table: 'mytable2'
                },
                {
                    name: 'rank',
                    type: 'float4',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'rank2',
                    type: 'float4',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'query',
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
    it(`SELECT name from mytable2 to_tsvector(name) @@ to_tsquery('one')`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
         SELECT
		 	plainto_tsquery(:query) as plain,
			plainto_tsquery(name) as plain2,
			phraseto_tsquery(:query) as phrase,
			phraseto_tsquery(name) as phrase2,
			websearch_to_tsquery(:query) as web,
			websearch_to_tsquery(name) as web2
		 FROM mytable2`;
        const expectedSql = `
         SELECT
		 	plainto_tsquery($1) as plain,
			plainto_tsquery(name) as plain2,
			phraseto_tsquery($1) as phrase,
			phraseto_tsquery(name) as phrase2,
			websearch_to_tsquery($1) as web,
			websearch_to_tsquery(name) as web2
		 FROM mytable2`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'plain',
                    type: 'tsquery',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'plain2',
                    type: 'tsquery',
                    notNull: false,
                    table: ''
                },
                {
                    name: 'phrase',
                    type: 'tsquery',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'phrase2',
                    type: 'tsquery',
                    notNull: false,
                    table: ''
                },
                {
                    name: 'web',
                    type: 'tsquery',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'web2',
                    type: 'tsquery',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: [
                {
                    name: 'query',
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
});
//# sourceMappingURL=parse-select-functions.test.js.map