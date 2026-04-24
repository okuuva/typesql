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
describe('postgres-type-mapping', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    it('select table with all types', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select * from all_types';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: true,
            queryType: 'Select',
            sql,
            columns: [
                {
                    name: 'bool_column',
                    type: 'bool',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'bytea_column',
                    type: 'bytea',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'char_column',
                    type: 'bpchar',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'name_column',
                    type: 'name',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'int8_column',
                    type: 'int8',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'int2_column',
                    type: 'int2',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'int4_column',
                    type: 'int4',
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
                    name: 'varchar_column',
                    type: 'varchar',
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
                    name: 'bit_column',
                    type: 'bit',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'numeric_column',
                    type: 'numeric',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'uuid_column',
                    type: 'uuid',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'float4_column',
                    type: 'float4',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: 'float8_column',
                    type: 'float8',
                    notNull: false,
                    table: 'all_types'
                },
                {
                    name: "timestamp_column",
                    notNull: false,
                    table: "all_types",
                    type: "timestamp"
                },
                {
                    name: "timestamp_not_null_column",
                    notNull: true,
                    table: "all_types",
                    type: "timestamp"
                },
                {
                    name: "timestamptz_column",
                    notNull: false,
                    table: "all_types",
                    type: "timestamptz"
                },
                {
                    name: "timestamptz_not_null_column",
                    notNull: true,
                    table: "all_types",
                    type: "timestamptz"
                },
                {
                    name: 'enum_column',
                    notNull: false,
                    table: 'all_types',
                    type: `enum('x-small','small','medium','large','x-large')`
                },
                {
                    name: 'enum_constraint',
                    notNull: false,
                    table: 'all_types',
                    type: `enum('x-small','small','medium','large','x-large')`
                },
                {
                    name: 'integer_column_default',
                    notNull: false,
                    table: 'all_types',
                    type: 'int4'
                },
                {
                    name: 'enum_column_default',
                    notNull: false,
                    table: 'all_types',
                    type: 'enum(\'x-small\',\'small\',\'medium\',\'large\',\'x-large\')'
                },
                {
                    name: 'enum_constraint_default',
                    notNull: false,
                    table: 'all_types',
                    type: 'enum(\'x-small\',\'small\',\'medium\',\'large\',\'x-large\')'
                },
                {
                    name: 'positive_number_column',
                    type: 'int4',
                    notNull: false,
                    table: 'all_types'
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
//# sourceMappingURL=type-mapping.test.js.map