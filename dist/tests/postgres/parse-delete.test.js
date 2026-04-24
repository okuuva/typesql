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
describe('postgres-parse-delete', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    it('delete from mytable1 where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'delete from mytable1 where id = :id';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'delete from mytable1 where id = $1',
            multipleRowsResult: false,
            queryType: 'Delete',
            columns: [],
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
    it('delete from mytable1 where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'delete from mytable1 where value = :value';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'delete from mytable1 where value = $1',
            multipleRowsResult: false,
            queryType: 'Delete',
            columns: [],
            parameters: [
                {
                    name: 'value',
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
    it('CASE INSENSITIVE - DELETE FROM MYTABLE1 WHERE ID = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'DELETE FROM MYTABLE1 WHERE ID = :id';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'DELETE FROM MYTABLE1 WHERE ID = $1',
            multipleRowsResult: false,
            queryType: 'Delete',
            columns: [],
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
    it('delete from mytable1 where id in (?)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'delete from mytable1 where id in (:id)';
        const expectedSql = `delete from mytable1 where id in (\${generatePlaceholders('$1', params.id)})`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Delete',
            sql: expectedSql,
            columns: [],
            parameters: [
                {
                    name: 'id',
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
    it('DELETE FROM mytable1 WHERE id = :id RETURNING *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'DELETE FROM mytable1 WHERE id = :id RETURNING *';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'DELETE FROM mytable1 WHERE id = $1 RETURNING *',
            queryType: 'Delete',
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
    it('DELETE FROM mytable1 WHERE id = :id RETURNING id, id+id, value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'DELETE FROM mytable1 WHERE id = :id RETURNING id, id+id, value';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'DELETE FROM mytable1 WHERE id = $1 RETURNING id, id+id, value',
            queryType: 'Delete',
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
    it('DELETE FROM schema1.users WHERE id = :id RETURNING id, username, schema1_field1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'DELETE FROM schema1.users WHERE id = :id RETURNING id, username, schema1_field1';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'DELETE FROM schema1.users WHERE id = $1 RETURNING id, username, schema1_field1',
            queryType: 'Delete',
            multipleRowsResult: false,
            returning: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'users'
                },
                {
                    name: 'username',
                    type: 'text',
                    notNull: true,
                    table: 'users'
                },
                {
                    name: 'schema1_field1',
                    type: `enum('str1','str2')`,
                    notNull: true,
                    table: 'users'
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
});
//# sourceMappingURL=parse-delete.test.js.map