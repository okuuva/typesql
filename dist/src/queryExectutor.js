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
exports.createMysqlClientForTest = createMysqlClientForTest;
exports.createMysqlClient = createMysqlClient;
exports.loadMysqlSchema = loadMysqlSchema;
exports.loadMySqlTableSchema = loadMySqlTableSchema;
exports.selectTablesFromSchema = selectTablesFromSchema;
exports.explainSql = explainSql;
const promise_1 = require("mysql2/promise");
const Either_1 = require("fp-ts/lib/Either");
const neverthrow_1 = require("neverthrow");
const connectionNotOpenError = {
    name: 'Connection error',
    description: 'The database connection is not open.'
};
function createMysqlClientForTest(databaseUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield createMysqlClient(databaseUri);
        if (client.isErr()) {
            throw Error('Error createMysqlClientForTest');
        }
        return client.value;
    });
}
function createMysqlClient(databaseUri) {
    return neverthrow_1.ResultAsync.fromThrowable(() => __awaiter(this, void 0, void 0, function* () {
        const pool = yield (0, promise_1.createPool)(databaseUri);
        //@ts-ignore
        const schema = pool.pool.config.connectionConfig.database;
        const databaseVersion = yield getDatabaseVersion(pool);
        const result = {
            type: 'mysql2',
            client: pool,
            databaseVersion,
            schema,
            isVersion8: isVersion8(databaseVersion)
        };
        return result;
    }), (err) => {
        const error = err;
        const connError = {
            name: 'Connection error',
            description: error.message
        };
        return connError;
    })();
}
function getDatabaseVersion(conn) {
    return __awaiter(this, void 0, void 0, function* () {
        const [rows] = yield conn.execute('select @@version as version');
        const mySqlVersion = rows[0].version;
        return mySqlVersion;
    });
}
function loadMysqlSchema(conn, schema) {
    const sql = `
        SELECT 
            TABLE_SCHEMA as "schema", TABLE_NAME as "table", 
            COLUMN_NAME as "column", 
            IF(data_type = 'enum', COLUMN_TYPE, DATA_TYPE) as "column_type", 
            if(IS_NULLABLE='NO', true, false) as "notNull",
            COLUMN_KEY as "columnKey",
            IF(EXTRA = 'auto_increment', true, false) as "autoincrement"
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME, ORDINAL_POSITION
        `;
    return neverthrow_1.ResultAsync.fromThrowable(() => __awaiter(this, void 0, void 0, function* () {
        const result1 = conn.execute(sql, [schema]).then((res) => {
            const columns = res[0];
            return columns.map((col) => (Object.assign(Object.assign({}, col), { notNull: !!+col.notNull }))); //convert 1 to true, 0 to false
        });
        return result1;
    }), (err) => {
        const error = err;
        const connError = {
            name: 'Connection error',
            description: error.message
        };
        return connError;
    })();
}
function loadMySqlTableSchema(conn, schema, tableName) {
    const sql = `
    SELECT 
        TABLE_SCHEMA as "schema", 
        TABLE_NAME as "table", 
        COLUMN_NAME as "column", 
        IF(data_type = 'enum', COLUMN_TYPE, DATA_TYPE) as "column_type",
        IF(IS_NULLABLE='NO', true, false) as "notNull",
        COLUMN_KEY as "columnKey",
        IF(EXTRA = 'auto_increment', true, false) as "autoincrement"
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ?
    AND TABLE_NAME = ?
    ORDER BY TABLE_NAME, ORDINAL_POSITION
    `;
    return neverthrow_1.ResultAsync.fromThrowable(() => __awaiter(this, void 0, void 0, function* () {
        return conn.execute(sql, [schema, tableName]).then((res) => {
            const columns = res[0];
            return columns;
        });
    }), (err) => {
        const error = err;
        const connError = {
            name: 'Connection error',
            description: error.message
        };
        return connError;
    })();
}
function selectTablesFromSchema(conn) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `
    SELECT 
        table_schema as "schema",
        table_name as "table"
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE' and table_schema = database() 
    order by "schema", "table"
    `;
        return conn.execute(sql).then((res) => {
            const columns = res[0];
            return (0, Either_1.right)(columns);
        });
    });
}
function explainSql(pool, sql) {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = yield pool.getConnection();
        return conn
            .prepare(sql)
            .then(() => {
            return (0, Either_1.right)(true);
        })
            .catch((err) => createInvalidSqlError(err))
            .finally(() => {
            conn.release();
        });
    });
}
function createInvalidSqlError(err) {
    const error = {
        name: 'Invalid sql',
        description: err.message
    };
    return (0, Either_1.left)(error);
}
function isVersion8(mySqlVersion) {
    return mySqlVersion.startsWith('8.');
}
//# sourceMappingURL=queryExectutor.js.map