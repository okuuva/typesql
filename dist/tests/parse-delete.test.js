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
const describe_query_1 = require("../src/describe-query");
const queryExectutor_1 = require("../src/queryExectutor");
const Either_1 = require("fp-ts/lib/Either");
describe('parse delete statements', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    it('delete from mytable1 where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'delete from mytable1 where id = ?';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: 'delete from mytable1 where id = ?',
            queryType: 'Delete',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('delete from mytable1 where id = :id', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'delete from mytable1 where id = :id';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: 'delete from mytable1 where id = ?',
            queryType: 'Delete',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: [
                {
                    name: 'id',
                    columnType: 'int',
                    notNull: true
                }
            ]
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    it('delete from mytable1 where value = 0 or value is null', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'delete from mytable1 where value = 0 or value is null';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = {
            sql: 'delete from mytable1 where value = 0 or value is null',
            queryType: 'Delete',
            multipleRowsResult: false,
            columns: [
                {
                    name: 'affectedRows',
                    type: 'int',
                    notNull: true
                }
            ],
            parameters: []
        };
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.right, expected);
    }));
    /**
     *  const parser = new MySQLParser({
            version: '8.0.17',
            mode: SqlMode.AnsiQuotes
        })
        //tableRef ({serverVersion >= 80017}? tableAlias)?
     */
    //in order to use this in mocha, don't use arrow function.
    it('delete from mytable1 t1 where t1.id = ?', function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client.isVersion8) {
                this.skip();
            }
            const sql = 'delete from mytable1 t1 where t1.id = ?';
            const actual = yield (0, describe_query_1.parseSql)(client, sql);
            const expected = {
                sql: 'delete from mytable1 t1 where t1.id = ?',
                queryType: 'Delete',
                multipleRowsResult: false,
                columns: [
                    {
                        name: 'affectedRows',
                        type: 'int',
                        notNull: true
                    }
                ],
                parameters: [
                    {
                        name: 'param1',
                        columnType: 'int',
                        notNull: true
                    }
                ]
            };
            if ((0, Either_1.isLeft)(actual)) {
                node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
            }
            node_assert_1.default.deepStrictEqual(actual.right, expected);
        });
    });
});
//# sourceMappingURL=parse-delete.test.js.map