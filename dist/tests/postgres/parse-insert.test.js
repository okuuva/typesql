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
describe('postgres-parse-insert', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    it('insert into mytable1 (value) values (?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into mytable1 (value) values ($1)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql: 'insert into mytable1 (value) values ($1)',
            columns: [],
            parameters: [
                {
                    name: 'param1',
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
    it('CASE INSENSITIVE - INSERT INTO MYTABLE1 (VALUE) VALUES(?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO MYTABLE1 (VALUE) VALUES($1)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql,
            columns: [],
            parameters: [
                {
                    name: 'param1',
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
    it('insert into mytable3 (name, double_value) values (?, ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into mytable3 (name, double_value) values ($1, $2)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql: 'insert into mytable3 (name, double_value) values ($1, $2)',
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    type: 'text',
                    notNull: true
                },
                {
                    name: 'param2',
                    type: 'float4',
                    notNull: false
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('insert into mytable3 (double_value, name) values (?, ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into mytable3 (double_value, name) values ($1, $2)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql: 'insert into mytable3 (double_value, name) values ($1, $2)',
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    type: 'float4',
                    notNull: false
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
    it('insert into mytable3 (name, double_value) values (:fullname, :value)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into mytable3 (name, double_value) values (:fullname, :value)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql: 'insert into mytable3 (name, double_value) values ($1, $2)',
            columns: [],
            parameters: [
                {
                    name: 'fullname',
                    type: 'text',
                    notNull: true
                },
                {
                    name: 'value',
                    type: 'float4',
                    notNull: false
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('insert same parameter into two fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into mytable2 (name, descr) values (:name, :name)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Insert',
            sql: 'insert into mytable2 (name, descr) values ($1, $1)',
            columns: [],
            parameters: [
                {
                    name: 'name',
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
    it('insert into mytable1 (value) values (coalesce($1, 100))', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into mytable1 (value) values (coalesce(:value, 100))';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = [
            {
                name: 'value',
                type: 'int4',
                notNull: false
            }
        ];
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value.parameters, expected);
    }));
    it('insert into mytable3 (double_value, name) values (coalesce($1, $2::float4), $3)', () => __awaiter(void 0, void 0, void 0, function* () {
        //name is not null
        const sql = `
        insert into mytable3 (double_value, name) values (coalesce(:value1, :value2::float4), :name1)
            `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = [
            {
                name: 'value1',
                type: 'float4',
                notNull: false
            },
            {
                name: 'value2',
                type: 'float4',
                notNull: false
            },
            {
                name: 'name1',
                type: 'text',
                notNull: true
            }
        ];
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value.parameters, expected);
    }));
    it('insert into mytable1 (value) values (coalesce($1, $2, 10))', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        insert into mytable1 (value) values (coalesce(:id, :id2, 10))
            `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = [
            {
                name: 'id',
                type: 'int4',
                notNull: false
            },
            {
                name: 'id2',
                type: 'int4',
                notNull: false
            }
        ];
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value.parameters, expected);
    }));
    it(`insert into mytable3 (double_value, name) values (coalesce($1, $2::float4), coalesce($3, $4, 'name2'))`, () => __awaiter(void 0, void 0, void 0, function* () {
        //name is not null
        const sql = `
        insert into mytable3 (double_value, name) values (coalesce(:value1, :value2::float4), coalesce(:descr1, :descr2, 'name2'))
            `;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = [
            {
                name: 'value1',
                type: 'float4',
                notNull: false
            },
            {
                name: 'value2',
                type: 'float4',
                notNull: false
            },
            {
                name: 'descr1',
                type: 'text',
                notNull: false
            },
            {
                name: 'descr2',
                type: 'text',
                notNull: false
            }
        ];
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value.parameters, expected);
    }));
    it('insert into all_types (int_column) values (?+?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into mytable1 (value) values ($1::int4+$2)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
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
    it('insert into all_types (int_column) values (?+coalesce(?, 10))', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'insert into mytable1 (value) values ($1::int4+coalesce($2, 10))';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'param2',
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
    it('INSERT INTO mytable1 (value) RETURNING *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1 (value) VALUES (:value) RETURNING *';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'INSERT INTO mytable1 (value) VALUES ($1) RETURNING *',
            queryType: 'Insert',
            multipleRowsResult: false,
            returning: true,
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
                    name: 'value',
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
    it('INSERT INTO mytable1 (value) RETURNING id, id+id, value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1 (value) VALUES (:value) RETURNING id, id+id, value';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'INSERT INTO mytable1 (value) VALUES ($1) RETURNING id, id+id, value',
            queryType: 'Insert',
            multipleRowsResult: false,
            returning: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'mytable1'
                },
                {
                    name: '?column?',
                    type: 'int4',
                    notNull: true,
                    table: ''
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
                    name: 'value',
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
    it('ON DUPLICATE KEY UPDATE name = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			INSERT INTO mytable5 (id, name)
			VALUES ($1, $2)
			ON CONFLICT(id) DO
			UPDATE SET name = $3`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'param2',
                    type: 'text',
                    notNull: false
                },
                {
                    name: 'param3',
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
    it('ON DUPLICATE KEY UPDATE name = excluded.name', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			INSERT INTO mytable5 (id, name)
			VALUES ($1, $2)
			ON CONFLICT(id) DO
			UPDATE SET name = excluded.name`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true //primary key
                },
                {
                    name: 'param2',
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
    it('ON DUPLICATE KEY UPDATE name = concat(?, ?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			INSERT INTO mytable5 (id, name)
			VALUES ($1, $2)
			ON CONFLICT(id) DO UPDATE
			SET name = concat($3::text, $4::text)`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true //primary key
                },
                {
                    name: 'param2',
                    type: 'text',
                    notNull: false
                },
                {
                    name: 'param3',
                    type: 'text',
                    notNull: true //different from mysql and sqlite
                },
                {
                    name: 'param4',
                    type: 'text',
                    notNull: true //different from mysql and sqlite
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`ON DUPLICATE KEY UPDATE name = concat(?, 'a', ?)`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			INSERT INTO mytable5 (id, name)
			VALUES ($1, concat($2::text, '-a'))
			ON CONFLICT (id) DO UPDATE
				SET name = concat($3::text, 'a', $4::text)`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true //primary key
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
    it(`ON DUPLICATE KEY UPDATE name = name = IF(? != '', ?, name)`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			INSERT INTO mytable5 (id, name)
			VALUES ($1, $2)
			ON CONFLICT(id) DO UPDATE
			SET name = CASE
				WHEN $3 != '' THEN $4
				ELSE mytable5.name -- mytable5.name: different from mysql and sqlite
			END`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true //primary key
                },
                {
                    name: 'param2',
                    type: 'text',
                    notNull: false
                },
                {
                    name: 'param3',
                    type: 'text',
                    notNull: true //diff from mysql
                },
                {
                    name: 'param4',
                    type: 'text',
                    notNull: true ////diff from mysql and sqlite
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('INSERT INTO mytable2 (id, name) SELECT ?, ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			INSERT INTO mytable5 (id, name)
			SELECT $1, $2`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'param2',
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
    it('INSERT INTO mytable2 (id, name) SELECT id, descr FROM mytable2 WHERE name = ? AND id > ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			INSERT INTO mytable5 (id, name)
			SELECT id, descr
			FROM mytable2 WHERE name = $1 AND id > $2`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: sql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    type: 'text',
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
    it('INSERT INTO mytable2 (id, name) SELECT id, descr FROM mytable2 WHERE id in (?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			INSERT INTO mytable5 (id, name)
			SELECT id, descr
			FROM mytable2 WHERE id in ($1)`;
        const expectedSql = `
			INSERT INTO mytable5 (id, name)
			SELECT id, descr
			FROM mytable2 WHERE id in (\${generatePlaceholders('$1', params.param1)})`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: expectedSql,
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'param1',
                    type: 'int4[]',
                    notNull: true
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('INSERT INTO mytable2 (id, name) SELECT id, descr FROM mytable2 WHERE id in (?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO all_types (integer_column_default) VALUES (:value)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'INSERT INTO all_types (integer_column_default) VALUES ($1)',
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'value',
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
    it('INSERT INTO schema1.users (username, schema1_field1) VALUES (:username, :schema1_field1)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO schema1.users (username, schema1_field1) VALUES (:username, :schema1_field1)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'INSERT INTO schema1.users (username, schema1_field1) VALUES ($1, $2)',
            queryType: 'Insert',
            multipleRowsResult: false,
            columns: [],
            parameters: [
                {
                    name: 'username',
                    type: `text`,
                    notNull: true
                },
                {
                    name: 'schema1_field1',
                    type: `text`,
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
//# sourceMappingURL=parse-insert.test.js.map