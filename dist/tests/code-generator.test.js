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
const mysql2_1 = require("../src/codegen/mysql2");
const describe_query_1 = require("../src/describe-query");
const create_schema_1 = require("./mysql-query-analyzer/create-schema");
const queryExectutor_1 = require("../src/queryExectutor");
const test_utils_1 = require("./test-utils");
const Either_1 = require("fp-ts/lib/Either");
const codegen_util_1 = require("../src/codegen/shared/codegen-util");
describe('code-generator', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    it('generate main function with parameters', () => {
        const queryName = 'get-person';
        const tsDescriptor = {
            sql: 'select id, name from person where id = ?',
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    tsType: 'number',
                    notNull: true
                },
                {
                    name: 'name',
                    tsType: 'string',
                    notNull: false
                }
            ],
            parameterNames: [{ name: 'param1', isList: false }],
            parameters: [
                {
                    name: 'param1',
                    tsType: 'number',
                    notNull: true,
                    toDriver: 'param1',
                    isArray: false
                }
            ]
        };
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, queryName);
        const expected = `import type { Connection } from 'mysql2/promise';

export type GetPersonParams = {
    param1: number;
}

export type GetPersonResult = {
    id: number;
    name: string | null;
}

export async function getPerson(connection: Connection, params: GetPersonParams): Promise<GetPersonResult[]> {
    const sql = \`
    select id, name from person where id = ?
    \`

    return connection.query({sql, rowsAsArray: true}, [params.param1])
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToGetPersonResult(data)));
}

function mapArrayToGetPersonResult(data: any) {
    const result: GetPersonResult = {
        id: data[0],
        name: data[1]
    }
    return result;
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('generate main function with list parameters', () => {
        const queryName = 'get-person';
        const tsDescriptor = {
            sql: 'select id, name from person where id in (?)',
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'id',
                    tsType: 'number',
                    notNull: true
                },
                {
                    name: 'name',
                    tsType: 'string',
                    notNull: false
                }
            ],
            parameterNames: [{ name: 'param1', isList: true }],
            parameters: [
                {
                    name: 'param1',
                    tsType: 'number',
                    notNull: true,
                    toDriver: 'param1',
                    isArray: false
                }
            ]
        };
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, queryName);
        const expected = `import type { Connection } from 'mysql2/promise';

export type GetPersonParams = {
    param1: number;
}

export type GetPersonResult = {
    id: number;
    name: string | null;
}

export async function getPerson(connection: Connection, params: GetPersonParams): Promise<GetPersonResult[]> {
    const sql = \`
    select id, name from person where id in (?)
    \`

    return connection.query({sql, rowsAsArray: true}, [params.param1.length == 0? null : params.param1])
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToGetPersonResult(data)));
}

function mapArrayToGetPersonResult(data: any) {
    const result: GetPersonResult = {
        id: data[0],
        name: data[1]
    }
    return result;
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('generate main function with data and parameters', () => {
        const queryName = (0, codegen_util_1.convertToCamelCaseName)('update-person');
        const sql = 'update mytable2 set name= :name, descr= :descr where id = :id';
        const schemaDef = (0, describe_query_1.describeSql)(create_schema_1.dbSchema, sql);
        const tsDescriptor = (0, mysql2_1.generateTsDescriptor)(schemaDef);
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, queryName);
        const expected = `import type { Connection } from 'mysql2/promise';

export type UpdatePersonData = {
    name?: string;
    descr?: string;
}

export type UpdatePersonParams = {
    id: number;
}

export type UpdatePersonResult = {
    affectedRows: number;
}

export async function updatePerson(connection: Connection, data: UpdatePersonData, params: UpdatePersonParams): Promise<UpdatePersonResult> {
    const sql = \`
    update mytable2 set name= ?, descr= ? where id = ?
    \`

    return connection.query(sql, [data.name, data.descr, params.id])
        .then(res => res[0] as UpdatePersonResult);
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('generate main function only with order by parameter', () => {
        const queryName = (0, codegen_util_1.convertToCamelCaseName)('select-person');
        const tsDescriptor = {
            sql: 'SELECT id FROM person ORDER BY ?',
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'id',
                    tsType: 'number',
                    notNull: true
                }
            ],
            data: [],
            parameterNames: [],
            parameters: [],
            orderByColumns: ['id', 'name']
        };
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, queryName);
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectPersonParams = {
    orderBy: [SelectPersonOrderBy, ...SelectPersonOrderBy[]];
}

export type SelectPersonResult = {
    id: number;
}

export async function selectPerson(connection: Connection, params: SelectPersonParams): Promise<SelectPersonResult | null> {
    const sql = \`
    SELECT id FROM person ORDER BY \${buildOrderBy(params.orderBy)}
    \`

    return connection.query({sql, rowsAsArray: true})
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectPersonResult(data)))
        .then(res => res[0]);
}

function mapArrayToSelectPersonResult(data: any) {
    const result: SelectPersonResult = {
        id: data[0]
    }
    return result;
}

export type SelectPersonOrderBy = {
    column: 'id' | 'name';
    direction: 'asc' | 'desc';
}

function buildOrderBy(orderBy: SelectPersonOrderBy[]): string {
    return orderBy.map(order => \`\\\`\${order.column}\\\` \${order.direction == 'desc' ? 'desc' : 'asc' }\`).join(', ');
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test replace order by parameter', () => {
        const sql = `
        SELECT *
        FROM mytable1
        ORDER BY ?`;
        const actual = (0, mysql2_1.replaceOrderByParam)(sql);
        const expected = `
        SELECT *
        FROM mytable1
        ORDER BY \${buildOrderBy(params.orderBy)}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test replace order by parameter with LIMIT', () => {
        const sql = `
        SELECT *
        FROM mytable1
        ORDER BY ? LIMIT 10`;
        const actual = (0, mysql2_1.replaceOrderByParam)(sql);
        const expected = `
        SELECT *
        FROM mytable1
        ORDER BY \${buildOrderBy(params.orderBy)} LIMIT 10`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test replace order by parameter with extra blank line', () => {
        const sql = `
        SELECT *
        FROM mytable1
        ORDER BY ?
        
        `;
        const actual = (0, mysql2_1.replaceOrderByParam)(sql);
        const expected = `
        SELECT *
        FROM mytable1
        ORDER BY \${buildOrderBy(params.orderBy)}
        
        `;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test generateTsDescriptor - select without parameters', () => {
        const sql = 'SELECT id FROM mytable1';
        const schemaDef = (0, describe_query_1.describeSql)(create_schema_1.dbSchema, sql);
        const tsDescriptor = (0, mysql2_1.generateTsDescriptor)(schemaDef);
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, 'select-id');
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectIdResult = {
    id: number;
}

export async function selectId(connection: Connection): Promise<SelectIdResult[]> {
    const sql = \`
    SELECT id FROM mytable1
    \`

    return connection.query({sql, rowsAsArray: true})
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectIdResult(data)));
}

function mapArrayToSelectIdResult(data: any) {
    const result: SelectIdResult = {
        id: data[0]
    }
    return result;
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test generateTsDescriptor - select with parameters', () => {
        const sql = 'SELECT id from mytable1 where id = ? and value in (?)'; //returns single row result
        const schemaDef = (0, describe_query_1.describeSql)(create_schema_1.dbSchema, sql);
        const tsDescriptor = (0, mysql2_1.generateTsDescriptor)(schemaDef);
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, 'selectId');
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectIdParams = {
    param1: number;
    param2: number[];
}

export type SelectIdResult = {
    id: number;
}

export async function selectId(connection: Connection, params: SelectIdParams): Promise<SelectIdResult | null> {
    const sql = \`
    SELECT id from mytable1 where id = ? and value in (?)
    \`

    return connection.query({sql, rowsAsArray: true}, [params.param1, params.param2.length == 0? null : params.param2])
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectIdResult(data)))
        .then(res => res[0]);
}

function mapArrayToSelectIdResult(data: any) {
    const result: SelectIdResult = {
        id: data[0]
    }
    return result;
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test generateTsDescriptor - select with same parameter used twice', () => {
        const sql = 'SELECT id from mytable1 where id = :id or id = :id';
        const schemaDef = (0, describe_query_1.describeSql)(create_schema_1.dbSchema, sql);
        const tsDescriptor = (0, mysql2_1.generateTsDescriptor)(schemaDef);
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, 'selectId');
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectIdParams = {
    id: number;
}

export type SelectIdResult = {
    id: number;
}

export async function selectId(connection: Connection, params: SelectIdParams): Promise<SelectIdResult[]> {
    const sql = \`
    SELECT id from mytable1 where id = ? or id = ?
    \`

    return connection.query({sql, rowsAsArray: true}, [params.id, params.id])
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectIdResult(data)));
}

function mapArrayToSelectIdResult(data: any) {
    const result: SelectIdResult = {
        id: data[0]
    }
    return result;
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test generateTsDescriptor - update', () => {
        const sql = 'UPDATE mytable1 SET value = ?';
        const schemaDef = (0, describe_query_1.describeSql)(create_schema_1.dbSchema, sql);
        const tsDescriptor = (0, mysql2_1.generateTsDescriptor)(schemaDef);
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, 'update-value');
        const expected = `import type { Connection } from 'mysql2/promise';

export type UpdateValueData = {
    value?: number;
}

export type UpdateValueResult = {
    affectedRows: number;
}

export async function updateValue(connection: Connection, data: UpdateValueData): Promise<UpdateValueResult> {
    const sql = \`
    UPDATE mytable1 SET value = ?
    \`

    return connection.query(sql, [data.value])
        .then(res => res[0] as UpdateValueResult);
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test generateTsDescriptor - update with parameters', () => {
        const sql = 'UPDATE mytable1 SET value = ? WHERE id = ?';
        const schemaDef = (0, describe_query_1.describeSql)(create_schema_1.dbSchema, sql);
        const tsDescriptor = (0, mysql2_1.generateTsDescriptor)(schemaDef);
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, 'update-value');
        const expected = `import type { Connection } from 'mysql2/promise';

export type UpdateValueData = {
    value?: number;
}

export type UpdateValueParams = {
    param1: number;
}

export type UpdateValueResult = {
    affectedRows: number;
}

export async function updateValue(connection: Connection, data: UpdateValueData, params: UpdateValueParams): Promise<UpdateValueResult> {
    const sql = \`
    UPDATE mytable1 SET value = ? WHERE id = ?
    \`

    return connection.query(sql, [data.value, params.param1])
        .then(res => res[0] as UpdateValueResult);
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test generateTsDescriptor - select with order by', () => {
        const sql = 'SELECT id from mytable1 ORDER BY ?';
        const schemaDef = (0, describe_query_1.describeSql)(create_schema_1.dbSchema, sql);
        const tsDescriptor = (0, mysql2_1.generateTsDescriptor)(schemaDef);
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, 'selectId');
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectIdParams = {
    orderBy: [SelectIdOrderBy, ...SelectIdOrderBy[]];
}

export type SelectIdResult = {
    id: number;
}

export async function selectId(connection: Connection, params: SelectIdParams): Promise<SelectIdResult[]> {
    const sql = \`
    SELECT id from mytable1 ORDER BY \${buildOrderBy(params.orderBy)}
    \`

    return connection.query({sql, rowsAsArray: true})
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectIdResult(data)));
}

function mapArrayToSelectIdResult(data: any) {
    const result: SelectIdResult = {
        id: data[0]
    }
    return result;
}

export type SelectIdOrderBy = {
    column: 'id' | 'mytable1.id' | 'value' | 'mytable1.value';
    direction: 'asc' | 'desc';
}

function buildOrderBy(orderBy: SelectIdOrderBy[]): string {
    return orderBy.map(order => \`\\\`\${order.column}\\\` \${order.direction == 'desc' ? 'desc' : 'asc' }\`).join(', ');
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test code generation with escaped table name', () => {
        const sql = 'SELECT id FROM `my table`';
        const schemaDef = (0, describe_query_1.describeSql)(create_schema_1.dbSchema, sql);
        const tsDescriptor = (0, mysql2_1.generateTsDescriptor)(schemaDef);
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, 'select-id');
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectIdResult = {
    id: number;
}

export async function selectId(connection: Connection): Promise<SelectIdResult[]> {
    const sql = \`
    SELECT id FROM \\\`my table\\\`
    \`

    return connection.query({sql, rowsAsArray: true})
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectIdResult(data)));
}

function mapArrayToSelectIdResult(data: any) {
    const result: SelectIdResult = {
        id: data[0]
    }
    return result;
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test generateTsDescriptor for enum column schema', () => {
        const sql = 'SELECT enum_column FROM all_types';
        const schemaDef = (0, describe_query_1.describeSql)(create_schema_1.dbSchema, sql);
        const actual = (0, mysql2_1.generateTsDescriptor)(schemaDef);
        const expected = {
            sql: 'SELECT enum_column FROM all_types',
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'enum_column',
                    tsType: `'x-small' | 'small' | 'medium' | 'large' | 'x-large'`,
                    notNull: false
                }
            ],
            orderByColumns: undefined,
            data: undefined,
            parameterNames: [],
            parameters: []
        };
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('test code generation with duplicated parameters', () => {
        const sql = 'SELECT id from mytable1 where (id = :id or id = :id) and value = :value';
        const schemaDef = (0, describe_query_1.describeSql)(create_schema_1.dbSchema, sql);
        const tsDescriptor = (0, mysql2_1.generateTsDescriptor)(schemaDef);
        const actual = (0, mysql2_1.generateTsCodeForMySQL)(tsDescriptor, 'select-id');
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectIdParams = {
    id: number;
    value: number;
}

export type SelectIdResult = {
    id: number;
}

export async function selectId(connection: Connection, params: SelectIdParams): Promise<SelectIdResult[]> {
    const sql = \`
    SELECT id from mytable1 where (id = ? or id = ?) and value = ?
    \`

    return connection.query({sql, rowsAsArray: true}, [params.id, params.id, params.value])
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectIdResult(data)));
}

function mapArrayToSelectIdResult(data: any) {
    const result: SelectIdResult = {
        id: data[0]
    }
    return result;
}`;
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('generate nested result', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'select-users';
        const sql = `-- @nested
SELECT
    u.id as user_id,
    u.name as user_name,
    p.id as post_id,
    p.title as post_title,
    p.body  as post_body,
    r.id as role_id,
    r.role,
    c.id as comment_id,
    c.comment
FROM users u
LEFT JOIN posts p on p.fk_user = u.id
LEFT JOIN roles r on r.fk_user = u.id
LEFT JOIN comments c on c.fk_post = p.id`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectUsersResult = {
    user_id: number;
    user_name: string;
    post_id: number | null;
    post_title: string | null;
    post_body: string | null;
    role_id: number | null;
    role: 'user' | 'admin' | 'guest' | null;
    comment_id: number | null;
    comment: string | null;
}

export async function selectUsers(connection: Connection): Promise<SelectUsersResult[]> {
    const sql = \`
    -- @nested
    SELECT
        u.id as user_id,
        u.name as user_name,
        p.id as post_id,
        p.title as post_title,
        p.body  as post_body,
        r.id as role_id,
        r.role,
        c.id as comment_id,
        c.comment
    FROM users u
    LEFT JOIN posts p on p.fk_user = u.id
    LEFT JOIN roles r on r.fk_user = u.id
    LEFT JOIN comments c on c.fk_post = p.id
    \`

    return connection.query({sql, rowsAsArray: true})
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectUsersResult(data)));
}

function mapArrayToSelectUsersResult(data: any) {
    const result: SelectUsersResult = {
        user_id: data[0],
        user_name: data[1],
        post_id: data[2],
        post_title: data[3],
        post_body: data[4],
        role_id: data[5],
        role: data[6],
        comment_id: data[7],
        comment: data[8]
    }
    return result;
}

export type SelectUsersNestedUsers = {
    user_id: number;
    user_name: string;
    posts: SelectUsersNestedPosts[];
    roles: SelectUsersNestedRoles[];
}

export type SelectUsersNestedPosts = {
    post_id: number;
    post_title: string;
    post_body: string;
    comments: SelectUsersNestedComments[];
}

export type SelectUsersNestedRoles = {
    role_id: number;
    role: 'user' | 'admin' | 'guest';
}

export type SelectUsersNestedComments = {
    comment_id: number;
    comment: string;
}

export async function selectUsersNested(connection: Connection): Promise<SelectUsersNestedUsers[]> {
    const selectResult = await selectUsers(connection);
    if (selectResult.length == 0) {
        return [];
    }
    return collectSelectUsersNestedUsers(selectResult);
}

function collectSelectUsersNestedUsers(selectResult: SelectUsersResult[]): SelectUsersNestedUsers[] {
    const grouped = groupBy(selectResult.filter(r => r.user_id != null), r => r.user_id);
    return [...grouped.values()].map(r => mapToSelectUsersNestedUsers(r))
}

function mapToSelectUsersNestedUsers(selectResult: SelectUsersResult[]): SelectUsersNestedUsers {
    const firstRow = selectResult[0];
    const result: SelectUsersNestedUsers = {
        user_id: firstRow.user_id!,
        user_name: firstRow.user_name!,
        posts: collectSelectUsersNestedPosts(selectResult),
        roles: collectSelectUsersNestedRoles(selectResult)
    }
    return result;
}

function collectSelectUsersNestedPosts(selectResult: SelectUsersResult[]): SelectUsersNestedPosts[] {
    const grouped = groupBy(selectResult.filter(r => r.post_id != null), r => r.post_id);
    return [...grouped.values()].map(r => mapToSelectUsersNestedPosts(r))
}

function mapToSelectUsersNestedPosts(selectResult: SelectUsersResult[]): SelectUsersNestedPosts {
    const firstRow = selectResult[0];
    const result: SelectUsersNestedPosts = {
        post_id: firstRow.post_id!,
        post_title: firstRow.post_title!,
        post_body: firstRow.post_body!,
        comments: collectSelectUsersNestedComments(selectResult)
    }
    return result;
}

function collectSelectUsersNestedRoles(selectResult: SelectUsersResult[]): SelectUsersNestedRoles[] {
    const grouped = groupBy(selectResult.filter(r => r.role_id != null), r => r.role_id);
    return [...grouped.values()].map(r => mapToSelectUsersNestedRoles(r))
}

function mapToSelectUsersNestedRoles(selectResult: SelectUsersResult[]): SelectUsersNestedRoles {
    const firstRow = selectResult[0];
    const result: SelectUsersNestedRoles = {
        role_id: firstRow.role_id!,
        role: firstRow.role!
    }
    return result;
}

function collectSelectUsersNestedComments(selectResult: SelectUsersResult[]): SelectUsersNestedComments[] {
    const grouped = groupBy(selectResult.filter(r => r.comment_id != null), r => r.comment_id);
    return [...grouped.values()].map(r => mapToSelectUsersNestedComments(r))
}

function mapToSelectUsersNestedComments(selectResult: SelectUsersResult[]): SelectUsersNestedComments {
    const firstRow = selectResult[0];
    const result: SelectUsersNestedComments = {
        comment_id: firstRow.comment_id!,
        comment: firstRow.comment!
    }
    return result;
}

const groupBy = <T, Q>(array: T[], predicate: (value: T, index: number, array: T[]) => Q) => {
    return array.reduce((map, value, index, array) => {
        const key = predicate(value, index, array);
        map.get(key)?.push(value) ?? map.set(key, [value]);
        return map;
    }, new Map<Q, T[]>());
}`;
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('generate nested with params', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'select-users';
        const sql = `-- @nested
SELECT
    u.id as user_id,
    u.name as user_name,
    p.id as post_id,
    p.title as post_title,
    p.body  as post_body
FROM users u
LEFT JOIN posts p on p.fk_user = u.id
WHERE u.id = :id`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectUsersParams = {
    id: number;
}

export type SelectUsersResult = {
    user_id: number;
    user_name: string;
    post_id: number | null;
    post_title: string | null;
    post_body: string | null;
}

export async function selectUsers(connection: Connection, params: SelectUsersParams): Promise<SelectUsersResult[]> {
    const sql = \`
    -- @nested
    SELECT
        u.id as user_id,
        u.name as user_name,
        p.id as post_id,
        p.title as post_title,
        p.body  as post_body
    FROM users u
    LEFT JOIN posts p on p.fk_user = u.id
    WHERE u.id = ?
    \`

    return connection.query({sql, rowsAsArray: true}, [params.id])
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectUsersResult(data)));
}

function mapArrayToSelectUsersResult(data: any) {
    const result: SelectUsersResult = {
        user_id: data[0],
        user_name: data[1],
        post_id: data[2],
        post_title: data[3],
        post_body: data[4]
    }
    return result;
}

export type SelectUsersNestedUsers = {
    user_id: number;
    user_name: string;
    posts: SelectUsersNestedPosts[];
}

export type SelectUsersNestedPosts = {
    post_id: number;
    post_title: string;
    post_body: string;
}

export async function selectUsersNested(connection: Connection, params: SelectUsersParams): Promise<SelectUsersNestedUsers[]> {
    const selectResult = await selectUsers(connection, params);
    if (selectResult.length == 0) {
        return [];
    }
    return collectSelectUsersNestedUsers(selectResult);
}

function collectSelectUsersNestedUsers(selectResult: SelectUsersResult[]): SelectUsersNestedUsers[] {
    const grouped = groupBy(selectResult.filter(r => r.user_id != null), r => r.user_id);
    return [...grouped.values()].map(r => mapToSelectUsersNestedUsers(r))
}

function mapToSelectUsersNestedUsers(selectResult: SelectUsersResult[]): SelectUsersNestedUsers {
    const firstRow = selectResult[0];
    const result: SelectUsersNestedUsers = {
        user_id: firstRow.user_id!,
        user_name: firstRow.user_name!,
        posts: collectSelectUsersNestedPosts(selectResult)
    }
    return result;
}

function collectSelectUsersNestedPosts(selectResult: SelectUsersResult[]): SelectUsersNestedPosts[] {
    const grouped = groupBy(selectResult.filter(r => r.post_id != null), r => r.post_id);
    return [...grouped.values()].map(r => mapToSelectUsersNestedPosts(r))
}

function mapToSelectUsersNestedPosts(selectResult: SelectUsersResult[]): SelectUsersNestedPosts {
    const firstRow = selectResult[0];
    const result: SelectUsersNestedPosts = {
        post_id: firstRow.post_id!,
        post_title: firstRow.post_title!,
        post_body: firstRow.post_body!
    }
    return result;
}

const groupBy = <T, Q>(array: T[], predicate: (value: T, index: number, array: T[]) => Q) => {
    return array.reduce((map, value, index, array) => {
        const key = predicate(value, index, array);
        map.get(key)?.push(value) ?? map.set(key, [value]);
        return map;
    }, new Map<Q, T[]>());
}`;
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('generate nested result with many to many relation', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'select-answers';
        const sql = `-- @nested
SELECT
    s.id as surveyId,
    s.name as surveyName,
    p.id as participantId,
    u.id as userId,
    u.name as userName
FROM surveys s
INNER JOIN participants p on p.fk_survey = s.id
INNER JOIN users u on p.fk_user = :user_id`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectAnswersParams = {
    user_id: number;
}

export type SelectAnswersResult = {
    surveyId: number;
    surveyName: string;
    participantId: number;
    userId: number;
    userName: string;
}

export async function selectAnswers(connection: Connection, params: SelectAnswersParams): Promise<SelectAnswersResult[]> {
    const sql = \`
    -- @nested
    SELECT
        s.id as surveyId,
        s.name as surveyName,
        p.id as participantId,
        u.id as userId,
        u.name as userName
    FROM surveys s
    INNER JOIN participants p on p.fk_survey = s.id
    INNER JOIN users u on p.fk_user = ?
    \`

    return connection.query({sql, rowsAsArray: true}, [params.user_id])
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectAnswersResult(data)));
}

function mapArrayToSelectAnswersResult(data: any) {
    const result: SelectAnswersResult = {
        surveyId: data[0],
        surveyName: data[1],
        participantId: data[2],
        userId: data[3],
        userName: data[4]
    }
    return result;
}

export type SelectAnswersNestedSurveys = {
    surveyId: number;
    surveyName: string;
    users: SelectAnswersNestedUsers[];
}

export type SelectAnswersNestedUsers = {
    participantId: number;
    userId: number;
    userName: string;
}

export async function selectAnswersNested(connection: Connection, params: SelectAnswersParams): Promise<SelectAnswersNestedSurveys[]> {
    const selectResult = await selectAnswers(connection, params);
    if (selectResult.length == 0) {
        return [];
    }
    return collectSelectAnswersNestedSurveys(selectResult);
}

function collectSelectAnswersNestedSurveys(selectResult: SelectAnswersResult[]): SelectAnswersNestedSurveys[] {
    const grouped = groupBy(selectResult.filter(r => r.surveyId != null), r => r.surveyId);
    return [...grouped.values()].map(r => mapToSelectAnswersNestedSurveys(r))
}

function mapToSelectAnswersNestedSurveys(selectResult: SelectAnswersResult[]): SelectAnswersNestedSurveys {
    const firstRow = selectResult[0];
    const result: SelectAnswersNestedSurveys = {
        surveyId: firstRow.surveyId!,
        surveyName: firstRow.surveyName!,
        users: collectSelectAnswersNestedUsers(selectResult)
    }
    return result;
}

function collectSelectAnswersNestedUsers(selectResult: SelectAnswersResult[]): SelectAnswersNestedUsers[] {
    const grouped = groupBy(selectResult.filter(r => r.userId != null), r => r.userId);
    return [...grouped.values()].map(r => mapToSelectAnswersNestedUsers(r))
}

function mapToSelectAnswersNestedUsers(selectResult: SelectAnswersResult[]): SelectAnswersNestedUsers {
    const firstRow = selectResult[0];
    const result: SelectAnswersNestedUsers = {
        participantId: firstRow.participantId!,
        userId: firstRow.userId!,
        userName: firstRow.userName!
    }
    return result;
}

const groupBy = <T, Q>(array: T[], predicate: (value: T, index: number, array: T[]) => Q) => {
    return array.reduce((map, value, index, array) => {
        const key = predicate(value, index, array);
        map.get(key)?.push(value) ?? map.set(key, [value]);
        return map;
    }, new Map<Q, T[]>());
}`;
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('generate nested result with many to many relation', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'select-clients';
        const sql = `-- @nested
SELECT
    c.id,
    a1.*,
    a2.*
FROM clients as c
INNER JOIN addresses as a1 ON a1.id = c.primaryAddress
LEFT JOIN addresses as a2 ON a2.id = c.secondaryAddress
WHERE c.id = :clientId`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectClientsParams = {
    clientId: number;
}

export type SelectClientsResult = {
    id: number;
    id_2: number;
    address: string;
    id_3: number;
    address_2: string | null;
}

export async function selectClients(connection: Connection, params: SelectClientsParams): Promise<SelectClientsResult[]> {
    const sql = \`
    -- @nested
    SELECT
        c.id,
        a1.*,
        a2.*
    FROM clients as c
    INNER JOIN addresses as a1 ON a1.id = c.primaryAddress
    LEFT JOIN addresses as a2 ON a2.id = c.secondaryAddress
    WHERE c.id = ?
    \`

    return connection.query({sql, rowsAsArray: true}, [params.clientId])
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectClientsResult(data)));
}

function mapArrayToSelectClientsResult(data: any) {
    const result: SelectClientsResult = {
        id: data[0],
        id_2: data[1],
        address: data[2],
        id_3: data[3],
        address_2: data[4]
    }
    return result;
}

export type SelectClientsNestedC = {
    id: number;
    a1: SelectClientsNestedA1;
    a2: SelectClientsNestedA2 | null;
}

export type SelectClientsNestedA1 = {
    id: number;
    address: string;
}

export type SelectClientsNestedA2 = {
    id: number;
    address: string;
}

export async function selectClientsNested(connection: Connection, params: SelectClientsParams): Promise<SelectClientsNestedC[]> {
    const selectResult = await selectClients(connection, params);
    if (selectResult.length == 0) {
        return [];
    }
    return collectSelectClientsNestedC(selectResult);
}

function collectSelectClientsNestedC(selectResult: SelectClientsResult[]): SelectClientsNestedC[] {
    const grouped = groupBy(selectResult.filter(r => r.id != null), r => r.id);
    return [...grouped.values()].map(r => mapToSelectClientsNestedC(r))
}

function mapToSelectClientsNestedC(selectResult: SelectClientsResult[]): SelectClientsNestedC {
    const firstRow = selectResult[0];
    const result: SelectClientsNestedC = {
        id: firstRow.id!,
        a1: collectSelectClientsNestedA1(selectResult)[0],
        a2: collectSelectClientsNestedA2(selectResult)[0]
    }
    return result;
}

function collectSelectClientsNestedA1(selectResult: SelectClientsResult[]): SelectClientsNestedA1[] {
    const grouped = groupBy(selectResult.filter(r => r.id_2 != null), r => r.id_2);
    return [...grouped.values()].map(r => mapToSelectClientsNestedA1(r))
}

function mapToSelectClientsNestedA1(selectResult: SelectClientsResult[]): SelectClientsNestedA1 {
    const firstRow = selectResult[0];
    const result: SelectClientsNestedA1 = {
        id: firstRow.id_2!,
        address: firstRow.address!
    }
    return result;
}

function collectSelectClientsNestedA2(selectResult: SelectClientsResult[]): SelectClientsNestedA2[] {
    const grouped = groupBy(selectResult.filter(r => r.id_3 != null), r => r.id_3);
    return [...grouped.values()].map(r => mapToSelectClientsNestedA2(r))
}

function mapToSelectClientsNestedA2(selectResult: SelectClientsResult[]): SelectClientsNestedA2 {
    const firstRow = selectResult[0];
    const result: SelectClientsNestedA2 = {
        id: firstRow.id_3!,
        address: firstRow.address_2!
    }
    return result;
}

const groupBy = <T, Q>(array: T[], predicate: (value: T, index: number, array: T[]) => Q) => {
    return array.reduce((map, value, index, array) => {
        const key = predicate(value, index, array);
        map.get(key)?.push(value) ?? map.set(key, [value]);
        return map;
    }, new Map<Q, T[]>());
}`;
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('generate nested result with many to many relation - duplicated field name', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'select-books';
        const sql = `-- @nested
SELECT *
FROM books b
INNER JOIN books_authors ba on ba.book_id = b.id
INNER JOIN authors a on a.id = ba.author_id`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        const expected = `import type { Connection } from 'mysql2/promise';

export type SelectBooksResult = {
    id: number;
    title: string;
    isbn: string;
    id_2: number;
    book_id: number;
    author_id: number;
    author_ordinal: number;
    id_3: number;
    fullName: string;
    shortName: string | null;
}

export async function selectBooks(connection: Connection): Promise<SelectBooksResult[]> {
    const sql = \`
    -- @nested
    SELECT *
    FROM books b
    INNER JOIN books_authors ba on ba.book_id = b.id
    INNER JOIN authors a on a.id = ba.author_id
    \`

    return connection.query({sql, rowsAsArray: true})
        .then(res => res[0] as any[])
        .then(res => res.map(data => mapArrayToSelectBooksResult(data)));
}

function mapArrayToSelectBooksResult(data: any) {
    const result: SelectBooksResult = {
        id: data[0],
        title: data[1],
        isbn: data[2],
        id_2: data[3],
        book_id: data[4],
        author_id: data[5],
        author_ordinal: data[6],
        id_3: data[7],
        fullName: data[8],
        shortName: data[9]
    }
    return result;
}

export type SelectBooksNestedBooks = {
    id: number;
    title: string;
    isbn: string;
    authors: SelectBooksNestedAuthors[];
}

export type SelectBooksNestedAuthors = {
    id: number;
    book_id: number;
    author_id: number;
    author_ordinal: number;
    id_2: number;
    fullName: string;
    shortName: string;
}

export async function selectBooksNested(connection: Connection): Promise<SelectBooksNestedBooks[]> {
    const selectResult = await selectBooks(connection);
    if (selectResult.length == 0) {
        return [];
    }
    return collectSelectBooksNestedBooks(selectResult);
}

function collectSelectBooksNestedBooks(selectResult: SelectBooksResult[]): SelectBooksNestedBooks[] {
    const grouped = groupBy(selectResult.filter(r => r.id != null), r => r.id);
    return [...grouped.values()].map(r => mapToSelectBooksNestedBooks(r))
}

function mapToSelectBooksNestedBooks(selectResult: SelectBooksResult[]): SelectBooksNestedBooks {
    const firstRow = selectResult[0];
    const result: SelectBooksNestedBooks = {
        id: firstRow.id!,
        title: firstRow.title!,
        isbn: firstRow.isbn!,
        authors: collectSelectBooksNestedAuthors(selectResult)
    }
    return result;
}

function collectSelectBooksNestedAuthors(selectResult: SelectBooksResult[]): SelectBooksNestedAuthors[] {
    const grouped = groupBy(selectResult.filter(r => r.id_3 != null), r => r.id_3);
    return [...grouped.values()].map(r => mapToSelectBooksNestedAuthors(r))
}

function mapToSelectBooksNestedAuthors(selectResult: SelectBooksResult[]): SelectBooksNestedAuthors {
    const firstRow = selectResult[0];
    const result: SelectBooksNestedAuthors = {
        id: firstRow.id_2!,
        book_id: firstRow.book_id!,
        author_id: firstRow.author_id!,
        author_ordinal: firstRow.author_ordinal!,
        id_2: firstRow.id_3!,
        fullName: firstRow.fullName!,
        shortName: firstRow.shortName!
    }
    return result;
}

const groupBy = <T, Q>(array: T[], predicate: (value: T, index: number, array: T[]) => Q) => {
    return array.reduce((map, value, index, array) => {
        const key = predicate(value, index, array);
        map.get(key)?.push(value) ?? map.set(key, [value]);
        return map;
    }, new Map<Q, T[]>());
}`;
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('dynamic-query-01', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'dynamic-query-01';
        const sql = `-- @dynamicQuery
SELECT m1.id, m1.value, m2.name, m2.descr as description
FROM mytable1 m1
INNER JOIN mytable2 m2 on m1.id = m2.id
WHERE m2.name = :name
AND m2.descr = :description`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        //tests\expected-code\dynamic-query01.ts
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/expected-code/dynamic-query01.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('dynamic-query-02', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'derivated-table';
        const sql = `-- @dynamicQuery
SELECT m1.id, m2.name
FROM mytable1 m1
INNER JOIN ( -- derivated table
	SELECT id, name from mytable2 m 
	WHERE m.name = :subqueryName
) m2
WHERE (:name is NULL or m2.name = :name)`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        //tests\expected-code\dynamic-query01.ts
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/expected-code/dynamic-query02.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('dynamic-query-03 - without parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'dynamic-query03';
        const sql = `-- @dynamicQuery
SELECT t1.id, t1.value
FROM mytable1 t1`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        //tests\expected-code\dynamic-query01.ts
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/expected-code/dynamic-query03.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('dynamic-query-04 - select *', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'dynamic-query04'; //
        const sql = `-- @dynamicQuery
SELECT 
    *
FROM mytable1 m1
INNER JOIN mytable2 m2 on m2.id = m1.id`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        //tests\expected-code\dynamic-query01.ts
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/expected-code/dynamic-query04.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('dynamic-query-05 - cte', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'cte';
        const sql = `-- @dynamicQuery
    WITH 
    cte as (
            select id, name from mytable2
        )
SELECT 
    m1.id,
    m2.name
FROM mytable1 m1
INNER JOIN cte m2 on m2.id = m1.id
WHERE m2.name LIKE concat('%', :name, '%')`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        //tests\expected-code\dynamic-query01.ts
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/expected-code/dynamic-query05.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('dynamic-query-06 - select * ORDER BY ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'dynamic-query06';
        const sql = `-- @dynamicQuery
SELECT 
    *
FROM mytable1 m1
INNER JOIN mytable2 m2 on m2.id = m1.id
ORDER BY ?`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        //tests\expected-code\dynamic-query01.ts
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/expected-code/dynamic-query06.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('dynamic-query-07 - select * ORDER BY ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const queryName = 'dynamic-query07';
        const sql = `-- @dynamicQuery
SELECT 
    m1.id as myId,
    m2.name
FROM mytable1 m1
INNER JOIN mytable2 m2 on m2.id = m1.id
ORDER BY ?`;
        const actual = yield (0, mysql2_1.generateTsFileFromContent)(client, queryName, sql);
        //tests\expected-code\dynamic-query01.ts
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/expected-code/dynamic-query07.ts.txt');
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
});
//# sourceMappingURL=code-generator.test.js.map