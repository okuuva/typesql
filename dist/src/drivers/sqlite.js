"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapper = void 0;
function mapColumnType(sqliteType, client) {
    switch (sqliteType) {
        case 'INTEGER':
            return 'number';
        case 'INTEGER[]':
            return 'number[]';
        case 'TEXT':
            return 'string';
        case 'TEXT[]':
            return 'string[]';
        case 'NUMERIC':
            return 'number';
        case 'NUMERIC[]':
            return 'number[]';
        case 'REAL':
            return 'number';
        case 'REAL[]':
            return 'number[]';
        case 'DATE':
            return 'Date';
        case 'DATE_TIME':
            return 'Date';
        case 'BLOB':
            return client === 'better-sqlite3' ? 'Uint8Array' : 'ArrayBuffer';
        case 'BOOLEAN':
            return 'boolean';
    }
    if (sqliteType.startsWith('ENUM')) {
        const enumValues = sqliteType.substring(sqliteType.indexOf('(') + 1, sqliteType.indexOf(')'));
        return `(${enumValues.split(',').join(' | ')})`;
    }
    return 'any';
}
exports.mapper = {
    mapColumnType
};
//# sourceMappingURL=sqlite.js.map