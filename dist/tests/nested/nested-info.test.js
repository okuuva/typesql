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
const sqlite_describe_nested_query_1 = require("../../src/sqlite-query-analyzer/sqlite-describe-nested-query");
const Either_1 = require("fp-ts/lib/Either");
const describe_1 = require("../../src/postgres-query-analyzer/describe");
const schema_1 = require("../postgres/schema");
describe('nested-info', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    it('SELECT FROM users u INNER JOIN posts p', () => __awaiter(void 0, void 0, void 0, function* () {
        // SELECT
        // 	u.id as user_id,
        // 	u.name as user_name,
        // 	p.id as post_id,
        // 	p.title as post_title,
        // 	p.body  as post_body
        // FROM users u
        // INNER JOIN posts p on p.fk_user = u.id
        const columns = [
            {
                name: 'user_id',
                notNull: true,
                table: 'users',
            },
            {
                name: 'user_name',
                notNull: true,
                table: 'users',
            },
            {
                name: 'post_id',
                notNull: true,
                table: 'posts',
            },
            {
                name: 'post_title',
                notNull: true,
                table: 'posts',
            },
            {
                name: 'post_body',
                notNull: true,
                table: 'posts',
            },
        ];
        const relations = [
            {
                name: 'users',
                alias: 'u',
                renameAs: false,
                parentRelation: '',
                joinColumn: 'user_id',
                cardinality: 'one',
                parentCardinality: 'one'
            },
            {
                name: 'posts',
                alias: 'p',
                renameAs: false,
                parentRelation: 'u',
                joinColumn: 'post_id',
                cardinality: 'many',
                parentCardinality: 'one'
            }
        ];
        const actual = (0, sqlite_describe_nested_query_1.describeNestedQuery)(columns, relations);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail('error');
        }
        const expected = [
            {
                name: 'users',
                alias: 'u',
                groupIndex: 0,
                fields: [
                    {
                        name: 'user_id',
                        index: 0
                    },
                    {
                        name: 'user_name',
                        index: 1
                    }
                ],
                relations: [
                    {
                        name: 'posts',
                        alias: 'p',
                        notNull: true,
                        cardinality: 'many'
                    }
                ]
            },
            {
                name: 'posts',
                alias: 'p',
                groupIndex: 2,
                fields: [
                    {
                        name: 'post_id',
                        index: 2
                    },
                    {
                        name: 'post_title',
                        index: 3
                    },
                    {
                        name: 'post_body',
                        index: 4
                    }
                ],
                relations: []
            }
        ];
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('SELECT FROM posts p INNER JOIN users u', () => __awaiter(void 0, void 0, void 0, function* () {
        // SELECT
        //     u.id as user_id,
        //     u.name as user_name,
        //     p.id as post_id,
        //     p.title as post_title,
        //     p.body  as post_body
        // FROM posts p
        // INNER JOIN users u on u.id = p.fk_user
        const columns = [
            {
                name: 'user_id',
                notNull: true,
                table: 'users',
            },
            {
                name: 'user_name',
                notNull: true,
                table: 'users',
            },
            {
                name: 'post_id',
                notNull: true,
                table: 'posts',
            },
            {
                name: 'post_title',
                notNull: true,
                table: 'posts',
            },
            {
                name: 'post_body',
                notNull: true,
                table: 'posts',
            },
        ];
        const relations = [
            {
                name: 'posts',
                alias: 'p',
                renameAs: false,
                parentRelation: '',
                joinColumn: 'post_id',
                cardinality: 'one',
                parentCardinality: 'one'
            },
            {
                name: 'users',
                alias: 'u',
                renameAs: false,
                parentRelation: 'p',
                joinColumn: 'user_id',
                cardinality: 'one',
                parentCardinality: 'many'
            }
        ];
        const actual = (0, sqlite_describe_nested_query_1.describeNestedQuery)(columns, relations);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail('error');
        }
        const expected = [
            {
                name: 'posts',
                alias: 'p',
                groupIndex: 2,
                fields: [
                    {
                        name: 'post_id',
                        index: 2
                    },
                    {
                        name: 'post_title',
                        index: 3
                    },
                    {
                        name: 'post_body',
                        index: 4
                    }
                ],
                relations: [
                    {
                        name: 'users',
                        alias: 'u',
                        notNull: true,
                        cardinality: 'one'
                    }
                ]
            },
            {
                name: 'users',
                alias: 'u',
                groupIndex: 0,
                fields: [
                    {
                        name: 'user_id',
                        index: 0
                    },
                    {
                        name: 'user_name',
                        index: 1
                    }
                ],
                relations: []
            }
        ];
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('self relation - clients with primaryAddress and secondaryAddress', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
		-- @nested
        SELECT
            c.id,
            a1.*,
            a2.*
        FROM clients as c
        INNER JOIN addresses as a1 ON a1.id = c.primaryAddress
        LEFT JOIN addresses as a2 ON a2.id = c.secondaryAddress
        WHERE c.id = :clientId`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = [
            {
                name: 'c',
                alias: 'c',
                groupIndex: 0,
                fields: [
                    {
                        name: 'id',
                        index: 0
                    }
                ],
                relations: [
                    {
                        name: 'a1',
                        alias: 'a1',
                        notNull: true,
                        cardinality: 'one'
                    },
                    {
                        name: 'a2',
                        alias: 'a2',
                        notNull: false,
                        cardinality: 'one'
                    }
                ]
            },
            {
                name: 'a1',
                alias: 'a1',
                groupIndex: 1,
                fields: [
                    {
                        name: 'id',
                        index: 1
                    },
                    {
                        name: 'address',
                        index: 2
                    }
                ],
                relations: []
            },
            {
                name: 'a2',
                alias: 'a2',
                groupIndex: 3,
                fields: [
                    {
                        name: 'id',
                        index: 3
                    },
                    {
                        name: 'address',
                        index: 4
                    }
                ],
                relations: []
            }
        ];
        node_assert_1.default.deepStrictEqual(actual._unsafeUnwrap().nestedInfo, expected);
    }));
    it('many to many - surveys with users', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @nested
		SELECT
			s.id as surveyId,
			s.name as surveyName,
			u.id as userId,
			u.name as userName
		FROM surveys s
		INNER JOIN participants p on p.fk_survey = s.id
		INNER JOIN users u on u.id = p.fk_user`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = [
            {
                name: 'surveys',
                alias: 's',
                groupIndex: 0,
                fields: [
                    {
                        name: 'surveyid',
                        index: 0
                    },
                    {
                        name: 'surveyname',
                        index: 1
                    }
                ],
                relations: [
                    {
                        name: 'users',
                        alias: 'u',
                        notNull: true,
                        cardinality: 'many'
                    }
                ]
            },
            {
                name: 'users',
                alias: 'u',
                groupIndex: 2,
                fields: [
                    {
                        name: 'userid',
                        index: 2
                    },
                    {
                        name: 'username',
                        index: 3
                    }
                ],
                relations: []
            }
        ];
        node_assert_1.default.deepStrictEqual(actual._unsafeUnwrap().nestedInfo, expected);
    }));
});
//# sourceMappingURL=nested-info.test.js.map