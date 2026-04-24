"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const Either_1 = require("fp-ts/lib/Either");
const query_executor_1 = require("../../src/sqlite-query-analyzer/query-executor");
const libsql_1 = require("../../src/drivers/libsql");
const parser_1 = require("../../src/sqlite-query-analyzer/parser");
const create_schema_1 = require("../mysql-query-analyzer/create-schema");
describe('load-extension', () => {
    it('better-sqlite3 - load_extension uuid4', () => {
        const client = (0, query_executor_1.createSqliteClient)('better-sqlite3', './mydb.db', [], ['./tests/ext/uuid.dll']);
        if (client.isErr()) {
            assert_1.default.fail(`Shouldn't return an Error`);
        }
        const clientType = client.value.type;
        if (clientType != 'better-sqlite3') {
            assert_1.default.fail(`Shouldn't return an Error`);
        }
        const explainSqlResult = (0, query_executor_1.explainSql)(client.value.client, 'SELECT uuid4()');
        if ((0, Either_1.isLeft)(explainSqlResult)) {
            assert_1.default.fail(`Shouldn't return an Error`);
        }
        assert_1.default.deepStrictEqual(explainSqlResult.right, true);
    });
    it('bun:sqlite - load_extension uuid4', () => {
        const client = (0, query_executor_1.createSqliteClient)('bun:sqlite', './mydb.db', [], ['./tests/ext/uuid.dll']);
        if (client.isErr()) {
            assert_1.default.fail(`Shouldn't return an Error`);
        }
        const clientType = client.value.type;
        if (clientType != 'bun:sqlite') {
            assert_1.default.fail(`Shouldn't return an Error`);
        }
        const explainSqlResult = (0, query_executor_1.explainSql)(client.value.client, 'SELECT uuid4()');
        if ((0, Either_1.isLeft)(explainSqlResult)) {
            assert_1.default.fail(`Shouldn't return an Error`);
        }
        assert_1.default.deepStrictEqual(explainSqlResult.right, true);
    });
    it('libsql - load_extension uuid4', () => {
        //C:\dev\typesql\tests\ext\uuid.dll
        const client = (0, libsql_1.createLibSqlClient)('./mydb.db', [], ['./tests/ext/uuid.dll'], 'authtoken');
        if (client.isErr()) {
            assert_1.default.fail(`Shouldn't return an Error`);
        }
        const clientType = client.value.type;
        if (clientType != 'libsql') {
            assert_1.default.fail(`Shouldn't return an Error`);
        }
        const explainSqlResult = (0, query_executor_1.explainSql)(client.value.client, 'SELECT uuid4()');
        if ((0, Either_1.isLeft)(explainSqlResult)) {
            assert_1.default.fail(`Shouldn't return an Error`);
        }
        assert_1.default.deepStrictEqual(explainSqlResult.right, true);
    });
    it('select uuid4() as uuid4, uuid7() as uuid7', () => {
        const sql = 'select uuid4() as uuid4, uuid7() as uuid7';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'uuid4',
                    type: 'TEXT',
                    notNull: true,
                    table: ''
                },
                {
                    name: 'uuid7',
                    type: 'TEXT',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        assert_1.default.deepStrictEqual(actual.right, expected);
    });
});
//# sourceMappingURL=sqlite-load-extension.test.js.map