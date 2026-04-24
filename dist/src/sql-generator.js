"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSelectStatement = generateSelectStatement;
exports.generateInsertStatement = generateInsertStatement;
exports.generateUpdateStatement = generateUpdateStatement;
exports.generateDeleteStatement = generateDeleteStatement;
const code_block_writer_1 = __importDefault(require("code-block-writer"));
function generateSelectStatement(dialect, tableName, columns) {
    const keys = columns.filter((col) => col.columnKey === 'PRI');
    if (keys.length === 0) {
        keys.push(...columns.filter((col) => col.columnKey === 'UNI'));
    }
    const writer = new code_block_writer_1.default();
    writer.writeLine('SELECT');
    columns.forEach((col, columnIndex) => {
        writer.indent().write(escapeColumn(dialect, col.column));
        writer.conditionalWrite(columnIndex < columns.length - 1, ',');
        writer.newLine();
    });
    writer.writeLine(`FROM ${escapeTableName(dialect, tableName)}`);
    if (keys.length > 0) {
        writer.write('WHERE ');
        writer.write(`${escapeColumn(dialect, keys[0].column)} = :${keys[0].column}`);
    }
    return writer.toString();
}
function generateInsertStatement(dialect, tableName, dbSchema) {
    const columns = dbSchema.filter((col) => !col.autoincrement);
    const writer = new code_block_writer_1.default();
    writer.writeLine(`INSERT INTO ${escapeTableName(dialect, tableName)}`);
    writer.writeLine('(');
    columns.forEach((col, columnIndex) => {
        writer.indent().write(escapeColumn(dialect, col.column));
        writer.conditionalWrite(columnIndex !== columns.length - 1, ',');
        writer.newLine();
    });
    writer.writeLine(')');
    writer.writeLine('VALUES');
    writer.writeLine('(');
    columns.forEach((col, columnIndex) => {
        writer.indent().write(`:${col.column}`);
        writer.conditionalWrite(columnIndex < columns.length - 1, ',');
        writer.newLine();
    });
    writer.write(')');
    return writer.toString();
}
function generateUpdateStatement(dialect, tableName, dbSchema) {
    const columns = dbSchema.filter((col) => !col.autoincrement);
    const keys = dbSchema.filter((col) => col.columnKey === 'PRI');
    if (keys.length === 0) {
        keys.push(...dbSchema.filter((col) => col.columnKey === 'UNI'));
    }
    const writer = new code_block_writer_1.default();
    writer.writeLine(`UPDATE ${escapeTableName(dialect, tableName)}`);
    writer.writeLine('SET');
    columns.forEach((col, columnIndex) => {
        writer
            .indent()
            .write(`${escapeColumn(dialect, col.column)} = CASE WHEN :${col.column}Set THEN :${col.column} ELSE ${escapeColumn(dialect, col.column)} END`);
        writer.conditionalWrite(columnIndex !== columns.length - 1, ',');
        writer.newLine();
    });
    if (keys.length > 0) {
        writer.writeLine('WHERE');
        writer.indent().write(`${escapeColumn(dialect, keys[0].column)} = :${keys[0].column}`);
    }
    return writer.toString();
}
function generateDeleteStatement(dialect, tableName, dbSchema) {
    const keys = dbSchema.filter((col) => col.columnKey === 'PRI');
    if (keys.length === 0) {
        keys.push(...dbSchema.filter((col) => col.columnKey === 'UNI'));
    }
    const writer = new code_block_writer_1.default();
    writer.writeLine(`DELETE FROM ${escapeTableName(dialect, tableName)}`);
    if (keys.length > 0) {
        writer.write('WHERE ');
        writer.write(`${escapeColumn(dialect, keys[0].column)} = :${keys[0].column}`);
    }
    return writer.toString();
}
//Permitted characters in unquoted identifiers: ASCII: [0-9,a-z,A-Z$_]
function escapeTableName(dialect, tableName) {
    const validPattern = /^[a-zA-Z0-9_$]+$/g;
    if (dialect === 'mysql2' && !validPattern.test(tableName)) {
        return `\`${tableName}\``;
    }
    return tableName;
}
function escapeColumn(dialect, column) {
    if (dialect === 'mysql2') {
        return `\`${column}\``;
    }
    return `${column}`;
}
//# sourceMappingURL=sql-generator.js.map