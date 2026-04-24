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
describe('postgres-infer-nullability-case-when', () => {
    const client = (0, schema_1.createTestClient)();
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end(); // Close the connection
    }));
    it('CASE WHEN value IS NULL THEN 1 ELSE value END AS computed_value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN value IS NULL THEN 1
					ELSE value
				END AS computed_value
			FROM mytable1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'int4',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('CASE WHEN value IS NULL THEN 1 ELSE mytable1.value END AS computed_value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN value IS NULL THEN 1
					ELSE mytable1.value
				END AS computed_value
			FROM mytable1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'int4',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('CASE WHEN m1.value IS NULL THEN 1 ELSE m1.value END AS computed_value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m1.value IS NULL THEN 1
					ELSE m1.value
				END AS computed_value
			FROM mytable1 m1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'int4',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('CASE WHEN m1.value IS NULL AND id > 10 THEN 1 ELSE m1.value END AS computed_value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m1.value IS NULL AND id > 10 THEN 1
					ELSE m1.value
				END AS computed_value
			FROM mytable1 m1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'int4',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('CASE WHEN m1.value IS NULL OR id > 10 THEN 1 ELSE m1.value END AS computed_value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m1.value IS NULL OR id > 10 THEN 1
					ELSE m1.value
				END AS computed_value
			FROM mytable1 m1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'int4',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('CASE WHEN m1.id IS NULL THEN 1 ELSE m1.value END AS computed_value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m1.id IS NULL THEN 1
					ELSE m1.value
				END AS computed_value
			FROM mytable1 m1
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'int4',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`CASE WHEN m5.name IS NULL THEN 'a' ELSE m2.name	END AS computed_value`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m5.name IS NULL THEN 'a'
					ELSE m2.name
				END AS computed_value
			FROM mytable2 m2
			INNER JOIN mytable5 m5 ON m2.id = m5.id
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'text',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`CASE WHEN m2.name IS NULL THEN 'a' ELSE m2.name	END AS computed_value`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m2.name IS NULL THEN 'a'
					ELSE m2.name
				END AS computed_value
			FROM mytable2 m2
			INNER JOIN mytable5 m5 ON m2.id = m5.id
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'text',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`CASE WHEN m2.name IS NULL AND m5.name IS NULL THEN 'a' ELSE m2.name END AS computed_value`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m2.name IS NULL AND m5.name IS NULL THEN 'a'
					ELSE m2.name
				END AS computed_value
			FROM mytable2 m2
			INNER JOIN mytable5 m5 ON m2.id = m5.id
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'text',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('CASE WHEN m2.name IS NULL THEN m5.name ELSE m2.name	END AS computed_value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m2.name IS NULL THEN m5.name
					ELSE m2.name
				END AS computed_value
			FROM mytable2 m2
			JOIN mytable5 m5 ON m2.id = m5.id
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'text',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`CASE WHEN m2.name IS NULL AND m5.name IS NULL THEN 'unknown' WHEN m2.name IS NULL THEN m5.name ELSE m2.name	END AS computed_value`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m2.name IS NULL AND m5.name IS NULL THEN 'unknown'
					WHEN m2.name IS NULL THEN m5.name
					ELSE m2.name
				END AS computed_value
			FROM mytable2 m2
			JOIN mytable5 m5 ON m2.id = m5.id
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'text',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`CASE WHEN m2.name IS NULL THEN 'a' ELSE CASE WHEN m2.id = 1 THEN 'a' ELSE m2.name END END AS computed_value`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m2.name IS NULL THEN 'a'
					ELSE CASE WHEN m2.id = 1 THEN 'a' ELSE m2.name END
				END AS computed_value
			FROM mytable2 m2
			JOIN mytable5 m5 ON m2.id = m5.id
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'text',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it(`CASE WHEN m2.id = 1 THEN 'a' ELSE CASE ... END END AS computed_value`, () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m2.id = 1 THEN 'a'
					ELSE CASE WHEN m2.name is not null THEN 'a' ELSE m2.name END
				END AS computed_value
			FROM mytable2 m2
			JOIN mytable5 m5 ON m2.id = m5.id
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'text',
                    notNull: false,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('LEFT JOIN - CASE WHEN m2.id IS NULL THEN 1 ELSE m2.id END AS computed_value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m2.id IS NULL THEN 1
					ELSE m2.id
				END AS computed_value
			FROM mytable1 m1
			LEFT JOIN mytable2 m2 ON m1.id = m2.id
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'int4',
                    notNull: true,
                    table: ''
                }
            ],
            parameters: []
        };
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('LEFT JOIN - CASE WHEN m2.id = 1 THEN 1	ELSE m2.id END AS computed_value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `
			SELECT
				CASE
					WHEN m2.id = 1 THEN 1
					ELSE m2.id
				END AS computed_value
			FROM mytable1 m1
			LEFT JOIN mytable2 m2 ON m1.id = m2.id
			`;
        const actual = yield (0, describe_1.describeQuery)(client, sql, schemaInfo);
        const expected = {
            sql,
            queryType: 'Select',
            multipleRowsResult: true,
            columns: [
                {
                    name: 'computed_value',
                    type: 'int4',
                    notNull: false,
                    table: ''
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
//# sourceMappingURL=infer-nullability-case-when.test.js.map