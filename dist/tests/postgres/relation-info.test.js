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
const parser_1 = require("../../src/postgres-query-analyzer/parser");
const postgres_1 = __importDefault(require("postgres"));
const postgres_2 = require("../../src/drivers/postgres");
describe('postgres-relation-info', () => {
    let dbSchema = [];
    const databaseClient = (0, postgres_1.default)({
        host: 'localhost',
        user: 'postgres',
        password: 'password',
        port: 5432,
        database: 'postgres',
    });
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield databaseClient.end();
    }));
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const dbSchemaResult = yield yield (0, postgres_2.loadDbSchema)(databaseClient);
            if (dbSchemaResult.isErr()) {
                node_assert_1.default.fail(`Shouldn't return an error: ${dbSchemaResult.error}`);
            }
            dbSchema = dbSchemaResult.value;
        });
    });
    it('SELECT FROM users u INNER JOIN posts p', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
		-- @nested
        SELECT
            u.id as user_id,
            u.name as user_name,
            p.id as post_id,
            p.title as post_title,
            p.body  as post_body
        FROM users u
        INNER JOIN posts p on p.fk_user = u.id
        `;
        const expectedModel = [
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
        const actual = (0, parser_1.parseSql)(sql, dbSchema, {}, [], { collectNestedInfo: true });
        node_assert_1.default.deepStrictEqual(actual.relations, expectedModel);
    }));
    it('SELECT FROM users INNER JOIN posts (without alias)', () => {
        const sql = `
		-- @nested
        SELECT
            *
        FROM users
        INNER JOIN posts on fk_user = users.id
        `;
        const expectedModel = [
            {
                name: 'users',
                alias: '',
                renameAs: false,
                parentRelation: '',
                joinColumn: 'id',
                cardinality: 'one',
                parentCardinality: 'one'
            },
            {
                name: 'posts',
                alias: '',
                renameAs: false,
                parentRelation: 'users',
                joinColumn: 'id',
                cardinality: 'many',
                parentCardinality: 'one'
            }
        ];
        const actual = (0, parser_1.parseSql)(sql, dbSchema, {}, [], { collectNestedInfo: true });
        node_assert_1.default.deepStrictEqual(actual.relations, expectedModel);
    });
    it('SELECT FROM posts p INNER JOIN users u', () => {
        const sql = `
			-- @nested
			SELECT
				u.id as user_id,
				u.name as user_name,
				p.id as post_id,
				p.title as post_title,
				p.body  as post_body
			FROM posts p
			INNER JOIN users u on u.id = p.fk_user
			`;
        const expectedModel = [
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
        const actual = (0, parser_1.parseSql)(sql, dbSchema, {}, [], { collectNestedInfo: true });
        node_assert_1.default.deepStrictEqual(actual.relations, expectedModel);
    });
    it('SELECT FROM users u INNER JOIN posts p INNER JOIN comments c', () => {
        const sql = `
			-- @nested
			SELECT
				u.id as user_id,
				u.name as user_name,
				p.id as post_id,
				p.title as post_title,
				p.body  as post_body,
				c.id as comment_id,
				c.comment as comment
			FROM users u
			INNER JOIN posts p on p.fk_user = u.id
			INNER JOIN comments c on c.fk_post = p.id
			`;
        const expectedModel = [
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
            },
            {
                name: 'comments',
                alias: 'c',
                renameAs: false,
                parentRelation: 'p',
                joinColumn: 'comment_id',
                cardinality: 'many',
                parentCardinality: 'one'
            }
        ];
        const actual = (0, parser_1.parseSql)(sql, dbSchema, {}, [], { collectNestedInfo: true });
        node_assert_1.default.deepStrictEqual(actual.relations, expectedModel);
    });
    it('self relation - clients with primaryAddress and secondaryAddress', () => {
        const sql = `
		-- @nested
        SELECT
            c.id,
            a1.*,
            a2.*
        FROM clients as c
        INNER JOIN addresses as a1 ON a1.id = c.primaryAddress
        LEFT JOIN addresses as a2 ON a2.id = c.secondaryAddress
        WHERE c.id = $1
        `;
        const expectedModel = [
            {
                name: 'clients',
                alias: 'c',
                renameAs: true,
                parentRelation: '',
                joinColumn: 'id',
                cardinality: 'one',
                parentCardinality: 'one'
            },
            {
                name: 'addresses',
                alias: 'a1',
                renameAs: true,
                parentRelation: 'c',
                joinColumn: 'id',
                cardinality: 'one',
                parentCardinality: 'many'
            },
            {
                name: 'addresses',
                alias: 'a2',
                renameAs: true,
                parentRelation: 'c',
                joinColumn: 'id',
                cardinality: 'one',
                parentCardinality: 'many'
            }
        ];
        const actual = (0, parser_1.parseSql)(sql, dbSchema, {}, [], { collectNestedInfo: true });
        node_assert_1.default.deepStrictEqual(actual.relations, expectedModel);
    });
    it('many to many - surveys with users', () => {
        const sql = `
SELECT
	s.id as surveyId,
	s.name as surveyName,
	u.id as userId,
	u.name as userName
FROM surveys s
INNER JOIN participants p on p.fk_survey = s.id
INNER JOIN users u on u.id = p.fk_user`;
        const expectedModel = [
            {
                name: 'surveys',
                alias: 's',
                renameAs: false,
                parentRelation: '',
                joinColumn: 'surveyId',
                cardinality: 'one',
                parentCardinality: 'one'
            },
            {
                name: 'participants',
                alias: 'p',
                renameAs: false,
                parentRelation: 's',
                joinColumn: 'id',
                cardinality: 'many',
                parentCardinality: 'one'
            },
            {
                name: 'users',
                alias: 'u',
                renameAs: false,
                parentRelation: 'p',
                joinColumn: 'userId',
                cardinality: 'one',
                parentCardinality: 'many'
            }
        ];
        const actual = (0, parser_1.parseSql)(sql, dbSchema, {}, [], { collectNestedInfo: true });
        node_assert_1.default.deepStrictEqual(actual.relations, expectedModel);
    });
});
//# sourceMappingURL=relation-info.test.js.map