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
describe('postgres-parse-select-subqueries', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    it('parse a select with nested select', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (
            select id from mytable1
        ) t
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
    it('parse a select with nested select2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id, name from (
            select t1.id, t2.name from mytable1 t1
            inner join mytable2 t2 on t1.id = t2.id
        ) t
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
                    table: 't'
                },
                {
                    name: 'name',
                    type: 'text',
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
    it('parse a select with nested select and alias', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (
            select value as id from mytable1
        ) t1
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
                    notNull: false,
                    table: 't1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse a select with nested select and alias 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id as code from (
            select value as id from mytable1
        ) t1
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'code',
                    type: 'int4',
                    notNull: false,
                    table: 't1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select * from (subquery)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select * from (
            select name, name as id from mytable2
        ) t2
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
                    table: 't2'
                },
                {
                    name: 'id',
                    type: 'text',
                    notNull: false,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    //explain returns rows=1
    it('select * from (subquery) where', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select * from (
            select name, name as id from mytable2
        ) t2
        WHERE t2.id = $1 and t2.name = $2
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
                    table: 't2'
                },
                {
                    name: 'id',
                    type: 'text',
                    notNull: true,
                    table: 't2'
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
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse a select with 3-levels nested select', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (
            select id from (
                select id from mytable1
            ) t1
        ) t2
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
                    table: 't2'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse a select with 3-levels nested select and case expression', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (
            select id from (
                select id+id as id from mytable1
            ) t1
        ) t2
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
                    table: 't2'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('nested with *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT * from (select * from (select id, name from mytable2) t1) t2
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
                    table: 't2'
                },
                {
                    name: 'name',
                    type: 'text',
                    notNull: false,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse a select with 3-levels nested select (with alias)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (
            select matricula as id from (
                select name as matricula from mytable2
            ) t1
        ) t2
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
                    table: 't2'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse a select with 3-levels nested select and union', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (
            select id from (
                select id from (
                    select name as id from mytable3 -- different from mysql
                    union
                    select name as id from mytable2
                ) t1
            ) t2
        ) t3
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
                    table: 't3'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('parse a select with 3-levels nested select and union int return', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select id from (
            select id from (
                select id from (
                    select id from mytable1
                    union
                    select id from mytable2
                ) t1
            ) t2
        ) t3
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
                    table: 't3'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select name from mytable1, (select count(*) as name from mytable2) t2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable1, (select count(*) as name from mytable2) t2
        `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'name',
                    type: 'int8',
                    notNull: true,
                    table: 't2'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select name from mytable2 where exists ( select id from mytable1 where value = ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        select name from mytable2 where exists ( select id from mytable1 where value = $1)
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
    it('select name from mytable2 where not exists ( select id from mytable1 where id = :a and value = :b)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select name from mytable2 where not exists ( select id from mytable1 where id = :a and value = :b)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'select name from mytable2 where not exists ( select id from mytable1 where id = $1 and value = $2)',
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
                    name: 'a',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'b',
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
    it('SELECT * from (SELECT * FROM mytable1) as t1 WHERE t1.id > ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id from (SELECT * FROM mytable1) as t1 WHERE t1.id > $1
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
    it('SELECT id, exists(SELECT 1 FROM mytable2 t2 where t2.id = t1.id) as has from mytable1 t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id, exists(SELECT 1 FROM mytable2 t2 where t2.id = t1.id) as has from mytable1 t1
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
                    name: 'has',
                    type: 'bool',
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
    it('SELECT id, (select max(id) from mytable2 m2 where m2.id =1) as subQuery FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT
			id, (select max(id) from mytable2 m2 where m2.id =1) as subQuery
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
                    type: 'int4',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'subquery',
                    type: 'int4',
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
    it('SELECT id, exists(SELECT min(id) FROM mytable2 t2 where t2.id = t1.id) as has from mytable1 t1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT id, exists(SELECT min(id) FROM mytable2 t2 where t2.id = t1.id) as has from mytable1 t1
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
                    name: 'has',
                    type: 'bool',
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
    it('SELECT id, ARRAY(SELECT ...) FROM mytable1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT 
			id,
			ARRAY(
				SELECT DISTINCT t2.id
				FROM mytable2 t2
			) AS array
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
                    type: 'int4',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: 'array',
                    type: '_int4',
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
    it('SELECT idalias as id FROM (SELECT id as "idalias" FROM mytable1)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        SELECT idalias as id FROM (
			SELECT id as "idalias" FROM mytable1
		) t
		
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
});
//# sourceMappingURL=parse-select-subqueries.test.js.map