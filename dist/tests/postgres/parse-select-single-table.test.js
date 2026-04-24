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
describe('postgres-select-single-table', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    it('SELECT id FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1';
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
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT id as name FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id as name FROM mytable1';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'int4',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM mytable1';
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
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT mytable1.* FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT mytable1.* FROM mytable1';
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
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT t.* FROM mytable1 t', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT t.* FROM mytable1 t';
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
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT mytable1.id, mytable1.value FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT mytable1.id, mytable1.value FROM mytable1';
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
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT id, name, descr as description FROM mytable2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id, name, descr as description FROM mytable2';
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
                    table: 'mytable2'
                },
                {
                    name: 'name',
                    type: 'text',
                    notNull: false,
                    table: 'mytable2'
                },
                {
                    name: 'description',
                    type: 'text',
                    notNull: false,
                    table: 'mytable2'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT distinct id, value FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT distinct id, value FROM mytable1';
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
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse select distinct *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT distinct * FROM mytable1';
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
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT id FROM mydb.mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM public.mytable1';
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
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM mytable1 WHERE id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM mytable1 WHERE id = $1';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'mytable1'
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
    it('CASE INSENSITIVE - SELECT * FROM MYTABLE1 WHERE ID = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT ID FROM MYTABLE1 WHERE ID = $1';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
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
    it('parse a select with a single parameter (not using *)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 WHERE id = $1 and value = 10';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
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
    it('SELECT value FROM mytable1 WHERE id = ? or value > ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT value FROM mytable1 WHERE id = $1 or value > $2';
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
                    table: 'mytable1'
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
    it('SELECT name FROM mytable2 m WHERE (:name::text is null or m.name = :name) AND m.descr = :descr', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT name FROM mytable2 m WHERE (:name::text is null or m.name = :name) AND m.descr = :descr';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'SELECT name FROM mytable2 m WHERE ($1::text is null or m.name = $1) AND m.descr = $2',
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'text',
                    notNull: false,
                    table: 'm'
                }
            ],
            parameters: [
                {
                    name: 'name',
                    type: 'text',
                    notNull: false
                },
                {
                    name: 'descr',
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
    it('SELECT id FROM mytable1 where value between :start and :end', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 where value between :start and :end';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'SELECT id FROM mytable1 where value between $1 and $2',
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
                    name: 'start',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'end',
                    type: 'int4',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse a select with multiples params', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT $1 as name, id, descr as description
        FROM mytable2 
        WHERE (name = $2 or descr = $3) and id > $4
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'text', //different from sqlite
                    notNull: true,
                    table: ''
                },
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'mytable2'
                },
                {
                    name: 'description',
                    type: 'text',
                    notNull: false,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'text', //differente from sqlite
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
                },
                {
                    name: 'param4',
                    type: 'int4',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM mytable1 t WHERE id in (1, 2, 3, ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM mytable1 t WHERE id in ($1)';
        const expectedSql = `SELECT * FROM mytable1 t WHERE id in (\${generatePlaceholders('$1', params.param1)})`;
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
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4[]',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT id::int4 FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id::int2 FROM mytable1';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int2',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM mytable1 t WHERE id in (1, 2, 3, ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM mytable1 t WHERE id in (1, 2, 3, $1)';
        const expectedSql = `SELECT * FROM mytable1 t WHERE id in (1, 2, 3, \${generatePlaceholders('$1', params.param1)})`;
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
                    table: 't'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 't'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4[]',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse select with CASE WHEN', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN id = 1 THEN 'one'
					WHEN id = 2 THEN 'two'
				END as id
			FROM mytable1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'text',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse select with CASE WHEN ... ELSE', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN id = 1 THEN 'one'
					WHEN id = 2 THEN 'two'
					ELSE 'other'
				END as id
			FROM mytable1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'text',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse select with CASE WHEN ... ELSE', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN id = 1 THEN 'one'
					WHEN id = 2 THEN  null
					ELSE 'other'
				END as id
			FROM mytable1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'text',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse select with CASE WHEN using IN operator', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			select id from mytable2 where $1 in (
				SELECT
					CASE
						WHEN id = 1 THEN 'one'
						WHEN id = 2 THEN 'two'
					END
				FROM mytable1
			)
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
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'text',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT SUM(ID) as sumById FROM mytable1 t1 GROUP BY id', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT SUM(ID) as "sumById"
        FROM mytable1 t1
        GROUP BY id
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'sumById',
                    type: 'int8',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select id as alias from mytable1 group by alias', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id as alias 
		from mytable1
		group by alias
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'alias',
                    type: 'int4',
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse select using ANY operator', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from mytable1 where value > any(select id from mytable2 where name like $1)
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
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
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
    it('parse select using ANY operator with parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from mytable1 where $1 > any(select id from mytable2 where name like $2)
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
                    table: 'mytable1'
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
    it('parse select using ANY operator with parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from mytable1 where id > any($1)
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
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: '_int4',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select value from mytable1 where value is not null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select value from mytable1 where value is not null or (id > 0 and value is not null)
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
                    notNull: true,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select id from mytable1 where 1 = 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from mytable1 where 1 = 1
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
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`select enum_column from all_types where enum_column = 'medium' or 'small' = enum_column`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			select enum_column from all_types where enum_column = 'medium' or 'small' = enum_column
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'enum_column',
                    type: `enum('x-small','small','medium','large','x-large')`,
                    notNull: true,
                    table: 'all_types'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`select enum_constraint from all_types where enum_constraint = 'medium' or 'short' = enum_constraint`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			select enum_constraint from all_types where enum_constraint = 'medium' or 'short' = enum_constraint
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'enum_constraint',
                    type: `enum('x-small','small','medium','large','x-large')`,
                    notNull: true,
                    table: 'all_types'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`select enum_constraint from all_types where enum_constraint = $1`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			select enum_constraint from all_types where enum_constraint = $1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'enum_constraint',
                    type: `enum('x-small','small','medium','large','x-large')`,
                    notNull: true,
                    table: 'all_types'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: `enum('x-small','small','medium','large','x-large')`,
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`select enum_constraint from all_types`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			select integer_column_default, enum_column, enum_column_default, enum_constraint, enum_constraint_default from all_types
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'integer_column_default',
                    type: 'int4',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'enum_column',
                    type: `enum('x-small','small','medium','large','x-large')`,
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'enum_column_default',
                    type: `enum('x-small','small','medium','large','x-large')`,
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'enum_constraint',
                    type: `enum('x-small','small','medium','large','x-large')`,
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'enum_constraint_default',
                    type: `enum('x-small','small','medium','large','x-large')`,
                    notNull: false,
                    table: 'all_types'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select value from mytable1 order by ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select value from mytable1 order by :orderBy';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'select value from mytable1 order by ${buildOrderBy(params.orderBy)}',
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            orderByColumns: ['id', 'value'],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select value as myValue from mytable1 order by ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select value as myvalue from mytable1 order by $1';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'select value as myvalue from mytable1 order by ${buildOrderBy(params.orderBy)}',
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'myvalue',
                    type: 'int4',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            orderByColumns: ['id', 'value', 'myvalue'],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select value from mytable1 order by value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			select value from mytable1 order by value
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
                    table: 'mytable1'
                }
            ],
            //shouldn't include order by columns because there is no parameters on the order by clause
            //orderByColumns: ['id', 'value'],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('order by with case when expression', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select value, case when value = 1 then 1 else 2 end as ordering from mytable1 order by $1';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'select value, case when value = 1 then 1 else 2 end as ordering from mytable1 order by ${buildOrderBy(params.orderBy)}',
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'mytable1'
                },
                {
                    name: 'ordering',
                    type: 'int4',
                    notNull: true,
                    table: ''
                }
            ],
            orderByColumns: ['id', 'value', 'ordering'],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('order by with subselect', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			select value from (
			select id, value, case when value = 1 then 1 else 2 end as ordering from mytable1
			) t order by $1`;
        const expectedSql = `
			select value from (
			select id, value, case when value = 1 then 1 else 2 end as ordering from mytable1
			) t order by \${buildOrderBy(params.orderBy)}`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 't'
                }
            ],
            orderByColumns: ['id', 'value', 'ordering'],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select with order by function', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			select name from mytable2 order by concat(name, $1::text)
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
                    table: 'mytable2'
                }
            ],
            //only return order by columns for expressions like "order by $1"
            //orderByColumns: [],
            parameters: [
                {
                    name: 'param1',
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
    it('remove the ordering column from select', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			select value from (
			select id, value, case when value = 1 then 1 else 2 end from mytable1
			) t order by $1`;
        const expectedSql = `
			select value from (
			select id, value, case when value = 1 then 1 else 2 end from mytable1
			) t order by \${buildOrderBy(params.orderBy)}`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: expectedSql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 't'
                }
            ],
            orderByColumns: ['id', 'value', 'case'],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT id FROM mytable1 LIMIT ?, ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 LIMIT $1 OFFSET $2';
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
                    table: 'mytable1'
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    type: 'int8',
                    notNull: true
                },
                {
                    name: 'param2',
                    type: 'int8',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT "id", "mytable1"."value" from "mytable1" where "mytable1"."id" = 0', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT "id", "mytable1"."value" from "mytable1" where "mytable1"."id" = 0;';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('multipleRowsResult for table with composite key: where key1 = 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select key1, key2 from composite_key where key1 = 1';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'key1',
                    type: 'int4',
                    notNull: true,
                    table: 'composite_key'
                },
                {
                    name: 'key2',
                    type: 'int4',
                    notNull: true,
                    table: 'composite_key'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('multipleRowsResult for table with composite key: where key1 = 1 and key2 = 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select key1, key2 from composite_key where key1 = 1 and key2 = 2';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'key1',
                    type: 'int4',
                    notNull: true,
                    table: 'composite_key'
                },
                {
                    name: 'key2',
                    type: 'int4',
                    notNull: true,
                    table: 'composite_key'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('multipleRowsResult for table with composite key: where 1 = key2 and 2 = key1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select key1, key2 from composite_key where 1 = key2 and 2 = key1';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'key1',
                    type: 'int4',
                    notNull: true,
                    table: 'composite_key'
                },
                {
                    name: 'key2',
                    type: 'int4',
                    notNull: true,
                    table: 'composite_key'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('multipleRowsResult for table with composite key: where key1 = 1 and key2 > 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select key1, key2 from composite_key where key1 = 1 and key2 > 2';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'key1',
                    type: 'int4',
                    notNull: true,
                    table: 'composite_key'
                },
                {
                    name: 'key2',
                    type: 'int4',
                    notNull: true,
                    table: 'composite_key'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('multipleRowsResult for table with composite key: where key1 = 1 and key2 = 2 or key2 = 3', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select key1, key2 from composite_key where key1 = 1 and key2 = 2 or key2 = 3';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'key1',
                    type: 'int4',
                    notNull: true,
                    table: 'composite_key'
                },
                {
                    name: 'key2',
                    type: 'int4',
                    notNull: true,
                    table: 'composite_key'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT id FROM mytable2 (id, name, descr) = ($1, $2, $3)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable2 WHERE (id, name, descr) = (:id, :name, :descr)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'SELECT id FROM mytable2 WHERE (id, name, descr) = ($1, $2, $3)',
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'name',
                    type: 'text',
                    notNull: true
                },
                {
                    name: 'descr',
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
    it('SELECT id FROM mytable2 WHERE row(id, name, descr) = row($1, $2, $3)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable2 WHERE row(id, name, descr) = row(:id, :name, :descr)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'SELECT id FROM mytable2 WHERE row(id, name, descr) = row($1, $2, $3)',
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'mytable2'
                }
            ],
            parameters: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'name',
                    type: 'text',
                    notNull: true
                },
                {
                    name: 'descr',
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
    it(`SELECT id FROM (VALUES (1, 'a'), (2, 'b')) AS t(id, name)`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT id, name FROM (VALUES (1, 'a'), (2, 'b')) AS t(id, name)`;
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
                    table: 't'
                },
                {
                    name: 'name',
                    type: 'text',
                    notNull: true,
                    table: 't'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`SELECT id FROM (VALUES (1, 'a'), (2, 'b')) AS t(id, name)`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `select unnest(array[1, 2, 3]) as val1, unnest(array['a', 'b', null]) as val2`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'val1',
                    type: 'int4',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'val2',
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
    it('SELECT id FROM mytable1 ORDER BY id DESC FETCH FIRST 10 ROWS ONLY', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 ORDER BY id DESC FETCH FIRST 10 ROWS ONLY';
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
                    table: 'mytable1'
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
//# sourceMappingURL=parse-select-single-table.test.js.map