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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
exports.loadSchemaInfo = loadSchemaInfo;
exports.loadTableSchema = loadTableSchema;
exports.closeClient = closeClient;
exports.selectTables = selectTables;
const libsql_1 = require("./drivers/libsql");
const postgres_1 = require("./drivers/postgres");
const queryExectutor_1 = require("./queryExectutor");
const query_executor_1 = require("./sqlite-query-analyzer/query-executor");
const postgres_2 = require("./drivers/postgres");
const neverthrow_1 = require("neverthrow");
const Either_1 = require("fp-ts/lib/Either");
function createClient(databaseUri, dialect, attach, loadExtensions, authToken) {
    switch (dialect) {
        case 'mysql2':
            return (0, queryExectutor_1.createMysqlClient)(databaseUri);
        case 'better-sqlite3':
        case 'bun:sqlite':
        case 'd1':
            return (0, query_executor_1.createSqliteClient)(dialect, databaseUri, attach || [], loadExtensions || []).asyncAndThen(res => (0, neverthrow_1.okAsync)(res));
        case 'libsql':
            return (0, libsql_1.createLibSqlClient)(databaseUri, attach || [], loadExtensions || [], authToken || '').asyncAndThen(res => (0, neverthrow_1.okAsync)(res));
        case 'pg':
            return (0, postgres_1.createPostgresClient)(databaseUri).asyncAndThen(res => (0, neverthrow_1.okAsync)(res));
            ;
    }
}
function loadSchemaInfo(databaseClient, schemas) {
    switch (databaseClient.type) {
        case 'mysql2':
            return (0, queryExectutor_1.loadMysqlSchema)(databaseClient.client, databaseClient.schema).map(schema => ({
                kind: databaseClient.type,
                columns: schema
            }));
        case 'better-sqlite3':
        case 'libsql':
        case 'bun:sqlite':
        case 'd1':
            return (0, query_executor_1.loadDbSchema)(databaseClient.client).asyncAndThen(columns => (0, neverthrow_1.okAsync)({ kind: databaseClient.type, columns }));
        case 'pg':
            return _loadPostgresSchemaInfo(databaseClient.client, schemas !== null && schemas !== void 0 ? schemas : null);
    }
}
function loadTableSchema(databaseClient, tableName) {
    switch (databaseClient.type) {
        case 'mysql2':
            return (0, queryExectutor_1.loadMySqlTableSchema)(databaseClient.client, databaseClient.schema, tableName);
        case 'better-sqlite3':
        case 'libsql':
        case 'bun:sqlite':
        case 'd1':
            return (0, query_executor_1.loadDbSchema)(databaseClient.client).asyncAndThen(res => (0, neverthrow_1.okAsync)(res));
        case 'pg':
            return (0, neverthrow_1.okAsync)([]);
    }
}
function _loadPostgresSchemaInfo(client, schemas) {
    const schemaResult = (0, postgres_2.loadDbSchema)(client, schemas);
    const foreignKeysResult = (0, postgres_2.loadForeignKeys)(client);
    const enumTypesResult = (0, postgres_2.loadEnumsMap)(client);
    const userFunctionsResult = (0, postgres_2.loadUserFunctions)(client, schemas);
    const checkConstraintsResult = (0, postgres_2.loadCheckConstraints)(client);
    const schemaInfo = neverthrow_1.ResultAsync.combine([schemaResult, foreignKeysResult, enumTypesResult, userFunctionsResult, checkConstraintsResult])
        .map(([schema, foreignKeys, enumTypes, userFunctions, checkConstraints]) => {
        const result = {
            kind: 'pg',
            columns: schema,
            foreignKeys,
            userFunctions,
            enumTypes,
            checkConstraints
        };
        return result;
    });
    return schemaInfo;
}
function closeClient(db) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (db.type) {
            case 'mysql2':
                yield db.client.end();
                return;
            case 'better-sqlite3':
                db.client.close();
                return;
            case 'libsql':
                db.client.close();
                return;
            case 'bun:sqlite':
                db.client.close();
                return;
            case 'd1':
                db.client.close();
                return;
            case 'pg':
                yield db.client.end();
                return;
        }
    });
}
function selectTables(databaseClient) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (databaseClient.type) {
            case 'mysql2':
                return yield (0, queryExectutor_1.selectTablesFromSchema)(databaseClient.client);
            case 'better-sqlite3':
            case 'libsql':
            case 'bun:sqlite':
            case 'd1':
                return (0, query_executor_1.selectSqliteTablesFromSchema)(databaseClient.client);
            case 'pg':
                return (0, Either_1.right)([]);
        }
    });
}
//# sourceMappingURL=schema-info.js.map