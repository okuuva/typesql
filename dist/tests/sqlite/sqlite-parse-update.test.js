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
const Either_1 = require("fp-ts/lib/Either");
const parser_1 = require("../../src/sqlite-query-analyzer/parser");
const create_schema_1 = require("../mysql-query-analyzer/create-schema");
describe('sqlite-parse-update', () => {
    it('update mytable1 set value = ? where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
        update mytable1 set value = ? where id = ?
            `;
        const actual = yield (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('UPDATE mytable2 SET name = :name, descr= :descr WHERE id = :id', () => {
        const sql = `
        UPDATE mytable2 SET name = ?, descr= ? WHERE id = ?
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'param1',
                    columnType: 'TEXT',
                    notNull: false
                },
                {
                    name: 'param2',
                    columnType: 'TEXT',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('update mytable1 set value = :value where id > :min and id < :max', () => {
        const sql = `
        update mytable1 set value = :value where id > :min and id < :max
            `;
        const expectedSql = `
        update mytable1 set value = ? where id > ? and id < ?
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'min',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'max',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('update mytable1 set value = :value where id > :value or id < :value', () => {
        const sql = `
        update mytable1 set value = :value where id > :value or id < :value
            `;
        const expectedSql = `
        update mytable1 set value = ? where id > ? or id < ?
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('UPDATE mytable1 SET id = IFNULL(:id, id)', () => {
        const sql = `
        UPDATE mytable1 SET id = IFNULL(:id, id)
            `;
        const expectedSql = `
        UPDATE mytable1 SET id = IFNULL(?, id)
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'id',
                    columnType: 'INTEGER',
                    notNull: false
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('UPDATE mytable1 SET id = CASE WHEN :valueSet THEN :value ELSE value END WHERE id = :id', () => {
        const sql = `
        UPDATE mytable1 SET id = CASE WHEN :valueSet THEN :value ELSE value END WHERE id = :id
            `;
        const expectedSql = `
        UPDATE mytable1 SET id = CASE WHEN ? THEN ? ELSE value END WHERE id = ?
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'valueSet',
                    columnType: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'id',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('UPDATE mytable2 SET name = CASE WHEN :nameSet THEN :name ELSE name END WHERE id = :id', () => {
        const sql = `
        UPDATE mytable2 SET name = CASE WHEN :nameSet THEN :name ELSE name END WHERE id = :id
            `;
        const expectedSql = `
        UPDATE mytable2 SET name = CASE WHEN ? THEN ? ELSE name END WHERE id = ?
            `;
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns: [],
            data: [
                {
                    name: 'nameSet',
                    columnType: 'INTEGER',
                    notNull: false
                },
                {
                    name: 'name',
                    columnType: 'TEXT',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'id',
                    columnType: 'INTEGER',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('UPDATE mytable1 SET value = $1 RETURNING *', () => {
        const sql = 'UPDATE mytable1 SET value = :value RETURNING *';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'UPDATE mytable1 SET value = ? RETURNING *',
            queryType: 'Update',
            multipleRowsResult: false,
            returning: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false
                }
            ],
            data: [
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: false
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
    it('UPDATE mytable1 SET value = $1 RETURNING id, id+id, value', () => {
        const sql = 'UPDATE mytable1 SET value = :value RETURNING id, id+id, value';
        const actual = (0, parser_1.parseSql)(sql, create_schema_1.sqliteDbSchema);
        const expected = {
            sql: 'UPDATE mytable1 SET value = ? RETURNING id, id+id, value',
            queryType: 'Update',
            multipleRowsResult: false,
            returning: true,
            columns: [
                {
                    name: 'id',
                    type: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'id+id',
                    type: 'INTEGER',
                    notNull: true
                },
                {
                    name: 'value',
                    type: 'INTEGER',
                    notNull: false
                }
            ],
            data: [
                {
                    name: 'value',
                    columnType: 'INTEGER',
                    notNull: false
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    });
});
//# sourceMappingURL=sqlite-parse-update.test.js.map