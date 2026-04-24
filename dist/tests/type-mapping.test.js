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
const describe_query_1 = require("../src/describe-query");
const queryExectutor_1 = require("../src/queryExectutor");
describe('type-mapping', () => {
    let client;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        client = yield (0, queryExectutor_1.createMysqlClientForTest)('mysql://root:password@localhost/mydb');
    }));
    it('select table with all types', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select * from all_types';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        const expected = [
            {
                name: 'decimal_column',
                type: 'decimal',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'tinyint_column',
                type: 'tinyint',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'smallint_column',
                type: 'smallint',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'int_column',
                type: 'int',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'float_column',
                type: 'float',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'double_column',
                type: 'double',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'timestamp_column',
                type: 'timestamp',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'bigint_column',
                type: 'bigint',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'mediumint_column',
                type: 'mediumint',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'date_column',
                type: 'date',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'time_column',
                type: 'time',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'datetime_column',
                type: 'datetime',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'year_column',
                type: 'year',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'varchar_column',
                type: 'varchar',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'bit_column',
                type: 'bit',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'json_column',
                type: 'json',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'enum_column',
                type: `enum('x-small','small','medium','large','x-large')`,
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'set_column',
                type: 'set',
                notNull: false,
                table: 'all_types'
            },
            {
                type: 'tinyblob',
                name: 'tinyblob_column',
                notNull: false,
                table: 'all_types'
            },
            {
                type: 'mediumblob',
                name: 'mediumblob_column',
                notNull: false,
                table: 'all_types'
            },
            {
                type: 'longblob',
                name: 'longblob_column',
                notNull: false,
                table: 'all_types'
            },
            {
                type: 'blob',
                name: 'blob_column',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'tinytext_column',
                type: 'tinytext',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'mediumtext_column',
                type: 'mediumtext',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'longtext_column',
                type: 'longtext',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'text_column',
                type: 'text',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'varbinary_column',
                type: 'varbinary',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'binary_column',
                type: 'binary',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'char_column',
                type: 'char',
                notNull: false,
                table: 'all_types'
            },
            {
                name: 'geometry_column',
                type: 'geometry',
                notNull: false,
                table: 'all_types'
            }
        ];
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        node_assert_1.default.deepStrictEqual(actual.right.columns, expected);
    }));
    it('compare type names from schema with convertion from code', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select * from all_types';
        const actual = yield (0, describe_query_1.parseSql)(client, sql);
        if ((0, Either_1.isLeft)(actual)) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.left.description}`);
        }
        const actualColumns = actual.right.columns.map((col) => {
            const nameAndType = {
                name: col.name,
                type: col.type
            };
            return nameAndType;
        });
        const schema = yield (0, queryExectutor_1.loadMysqlSchema)(client.client, client.schema);
        if (schema.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error`);
        }
        const expected = schema.value
            .filter((colInfo) => actualColumns.find((col) => col.name === colInfo.column))
            .map((col) => {
            const nameAndType = {
                name: col.column,
                type: col.column_type
            };
            return nameAndType;
        });
        node_assert_1.default.deepStrictEqual(actualColumns, expected);
    }));
});
//# sourceMappingURL=type-mapping.test.js.map