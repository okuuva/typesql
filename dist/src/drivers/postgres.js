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
exports.postgresDescribe = void 0;
exports.loadDbSchema = loadDbSchema;
exports.loadEnumsMap = loadEnumsMap;
exports.loadEnums = loadEnums;
exports.loadCheckConstraints = loadCheckConstraints;
exports.createPostgresClient = createPostgresClient;
exports.loadForeignKeys = loadForeignKeys;
exports.loadUserFunctions = loadUserFunctions;
const postgres_1 = __importDefault(require("postgres"));
const neverthrow_1 = require("neverthrow");
const util_1 = require("../util");
const enum_parser_1 = require("../postgres-query-analyzer/enum-parser");
function loadDbSchema(sql, schemas = null) {
    return neverthrow_1.ResultAsync.fromThrowable(() => __awaiter(this, void 0, void 0, function* () {
        const result = yield sql `
			SELECT
				t.table_schema,
				t.table_name,
				col.column_name,
				CASE WHEN ty.typtype = 'e' THEN 'enum()' ELSE ty.typname END AS type,
				col.is_nullable,
				COALESCE(agg.column_key, '') AS column_key,
				COALESCE(
				(col.column_default LIKE 'nextval%' OR col.is_identity = 'YES'), false) AS autoincrement,
				col.column_default
				FROM information_schema.tables t
				JOIN pg_class c ON c.relname = t.table_name AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.table_schema)
				JOIN information_schema.columns col ON col.table_name = t.table_name AND col.table_schema = t.table_schema
				JOIN pg_type ty ON ty.typname = col.udt_name
				LEFT JOIN (
				SELECT
					con.conrelid AS conrelid,
					att.attname AS column_name,
					MAX(
					CASE
						WHEN con.contype = 'p' THEN 'PRI'
						WHEN con.contype = 'u' THEN 'UNI'
						ELSE ''
					END
					) AS column_key
				FROM pg_constraint con
				JOIN unnest(con.conkey) AS colnum ON true
				JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = colnum
				WHERE con.contype IN ('p','u')
				GROUP BY con.conrelid, att.attname
				) AS agg
				ON agg.conrelid = c.oid AND agg.column_name = col.column_name
			WHERE 1 = 1
				-- t.table_type = 'BASE TABLE'  -- Only regular tables, excluding views
				AND (
						(${schemas}::text[] IS NULL AND t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast') AND t.table_schema NOT LIKE 'pg_temp%')
						OR
						(${schemas}::text[] IS NOT NULL AND t.table_schema = ANY(${schemas}))
					)
			ORDER BY 
				t.table_schema, t.table_name, col.ordinal_position`;
        return result.map((row) => {
            const result = Object.assign({ schema: row.table_schema, table: row.table_name, column_name: row.column_name, type: row.type, is_nullable: row.is_nullable === 'YES', column_key: row.column_key, autoincrement: row.autoincrement }, (row.column_default && { column_default: true }));
            return result;
        });
    }), err => convertPostgresErrorToTypeSQLError(err))();
}
function loadEnumsMap(sql) {
    return loadEnums(sql).map(enumResult => {
        const enumMap = (0, util_1.groupBy)(enumResult, (e) => e.type_oid);
        return enumMap;
    });
}
function loadEnums(sql) {
    return neverthrow_1.ResultAsync.fromThrowable(() => __awaiter(this, void 0, void 0, function* () { return _loadEnums(sql); }), err => convertPostgresErrorToTypeSQLError(err))();
}
function _loadEnums(sql) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield sql `
		SELECT 
		t.oid AS type_oid,
		t.typname AS enum_name,
		e.enumlabel
	FROM pg_type t
	JOIN pg_enum e ON t.oid = e.enumtypid
	ORDER BY e.enumsortorder`;
        return result;
    });
}
function loadCheckConstraints(sql) {
    return (neverthrow_1.ResultAsync.fromThrowable(() => _loadCheckConstraints(sql), err => convertPostgresErrorToTypeSQLError(err))()).map(enumResult => {
        const checkConstraintResult = {};
        for (const enumColumn of enumResult) {
            const key = `[${enumColumn.schema_name}][${enumColumn.table_name}][${enumColumn.column_name}]`;
            const value = (0, enum_parser_1.transformCheckToEnum)(enumColumn.constraint_definition);
            if (value) {
                checkConstraintResult[key] = value;
            }
        }
        return checkConstraintResult;
    });
}
function _loadCheckConstraints(sql) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield sql `
		SELECT
			n.nspname AS schema_name,
			t.relname AS table_name,
			c.conname AS constraint_name,
			pg_get_constraintdef(c.oid) AS constraint_definition,
			a.attname AS column_name
		FROM
			pg_constraint c
		JOIN
			pg_class t ON c.conrelid = t.oid
		JOIN
			pg_namespace n ON t.relnamespace = n.oid
		LEFT JOIN
			unnest(c.conkey) AS ck(attnum) ON TRUE
		LEFT JOIN
			pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ck.attnum
		WHERE
			c.contype = 'c'`;
        return result;
    });
}
const postgresDescribe = (sql, sqlQuery) => {
    return neverthrow_1.ResultAsync.fromThrowable(() => __awaiter(void 0, void 0, void 0, function* () {
        const describeResult = yield sql.unsafe(sqlQuery).describe();
        const columns = describeResult.columns.map((col) => ({
            name: col.name,
            tableId: col.table,
            typeId: col.type
        }));
        const parameters = describeResult.types;
        const result = {
            columns,
            parameters
        };
        return result;
    }), err => convertPostgresErrorToTypeSQLError(err))();
};
exports.postgresDescribe = postgresDescribe;
function convertPostgresErrorToTypeSQLError(err) {
    const error = err;
    const typesqlError = {
        name: error.name,
        description: error.message
    };
    return typesqlError;
}
function createPostgresClient(databaseUri) {
    const db = (0, postgres_1.default)(databaseUri);
    return (0, neverthrow_1.ok)({
        type: 'pg',
        client: db
    });
}
function loadForeignKeys(sql) {
    return neverthrow_1.ResultAsync.fromThrowable(() => __awaiter(this, void 0, void 0, function* () {
        const result = yield sql `
			SELECT 
				cl1.relname AS "fromTable",
				cl2.relname AS "toTable",
				att1.attname AS "fromColumn",
				att2.attname AS "toColumn"
			FROM 
				pg_constraint AS c
			JOIN 
				pg_attribute AS att1 ON att1.attnum = ANY(c.conkey) AND att1.attrelid = c.conrelid
			JOIN 
				pg_attribute AS att2 ON att2.attnum = ANY(c.confkey) AND att2.attrelid = c.confrelid
			JOIN 
				pg_class AS cl1 ON cl1.oid = att1.attrelid
			JOIN 
				pg_class AS cl2 ON cl2.oid = att2.attrelid
			JOIN 
				pg_namespace AS ns1 ON ns1.oid = cl1.relnamespace
			JOIN 
				pg_namespace AS ns2 ON ns2.oid = cl2.relnamespace
			WHERE 
				c.contype = 'f'`;
        return result;
    }), err => convertPostgresErrorToTypeSQLError(err))();
}
function loadUserFunctions(sql, schemas = null) {
    return neverthrow_1.ResultAsync.fromThrowable(() => _loadUserFunctions(sql, schemas), err => convertPostgresErrorToTypeSQLError(err))();
}
function _loadUserFunctions(sql, schemas) {
    return sql `SELECT 
			n.nspname AS schema,
			p.proname AS function_name,
			pg_get_function_identity_arguments(p.oid) AS arguments,
			pg_get_function_result(p.oid) AS return_type,
			-- pg_get_functiondef(p.oid) AS definition
			p.prosrc AS definition,
			l.lanname as language
		FROM pg_proc p
		JOIN pg_namespace n ON n.oid = p.pronamespace
		JOIN pg_language l ON l.oid = p.prolang
		WHERE (
			(${schemas}::text[] IS NULL AND n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')) -- exclude system functions
			OR
			(${schemas}::text[] IS NOT NULL AND n.nspname = ANY(${schemas}::text[]))
		)
		AND p.prokind = 'f'  -- 'f' = function, 'p' = procedure, 'a' = aggregate
		-- and l.lanname = 'sql'
		ORDER BY n.nspname, p.proname`;
}
//# sourceMappingURL=postgres.js.map