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
const postgres_1 = __importDefault(require("postgres"));
const postgres_2 = require("../../src/drivers/postgres");
const schema_1 = require("./schema");
describe('postgres-query-executor', () => {
    const sql = (0, postgres_1.default)({
        host: 'localhost',
        username: 'postgres',
        password: 'password',
        database: 'postgres',
        port: 5432
    });
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield sql.end();
    }));
    it('loadDbSchema-connection-error', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = (0, postgres_1.default)('postgres://postgres:password123@127.0.0.1:5432/postgres');
        const result = yield (0, postgres_2.loadDbSchema)(client);
        if (result.isOk()) {
            node_assert_1.default.fail('Should return an error');
        }
        const expected = {
            name: 'PostgresError',
            description: `password authentication failed for user "postgres"`
        };
        node_assert_1.default.deepStrictEqual(result.error, expected);
    }));
    it('postgresDescribe-connection-error', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = (0, postgres_1.default)('postgres://postgres:password123@127.0.0.1:5432/postgres');
        const result = yield (0, postgres_2.postgresDescribe)(client, 'SELECT 1');
        if (result.isOk()) {
            node_assert_1.default.fail('Should return an error');
        }
        const expected = {
            name: 'PostgresError',
            description: `password authentication failed for user "postgres"`
        };
        node_assert_1.default.deepStrictEqual(result.error, expected);
    }));
    it('postgresDescribe-Invalid sql', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = (0, postgres_1.default)('postgres://postgres:password@127.0.0.1:5432/postgres');
        const result = yield (0, postgres_2.postgresDescribe)(client, 'SELECT asdf FROM mytable1');
        if (result.isOk()) {
            node_assert_1.default.fail('Should return an error');
        }
        const expected = {
            name: 'PostgresError',
            description: `column "asdf" does not exist`
        };
        node_assert_1.default.deepStrictEqual(result.error, expected);
    }));
    it('loadForeignKeys-connection-error', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = (0, postgres_1.default)('postgres://postgres:password123@127.0.0.1:5432/postgres');
        const result = yield (0, postgres_2.loadForeignKeys)(client);
        if (result.isOk()) {
            node_assert_1.default.fail('Should return an error');
        }
        const expected = {
            name: 'PostgresError',
            description: `password authentication failed for user "postgres"`
        };
        node_assert_1.default.deepStrictEqual(result.error, expected);
    }));
    it('loadDbSchema', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, postgres_2.loadDbSchema)(sql);
        const expected = schema_1.schema;
        if (result.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${result.error}`);
        }
        node_assert_1.default.deepStrictEqual(result.value.filter(col => !col.table.includes('flyway')), expected);
    }));
    it('loadEnums', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, postgres_2.loadEnumsMap)(sql);
        if (result.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${result.error}`);
        }
        node_assert_1.default.deepStrictEqual(result.value, schema_1.enumMap);
    }));
    it('loadCheckConstraints', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, postgres_2.loadCheckConstraints)(sql);
        if (result.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${result.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(result.value, schema_1.checkConstraints);
    }));
    it('loadUserFunctions', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, postgres_2.loadUserFunctions)(sql);
        if (result.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${result.error.description}`);
        }
        const expected = (0, schema_1.normalizeUserFunctions)(result.value);
        const actual = (0, schema_1.normalizeUserFunctions)(schema_1.userFunctions);
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('postgresDescribe', () => __awaiter(void 0, void 0, void 0, function* () {
        const actual = yield (0, postgres_2.postgresDescribe)(sql, 'SELECT * FROM mytable1 WHERE id = $1');
        const expected = {
            parameters: [23],
            columns: [
                {
                    name: 'id',
                    typeId: 23,
                    tableId: 16396
                },
                {
                    name: 'value',
                    typeId: 23,
                    tableId: 16396
                }
            ]
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
});
//# sourceMappingURL=query-executor.test.js.map