"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSqliteClient = createSqliteClient;
exports.loadDbSchema = loadDbSchema;
exports.getTableInfo = getTableInfo;
exports.getIndexInfo = getIndexInfo;
exports.getTables = getTables;
exports.selectSqliteTablesFromSchema = selectSqliteTablesFromSchema;
exports.explainSql = explainSql;
exports.loadForeignKeys = loadForeignKeys;
exports.loadCreateTableStmt = loadCreateTableStmt;
exports.loadCreateTableStmtWithCheckConstraint = loadCreateTableStmtWithCheckConstraint;
const Either_1 = require("fp-ts/lib/Either");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const enum_parser_1 = require("./enum-parser");
const virtual_tables_1 = require("./virtual-tables");
const neverthrow_1 = require("neverthrow");
function createSqliteClient(client, databaseUri, attachList, loadExtensions) {
    const db = new better_sqlite3_1.default(databaseUri);
    for (const attach of attachList) {
        db.exec(`attach database ${attach}`);
    }
    for (const extension of loadExtensions) {
        db.loadExtension(extension);
    }
    return (0, neverthrow_1.ok)({
        type: client,
        client: db
    });
}
function loadDbSchema(db) {
    const database_list = db
        //@ts-ignore
        .prepare('select name from pragma_database_list')
        .all()
        .map((col) => col.name);
    const result = [];
    for (const schema of database_list) {
        const schemaResult = loadDbSchemaForSchema(db, schema);
        if (schemaResult.isErr()) {
            return schemaResult;
        }
        result.push(...schemaResult.value);
    }
    return (0, neverthrow_1.ok)(result.concat(virtual_tables_1.virtualTablesSchema));
}
function getTableInfo(db, schema, table) {
    const tableInfo = db
        //@ts-ignore
        .prepare(`PRAGMA ${schema}.table_xinfo('${table}')`)
        .all();
    return tableInfo;
}
function getIndexInfo(db, schema, table) {
    const map = new Map();
    const indexList = db
        //@ts-ignore
        .prepare(`PRAGMA ${schema}.index_list('${table}')`)
        .all();
    for (const index of indexList) {
        if (index.unique === 1) {
            const indexedColumns = db
                //@ts-ignore
                .prepare(`PRAGMA ${schema}.index_info('${index.name}')`)
                .all()
                .map((res) => res.name);
            for (const column of indexedColumns) {
                map.set(column, true);
            }
        }
    }
    return map;
}
function getTables(db, schema) {
    const tables = db
        //@ts-ignore
        .prepare(`SELECT name, rootpage FROM ${schema}.sqlite_schema`)
        .all()
        .map((res) => ({ name: res.name, type: getTableType(res.rootpage) }));
    return tables;
}
function getTableType(rootpage) {
    return rootpage != null && rootpage !== 0 ? 'T' : 'VT';
}
function checkAffinity(type) {
    if (type.includes('INT')) {
        return 'INTEGER';
    }
    if (type.includes('CHAR') || type.includes('CLOB') || type.includes('TEXT')) {
        return 'TEXT';
    }
    if (type === '' || type.includes('BLOB')) {
        return 'BLOB';
    }
    if (type.includes('REAL') || type.includes('FLOA') || type.includes('DOUB')) {
        return 'REAL';
    }
    return 'NUMERIC';
}
function loadDbSchemaForSchema(db, schema = '') {
    const tables = getTables(db, schema);
    const createTableStmtsResult = loadCreateTableStmtWithCheckConstraint(db);
    if (createTableStmtsResult.isErr()) {
        return (0, neverthrow_1.err)(createTableStmtsResult.error);
    }
    const createTableStmts = createTableStmtsResult.value;
    const enumMap = createTableStmts ? (0, enum_parser_1.enumParser)(createTableStmtsResult.value) : {};
    const result = tables.flatMap(({ name, type }) => {
        const tableInfoList = getTableInfo(db, schema, name);
        const tableIndexInfo = getIndexInfo(db, schema, name);
        const columnSchema = tableInfoList.map((tableInfo) => {
            const isUni = tableIndexInfo.get(tableInfo.name) != null;
            const isVT = type == 'VT';
            const enumColumnMap = enumMap[name] || {};
            const col = {
                column: tableInfo.name,
                column_type: checkType(tableInfo.name, tableInfo.type, isVT, enumColumnMap),
                columnKey: getColumnKey(tableInfo.pk, isUni, isVT),
                notNull: tableInfo.notnull === 1 || tableInfo.pk >= 1 || (isVT && tableInfo.name === 'rank'),
                schema,
                table: name,
                hidden: tableInfo.hidden
            };
            if (tableInfo.dflt_value != null) {
                col.defaultValue = tableInfo.dflt_value;
            }
            return col;
        });
        return columnSchema;
    });
    return (0, neverthrow_1.ok)(result);
}
function checkType(columnName, columnType, isVT, enumColumnMap) {
    if (isVT) {
        return columnName === 'rank' ? 'REAL' : '?';
    }
    if (columnType === 'TEXT' && enumColumnMap[columnName] != null) {
        return enumColumnMap[columnName];
    }
    return checkAffinity(columnType);
}
function getColumnKey(pk, isUni, isVT) {
    if (pk >= 1) {
        return 'PRI';
    }
    if (isUni) {
        return 'UNI';
    }
    if (isVT) {
        return 'VT';
    }
    return '';
}
function selectSqliteTablesFromSchema(db) {
    const sql = `
    SELECT 
		'' as schema,
		name as 'table'
	FROM sqlite_schema 
	WHERE type='table' 
	ORDER BY name
    `;
    try {
        //@ts-ignore
        const result = db.prepare(sql).all();
        return (0, Either_1.right)(result);
    }
    catch (e) {
        const err = e;
        return (0, Either_1.left)({
            name: err.name,
            description: err.message
        });
    }
}
function explainSql(db, sql) {
    try {
        //@ts-ignore
        db.prepare(sql);
        return (0, Either_1.right)(true);
    }
    catch (err_) {
        const err = err_;
        return (0, Either_1.left)({
            name: err.name,
            description: err.message
        });
    }
}
function loadForeignKeys(db) {
    const sql = `
    SELECT 
		tab.name as fromTable, 
		fk.'table' as toTable, 
		fk.'from' as fromColumn, 
		fk.'to' as toColumn 
	FROM sqlite_schema tab
	INNER JOIN pragma_foreign_key_list(tab.name) fk
	WHERE type = 'table'`;
    try {
        //@ts-ignore
        const result = db.prepare(sql).all();
        return (0, neverthrow_1.ok)(result);
    }
    catch (e) {
        const error = e;
        return (0, neverthrow_1.err)({
            name: error.name,
            description: error.message
        });
    }
}
function loadCreateTableStmt(db, tableName) {
    const sql = `
    SELECT 
		sql
	FROM sqlite_schema tab
	WHERE type = 'table' and tbl_name = ?`;
    try {
        //@ts-ignore
        const result = db.prepare(sql).all([tableName]);
        return (0, Either_1.right)(result[0].sql);
    }
    catch (e) {
        const err = e;
        return (0, Either_1.left)({
            name: err.name,
            description: err.message
        });
    }
}
function loadCreateTableStmtWithCheckConstraint(db) {
    const sql = `
    SELECT 
		GROUP_CONCAT(sql, ';') as sql
	FROM sqlite_schema tab
	WHERE type = 'table' and upper(sql) GLOB '*CHECK[ (]*)*'`;
    try {
        //@ts-ignore
        const result = db.prepare(sql).all();
        return (0, neverthrow_1.ok)(result[0].sql);
    }
    catch (e) {
        const error = e;
        return (0, neverthrow_1.err)({
            name: error.name,
            description: error.message
        });
    }
}
//# sourceMappingURL=query-executor.js.map