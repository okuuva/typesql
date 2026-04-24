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
describe('postgres-describe-copy-stmt', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    it('COPY mytable1 (value) FROM STDIN WITH CSV', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'COPY mytable1 (value) FROM STDIN WITH CSV';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Copy',
            sql,
            columns: [],
            parameters: [
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('COPY mytable1 FROM STDIN WITH CSV', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'COPY mytable1 FROM STDIN WITH CSV';
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            multipleRowsResult: false,
            queryType: 'Copy',
            sql,
            columns: [],
            parameters: [
                {
                    name: 'id',
                    type: 'int4',
                    notNull: true
                },
                {
                    name: 'value',
                    type: 'int4',
                    notNull: false
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
});
//# sourceMappingURL=describe-copy-stmt.test.js.map