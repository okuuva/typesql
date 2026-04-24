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
const test_utils_1 = require("../test-utils");
const pg_1 = require("../../src/codegen/pg");
const schema_1 = require("./schema");
describe('postgres-code-generator', () => {
    const client = (0, schema_1.createTestClient)();
    const dialect = {
        type: 'pg',
        client
    };
    const schemaInfo = (0, schema_1.createSchemaInfo)();
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
    }));
    it('select01 - select id, name from mytable2 where id = ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id, name from mytable2 where id = $1';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'select01', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select01.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select02 - select without parameters', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id from mytable1';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'select02', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select02.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select03 - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'select id from mytable1 where id = :id or value = :id and value = :value';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'select03', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select03.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select05 - SELECT id FROM mytable1 ORDER BY ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id FROM mytable1 ORDER BY :sort';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'select05', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select05.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select06 - SELECT id FROM mytable1 ORDER BY ?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT id
FROM mytable2
WHERE id IN (:ids)
AND name IN (:names)`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'select06', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select06.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select06 - SELECT id FROM mytable2 WHERE name = $1 OR id in ($2) OR name = $3', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT id
FROM mytable2
WHERE name = $1
OR id in ($2)
OR name = $3`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'select06', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select06-2.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select06-any - WHERE id < ANY (:ids) AND name = SOME (:names) AND name <> :name`', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT id
FROM mytable2
WHERE id < ANY (:ids)
AND name = SOME (:names)
AND name <> :name`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'select06', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select06-any.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select08 - boolean', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	id,
	:param1::bool as param1,
	:param2::bool as param2
FROM mytable1
WHERE :param1 is true OR (:param2 is true OR :param2::bool is null)`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'select08', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select08.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select09 - enum', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	enum_column
FROM all_types
where enum_column = :enum_value`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'select09', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select09-enum.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select09 - enum_constraint', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	enum_constraint
FROM all_types
where enum_constraint = :enum_value`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'select09', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select09-enum-constraint.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-type-cast ', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'SELECT id::int2 FROM mytable1';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectTypeCast', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-type-cast.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select11 - left join with not null default', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	t1.id,
	r.role
FROM mytable1 t1
LEFT JOIN roles r on t1.id = r.id`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'select11', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select11.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('insert01 - INSERT INTO mytable1(value) values(10)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) values(10)';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'insert01', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/insert01.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('insert02 - select with same parameter used twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) values($1)';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'insert02', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/insert02.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('insert03 - INSERT INTO mytable1(value) VALUES(:value) RETURNING *', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO mytable1(value) VALUES(:value) RETURNING *';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'insert03', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/insert03.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('insert04-default - INSERT INTO all_types(integer_column_default) VALUES (:value)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO all_types(integer_column_default) VALUES (:value)';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'insert04', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/insert04-default.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('insert05-default-not-null - INSERT INTO roles(role) VALUES (:role)', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'INSERT INTO roles(role, fk_user) VALUES (:role, :fk_user)';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'insert05', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/insert05.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('update01 - UPDATE mytable1 SET value=? WHERE id=?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'UPDATE mytable1 SET value=$1 WHERE id=$2';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'update01', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/update01.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('update02 - update-no-data - UPDATE with no SET parameters should not include data parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'UPDATE mytable1 SET value = 42 WHERE id = :id';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'update02', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/update02.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('delete01 - DELETE FROM mytable1 WHERE id=?', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = 'DELETE FROM mytable1 WHERE id=$1';
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'delete01', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/delete01.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('crud-select01', () => {
        const actual = (0, pg_1.generateCrud)('Select', 'mytable1', schemaInfo.columns);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/crud-select01.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-select02 - select-id-serial', () => {
        const actual = (0, pg_1.generateCrud)('Select', 'roles', schemaInfo.columns);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/crud-select02.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-insert01', () => {
        const actual = (0, pg_1.generateCrud)('Insert', 'mytable1', schemaInfo.columns);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/crud-insert01.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-insert02-default-not-null', () => __awaiter(void 0, void 0, void 0, function* () {
        const actual = (0, pg_1.generateCrud)('Insert', 'roles', schemaInfo.columns);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/crud-insert02.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    }));
    it('crud-update01', () => {
        const actual = (0, pg_1.generateCrud)('Update', 'mytable1', schemaInfo.columns);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/crud-update01.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-update02', () => {
        const actual = (0, pg_1.generateCrud)('Update', 'mytable2', schemaInfo.columns);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/crud-update02.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-update03 - not null', () => {
        const actual = (0, pg_1.generateCrud)('Update', 'mytable3', schemaInfo.columns);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/crud-update03.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('crud-delete01', () => {
        const actual = (0, pg_1.generateCrud)('Delete', 'mytable1', schemaInfo.columns);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/crud-delete01.ts.txt');
        node_assert_1.default.deepStrictEqual(actual, expected);
    });
    it('nested01 - FROM users u INNER JOIN posts p', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @nested
SELECT
	u.id as user_id,
	u.name as user_name,
	p.id as post_id,
	p.title as post_title
FROM users u
INNER JOIN posts p on p.fk_user = u.id`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'nested01', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/nested01.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('nested02 - self relation', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @nested
SELECT
	c.id,
	a1.*,
	a2.*
FROM clients as c
INNER JOIN addresses as a1 ON a1.id = c.primaryAddress
LEFT JOIN addresses as a2 ON a2.id = c.secondaryAddress
WHERE c.id = :clientId`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'nested02', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/nested02-clients-with-addresses.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('nested03 - many to many', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @nested
SELECT
	s.id as surveyId,
	s.name as surveyName,
	u.id as userId,
	u.name as userName
FROM surveys s
INNER JOIN participants p on p.fk_survey = s.id
INNER JOIN users u on u.id = p.fk_user`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'nested03', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/nested03-many-to-many.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-01', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
	SELECT m1.id, m1.value, m2.name, m2.descr as description
	FROM mytable1 m1
	INNER JOIN mytable2 m2 on m1.id = m2.id`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'dynamic-query-01', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query01.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-02', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
SELECT m1.id, m2.name
FROM mytable1 m1
INNER JOIN ( -- derivated table
	SELECT id, name from mytable2 m 
	WHERE m.name = :subqueryName
) m2 on m2.id = m1.id`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'derivated-table', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query02.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-03', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
	SELECT t1.id, t1.value
	FROM mytable1 t1`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'dynamic-query-03', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query03.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-04', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
	SELECT 
		*
	FROM mytable1 m1
	INNER JOIN mytable2 m2 on m2.id = m1.id`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'dynamic-query-04', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query04.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-05', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
WITH 
	cte as (
		select id, name from mytable2
	)
SELECT 
	m1.id,
	m2.name
FROM mytable1 m1
INNER JOIN cte m2 on m2.id = m1.id`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'dynamic-query-05', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query05.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-06', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
	SELECT 
		*
	FROM mytable1 m1
	INNER JOIN mytable2 m2 on m2.id = m1.id
	ORDER BY :orderBy`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'dynamic-query-06', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query06.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-07', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
	SELECT 
		m1.id as myId,
		m2.name
	FROM mytable1 m1
	INNER JOIN mytable2 m2 on m2.id = m1.id
	ORDER BY :sort`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'dynamic-query-07', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query07.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-08 - date', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
SELECT 
	timestamp_not_null_column
FROM all_types 
WHERE EXTRACT(YEAR FROM timestamp_not_null_column) = :param1 AND EXTRACT(MONTH FROM timestamp_not_null_column) = :param2`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'dynamic-query-08', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query08-date.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-09 - params on select', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
	SELECT 
		t2.id, 
		t3.double_value, 
		:name::text is null OR concat('%', t2.name, t3.name, '%') LIKE :name as likeName
	FROM mytable2 t2
	INNER JOIN mytable3 t3 on t3.id = t2.id`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'dynamic-query-09', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query09.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-10 - limit offset', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
	SELECT 
		t1.id, 
		t2.name
	FROM mytable1 t1
	INNER JOIN mytable2 t2 on t2.id = t1.id
	WHERE name <> :name
	LIMIT :limit OFFSET :offset`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'dynamic-query-10', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query10.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-11-multiple-CTEs', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
WITH 
	cte1 as (
		select id, value from mytable1
		WHERE greatest(value, :param1) = least(value, :param1)
	),
	cte2 as (
		select id, name from mytable2
		WHERE greatest(name, :param2) = least(name, :param2)
	)
SELECT 
	c1.id,
	c2.name
FROM cte1 c1
INNER JOIN cte2 c2 on c1.id = c2.id`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'dynamic-query-11', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query11.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('dynamic-query-13-enum', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `-- @dynamicQuery
		SELECT
			enum_column
		FROM all_types`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'dynamic-query-13', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/dynamic-query13-enum.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('copy01', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `COPY mytable1 (value) FROM STDIN WITH CSV`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'copy01', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/copy01.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('copy02', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `COPY mytable4 FROM STDIN WITH CSV`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'copy02', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/copy02.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json01', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT json_agg(
	json_build_object('key', name, 'key2', id)
) AS result
FROM (
	VALUES
		(1, 'a'),
		(2, 'b')
) AS t(id, name)`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson01', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json01.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json02', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	json_build_object(
		'total', SUM(m.id),
		'count', COUNT(m.id),
		'coalesce', COALESCE(m.id, 0),
		'nested', COALESCE(json_agg(jsonb_build_object(
			'key1', 'value',
			'key2', 10
		)))
	) AS sum
FROM mytable1 m
GROUP BY id`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson02', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json02.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json03', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	json_build_array('a', 'b') as value1,
	jsonb_build_array(null, 'c', 10) as value2`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson03', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json03.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json04', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT json_build_object(
	'id', 10,
	'list', json_build_array(1, 'a')
) as result`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson04', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json04.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json05', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT json_build_object(
	'nested', json_build_object (
		'nested2', json_build_object(
			'nested3', json_build_object('key', 'value')
		)
	)
) as result`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson05', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json05.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json06', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	u.id as user_id,
	u.name as user_name,
	jsonb_agg(
		json_build_object(
			'id', p.id,
			'title', p.title
		)
	)
FROM users u
LEFT JOIN posts p on p.fk_user = u.id
group by u.id, u.name`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson06', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json06.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json07', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	u.id as user_id,
	u.name as user_name,
	jsonb_agg(
		json_build_object(
			'id', p.id,
			'title', p.title
		)
	) FILTER (WHERE p.id IS NOT NULL)
FROM users u
LEFT JOIN posts p on p.fk_user = u.id
group by u.id, u.name`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson07', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json07.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json08', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	u.id as user_id,
	u.name as user_name,
	coalesce(jsonb_agg(
		json_build_object(
			'id', p.id,
			'title', p.title
		)
	) FILTER (WHERE p.id IS NOT NULL), '[]')
FROM users u
LEFT JOIN posts p on p.fk_user = u.id
group by u.id, u.name`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson08', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json08.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json09', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT json_build_array(
		json_build_array('a', null),
		json_build_array(1, 2),
		json_build_array(id, name, descr)
	) as result
FROM mytable2`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson09', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json09.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json10', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	json_object_agg(id, value) as result1,
	json_object_agg(id, row_to_json(mytable1)) as result2
FROM mytable1`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson10', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json10.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json11', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
  json_agg(
    json_build_object(
      'id', t.id,
      'value', t.value,
      'subquery', (select json_build_object('key', 10))
    )
  )
FROM mytable1 t`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson11', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json11.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json12-serialization', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	json_build_object(
		'date_column', t.date_column,
		'timestamp_column', t.timestamp_column,
		'timestamptz_column', t.timestamptz_column,
		'bytea_column', t.bytea_column,
		'nested', json_build_object(
			'date_column', t.date_column,
			'timestamp_column', t.timestamp_column,
			'timestamptz_column', t.timestamptz_column,
			'bytea_column', t.bytea_column
		)
	),
	json_build_array(date_column)
FROM all_types t`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson12', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json12.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
    it('select-json13-serialization', () => __awaiter(void 0, void 0, void 0, function* () {
        const sql = `SELECT
	json_object_agg(int4_column, date_column)
FROM all_types t
GROUP BY int4_column`;
        const actual = yield (0, pg_1.generateCode)(dialect, sql, 'selectJson13', schemaInfo);
        const expected = (0, test_utils_1.readNormalizedEOL)('tests/postgres/expected-code/select-json13.ts.txt');
        if (actual.isErr()) {
            node_assert_1.default.fail(`Shouldn't return an error: ${actual.error.description}`);
        }
        node_assert_1.default.deepStrictEqual(actual.value, expected);
    }));
});
//# sourceMappingURL=code-generator.test.js.map