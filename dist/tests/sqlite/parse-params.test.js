"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const Either_1 = require("fp-ts/lib/Either");
const parser_1 = require("../../src/sqlite-query-analyzer/parser");
const create_schema_1 = require("../mysql-query-analyzer/create-schema");
describe('parse-params', () => {
    it('SELECT ? IS NOT NULL FROM mytable2 WHERE ? IS NOT NULL', () => {
        const sql = `
        SELECT ? IS NOT NULL
        FROM mytable2 WHERE ? IS NOT NULL`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'any',
                notNull: false
            },
            {
                name: 'param2',
                columnType: 'any',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    });
    it(' SELECT ? IS TRUE, ? IS FALSE FROM mytable2 WHERE ? IS TRUE OR ? IS FALSE', () => {
        const sql = `
        SELECT ? IS TRUE, ? IS FALSE
        FROM mytable2 WHERE ? IS TRUE OR ? IS FALSE`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'BOOLEAN',
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'BOOLEAN',
                notNull: true
            },
            {
                name: 'param3',
                columnType: 'BOOLEAN',
                notNull: true
            },
            {
                name: 'param4',
                columnType: 'BOOLEAN',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    });
    it(' SELECT ? IS TRUE, ? IS FALSE FROM mytable2 WHERE ? IS TRUE OR ? IS FALSE', () => {
        const sql = `
        SELECT id
        FROM mytable2 WHERE :param IS TRUE OR :param is null`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expectedParameters = [
            {
                name: 'param',
                columnType: 'BOOLEAN',
                notNull: false
            },
            {
                name: 'param',
                columnType: 'BOOLEAN',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    });
    it(' SELECT ? IS TRUE, ? IS FALSE FROM mytable2 WHERE ? IS TRUE OR ? IS FALSE', () => {
        const sql = `
        SELECT
			id
		FROM mytable1 
		WHERE :param1 is true OR (:param2 is true OR :param2 is null)`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'BOOLEAN',
                notNull: true
            },
            {
                name: 'param2',
                columnType: 'BOOLEAN',
                notNull: false
            },
            {
                name: 'param2',
                columnType: 'BOOLEAN',
                notNull: false
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    });
    it('parse select with case when expression (? is not null)', () => {
        const sql = `
        SELECT
            CASE WHEN (? IS NOT NULL)
              THEN ?
              ELSE 'a'
            END
        FROM mytable2`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expectedParameters = [
            {
                name: 'param1',
                columnType: 'any',
                notNull: false
            },
            {
                name: 'param2',
                columnType: 'TEXT',
                notNull: true
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    });
    it('parse select with case when expression (param is not null)', () => {
        //new
        const sql = `
        SELECT
            CASE WHEN (:param IS NOT NULL)
              THEN :param
              ELSE 'a'
            END
        FROM mytable2`;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expectedParameters = [
            {
                name: 'param',
                columnType: 'TEXT',
                notNull: false //diff from mysql
            },
            {
                name: 'param',
                columnType: 'TEXT',
                notNull: false //diff from mysql
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.parameters, expectedParameters);
    });
});
//# sourceMappingURL=parse-params.test.js.map