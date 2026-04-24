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
describe('postgres-user-functions', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    it('SELECT * FROM schema2.get_user(:id)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM schema2.get_user(:id)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'SELECT * FROM schema2.get_user($1)',
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'get_user'
                },
                {
                    name: 'username',
                    type: 'text',
                    notNull: true,
                    table: 'get_user'
                },
                {
                    name: 'password',
                    type: 'text',
                    notNull: false,
                    table: 'get_user'
                },
                {
                    name: 'schema1_field1',
                    type: 'text',
                    notNull: true,
                    table: 'get_user'
                }
            ],
            parameters: [
                {
                    name: 'id',
                    notNull: false, //todo: should be notNull: true
                    type: 'int4'
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT u.* FROM schema2.get_user($1) u', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT u.* FROM schema2.get_user(:id) u';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'SELECT u.* FROM schema2.get_user($1) u',
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'u'
                },
                {
                    name: 'username',
                    type: 'text',
                    notNull: true,
                    table: 'u'
                },
                {
                    name: 'password',
                    type: 'text',
                    notNull: false,
                    table: 'u'
                },
                {
                    name: 'schema1_field1',
                    type: 'text',
                    notNull: true,
                    table: 'u'
                }
            ],
            parameters: [
                {
                    name: 'id',
                    notNull: false, //todo: should be notNull: true
                    type: 'int4'
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`SELECT * FROM get_users_with_posts()`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT * FROM get_users_with_posts()`;
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
                    table: 'get_users_with_posts'
                },
                {
                    name: 'posts',
                    type: {
                        name: 'json[]',
                        properties: [
                            {
                                name: 'json',
                                notNull: true,
                                properties: [
                                    {
                                        key: 'id',
                                        type: { name: 'json_field', type: 'int4', notNull: true } //FILTER(WHERE p.id is not null)
                                    },
                                    {
                                        key: 'title',
                                        type: { name: 'json_field', type: 'text', notNull: true } //FILTER(WHERE p.id is not null)
                                    }
                                ]
                            }
                        ]
                    },
                    notNull: true, //[]
                    table: 'get_users_with_posts'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`SELECT u.* FROM get_users_with_posts() u`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT u.* FROM get_users_with_posts() u`;
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
                    table: 'u'
                },
                {
                    name: 'posts',
                    type: {
                        name: 'json[]',
                        properties: [
                            {
                                name: 'json',
                                notNull: true,
                                properties: [
                                    {
                                        key: 'id',
                                        type: { name: 'json_field', type: 'int4', notNull: true } //FILTER(WHERE p.id is not null)
                                    },
                                    {
                                        key: 'title',
                                        type: { name: 'json_field', type: 'text', notNull: true } //FILTER(WHERE p.id is not null)
                                    }
                                ]
                            }
                        ]
                    },
                    notNull: true, //[]
                    table: 'u'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM get_clients_with_addresses()', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM get_clients_with_addresses()';
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
                    table: 'get_clients_with_addresses'
                },
                {
                    name: 'primaryaddress',
                    type: {
                        name: 'json',
                        notNull: true,
                        properties: [
                            {
                                key: 'id',
                                type: { name: 'json_field', type: 'int4', notNull: true }
                            },
                            {
                                key: 'address',
                                type: { name: 'json_field', type: 'text', notNull: true }
                            }
                        ]
                    },
                    notNull: true,
                    table: 'get_clients_with_addresses'
                },
                {
                    name: 'secondaryaddress',
                    type: {
                        name: 'json',
                        notNull: true,
                        properties: [
                            {
                                key: 'id',
                                type: { name: 'json_field', type: 'int4', notNull: true }
                            },
                            {
                                key: 'address',
                                type: { name: 'json_field', type: 'text', notNull: true }
                            }
                        ]
                    },
                    notNull: false,
                    table: 'get_clients_with_addresses'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM get_users_with_posts_plpgsql()', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM get_users_with_posts_plpgsql()';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: false, //LOOSE nullability information
                    table: 'get_users_with_posts_plpgsql'
                },
                {
                    name: 'posts',
                    type: 'json',
                    notNull: false,
                    table: 'get_users_with_posts_plpgsql'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM get_mytable1()', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM get_mytable1()';
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
                    table: 'get_mytable1'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'get_mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM get_mytable1() WHERE id = 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM get_mytable1() WHERE id = 1';
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
                    table: 'get_mytable1'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'get_mytable1'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM get_mytable1_by_id(:id)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM get_mytable1_by_id(:id)';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql: 'SELECT * FROM get_mytable1_by_id($1)',
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true,
                    table: 'get_mytable1_by_id'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'get_mytable1_by_id'
                }
            ],
            parameters: [
                {
                    name: 'id',
                    notNull: true,
                    type: 'int4'
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM get_mytable_plpgsql()', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM get_mytable_plpgsql()';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: false, //loose nullability information
                    table: 'get_mytable_plpgsql'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'get_mytable_plpgsql'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM get_mytable_plpgsql()', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT m.id FROM get_mytable_plpgsql() m';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: false, //loose nullability information
                    table: 'm'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT mytable1.*, get_users_with_posts.posts FROM mytable1 INNER JOIN get_users_with_posts()', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
		SELECT 
			mytable1.*, 
		get_users_with_posts.posts 
		FROM mytable1
		INNER JOIN get_users_with_posts() ON get_users_with_posts.id = mytable1.id`;
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
                },
                {
                    name: 'posts',
                    type: {
                        name: 'json[]',
                        properties: [
                            {
                                name: 'json',
                                notNull: true,
                                properties: [
                                    {
                                        key: 'id',
                                        type: { name: 'json_field', type: 'int4', notNull: true } //FILTER(WHERE p.id is not null)
                                    },
                                    {
                                        key: 'title',
                                        type: { name: 'json_field', type: 'text', notNull: true } //FILTER(WHERE p.id is not null)
                                    }
                                ]
                            }
                        ]
                    },
                    notNull: true, //[]
                    table: 'get_users_with_posts'
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('SELECT * FROM get_mytable1_with_nested_function()', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT * FROM get_mytable1_with_nested_function() get_users_with_posts';
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
                    table: 'get_users_with_posts'
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false,
                    table: 'get_users_with_posts'
                },
                {
                    name: 'posts',
                    type: {
                        name: 'json[]',
                        properties: [
                            {
                                name: 'json',
                                notNull: true,
                                properties: [
                                    {
                                        key: 'id',
                                        type: { name: 'json_field', type: 'int4', notNull: true } //FILTER(WHERE p.id is not null)
                                    },
                                    {
                                        key: 'title',
                                        type: { name: 'json_field', type: 'text', notNull: true } //FILTER(WHERE p.id is not null)
                                    }
                                ]
                            }
                        ]
                    },
                    notNull: true, //[]
                    table: 'get_users_with_posts'
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
//# sourceMappingURL=parse-user-functions.test.js.map