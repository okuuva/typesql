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
describe('postgres-parse-update', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    it('update mytable1 set value = ? where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'update mytable1 set value = :value where id = :id';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Update',
            sql: 'update mytable1 set value = $1 where id = $2',
            columns: [],
            data: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'id',
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
    it('CASE INSENSITIVE - UPDATE MYTABLE1 SET VALUE = ? WHERE ID = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'UPDATE MYTABLE1 SET VALUE = :value WHERE ID = :id';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'UPDATE MYTABLE1 SET VALUE = $1 WHERE ID = $2',
            multipleRowsResult: false,
            queryType: 'Update',
            columns: [],
            data: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'id',
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
    it('update mytable3 set name = ? where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'update mytable3 set name = :name where id = :id';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Update',
            sql: 'update mytable3 set name = $1 where id = $2',
            columns: [],
            data: [
                {
                    name: 'name',
                    type: 'text',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'id',
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
    it('UPDATE mytable2 SET name = :name, descr= :descr WHERE id = :id', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			UPDATE mytable2 SET name = $1, descr= $2 WHERE id = $3
				`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'param1',
                    type: 'text',
                    notNull: false
                },
                {
                    name: 'param2',
                    type: 'text',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'param3', //different from mysql and sqlite
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
    it(`UPDATE mytable2 t2 SET name = 'a'`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			UPDATE mytable2 t2
			SET name = 'a'
				`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`UPDATE mytable2 t2 SET name = 'a' WHERE t2.id = $1`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			UPDATE mytable2 t2
			SET name = 'a'
			WHERE t2.id = $1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [],
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
    it(`UPDATE mytable2 SET name = 'a' WHERE mytable2.id = $1`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			UPDATE mytable2
			SET name = 'a'
			WHERE mytable2.id = $1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [],
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
    it('UPDATE mytable2 t2 SET name = t2.descr FROM mytable3 t3 WHERE t2.id = t3.id AND t2.id IN ($1)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			UPDATE mytable2 t2
			SET name = t2.descr
			FROM mytable3 t3
			WHERE t2.id = t3.id
			AND t2.id IN ($1)
			`;
        const expectedSql = `
			UPDATE mytable2 t2
			SET name = t2.descr
			FROM mytable3 t3
			WHERE t2.id = t3.id
			AND t2.id IN (\${generatePlaceholders('$1', params.param1)})
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [],
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
    it('update mytable1 set value = :value where id > :min and id < :max', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'update mytable1 set value = :value where id > :min and id < :max';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'update mytable1 set value = $1 where id > $2 and id < $3',
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'min',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'max',
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
    it('update mytable1 set value = :value where id > :value or id < :value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'update mytable1 set value = :value where id > :value or id < :value';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'update mytable1 set value = $1 where id > $1 or id < $1',
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('update mytable1 set value = :value where id > :id or id < :id', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'update mytable1 set value = :value where id > :id or id < :id';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'update mytable1 set value = $1 where id > $2 or id < $2',
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'id',
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
    it('UPDATE mytable1 SET id = IFNULL(:id, id)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'UPDATE mytable5 SET id = COALESCE(:id, id)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'UPDATE mytable5 SET id = COALESCE($1, id)',
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: false
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('UPDATE mytable1 SET id = CASE WHEN :valueSet THEN :value ELSE value END WHERE id = :id', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'UPDATE mytable5 SET id = CASE WHEN :valueSet THEN :value ELSE year END WHERE id = :id';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'UPDATE mytable5 SET id = CASE WHEN $1 THEN $2 ELSE year END WHERE id = $3',
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'valueSet',
                    type: 'bool',
                    notNull: true //different from mysql and sqlite
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: true //different from mysql and sqlite
                }
            ],
            parameters: [
                {
                    name: 'id',
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
    it('UPDATE mytable2 SET name = CASE WHEN :nameSet THEN :name ELSE name END WHERE id = :id', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'UPDATE mytable2 SET name = CASE WHEN :nameSet THEN :name ELSE name END WHERE id = :id';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'UPDATE mytable2 SET name = CASE WHEN $1 THEN $2 ELSE name END WHERE id = $3',
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'nameSet',
                    type: 'bool',
                    notNull: true //different from mysql and sqlite
                },
                {
                    name: 'name',
                    type: 'text',
                    notNull: true //different from mysql and sqlite
                }
            ],
            parameters: [
                {
                    name: 'id',
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
    it('UPDATE mytable1 SET value = $1 RETURNING *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'UPDATE mytable1 SET value = :value RETURNING *';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'UPDATE mytable1 SET value = $1 RETURNING *',
            queryType: 'Update',
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
            data: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('UPDATE mytable1 SET value = $1 RETURNING id, id+id, value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'UPDATE mytable1 SET value = :value RETURNING id, id+id, value';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'UPDATE mytable1 SET value = $1 RETURNING id, id+id, value',
            queryType: 'Update',
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
            data: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('UPDATE all_types SET enum_column = :enum1, enum_column_constraint = :enum2 WHERE int4_column = :id', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'UPDATE all_types SET enum_column = :enum1, enum_constraint = :enum2 WHERE enum_constraint = :enum3';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'UPDATE all_types SET enum_column = $1, enum_constraint = $2 WHERE enum_constraint = $3',
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'enum1',
                    type: `enum('x-small','small','medium','large','x-large')`,
                    notNull: false
                },
                {
                    name: 'enum2',
                    type: `enum('x-small','small','medium','large','x-large')`,
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'enum3',
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
    it('UPDATE schema1.users SET schema1_field1 = $1 WHERE id = $2', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'UPDATE schema1.users SET schema1_field1 = :schema1_field1 WHERE id = :id';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'UPDATE schema1.users SET schema1_field1 = $1 WHERE id = $2',
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'schema1_field1',
                    type: `enum('str1','str2')`,
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'id',
                    type: `int4`,
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
//# sourceMappingURL=parse-update.test.js.map