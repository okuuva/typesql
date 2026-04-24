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
const describe_nested_query_1 = require("../src/describe-nested-query");
const queryExectutor_1 = require("../src/queryExectutor");
const parse_1 = require("../src/mysql-query-analyzer/parse");
const ts_nested_descriptor_1 = require("../src/ts-nested-descriptor");
describe('Test nested-ts-descriptor', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    it('SELECT FROM users u INNER JOIN posts p', () => __awaiter(void 0, void 0, void 0, function* () {
        const dbSchema = yield (0, queryExectutor_1.loadMysqlSchema)(client.client, client.schema);
        const sql = `
        SELECT
            u.id as user_id,
            u.name as user_name,
            p.id as post_id,
            p.title as post_title
        FROM users u
        INNER JOIN posts p on p.fk_user = u.id
        `;
        if (dbSchema.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${dbSchema.error.description}`);
        }
        const model = (0, describe_nested_query_1.describeNestedQuery)(sql, dbSchema.value);
        const queryInfo = (0, parse_1.extractQueryInfo)(sql, dbSchema.value);
        (0, node_assert_1.default)(queryInfo.kind === 'Select');
        const actual = (0, ts_nested_descriptor_1.createNestedTsDescriptor)(queryInfo.columns, model);
        const expected = {
            relations: [
                {
                    name: 'users',
                    groupKeyIndex: 0,
                    fields: [
                        {
                            type: 'field',
                            name: 'user_id',
                            index: 0,
                            tsType: 'number',
                            notNull: true
                        },
                        {
                            type: 'field',
                            name: 'user_name',
                            index: 1,
                            tsType: 'string',
                            notNull: true
                        },
                        {
                            type: 'relation',
                            name: 'posts',
                            list: true,
                            tsType: 'posts[]',
                            notNull: true
                        }
                    ]
                },
                {
                    name: 'posts',
                    groupKeyIndex: 2,
                    fields: [
                        {
                            type: 'field',
                            name: 'post_id',
                            index: 2,
                            tsType: 'number',
                            notNull: true
                        },
                        {
                            type: 'field',
                            name: 'post_title',
                            index: 3,
                            tsType: 'string',
                            notNull: true
                        }
                    ]
                }
            ]
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
});
//# sourceMappingURL=nested-ts-descriptor.test.js.map