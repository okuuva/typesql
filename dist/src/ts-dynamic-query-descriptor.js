"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToDynamicSelectColumns = mapToDynamicSelectColumns;
exports.mapToDynamicParams = mapToDynamicParams;
function mapToDynamicSelectColumns(columns) {
    return columns.map((column) => mapToSelectColumn(column));
}
function mapToSelectColumn(r) {
    return {
        name: r.name,
        tsType: 'boolean',
        notNull: false
    };
}
function mapToDynamicParams(columns) {
    return columns.map((column) => mapToDynamicParam(column));
}
function mapToDynamicParam(r) {
    return {
        name: r.name,
        tsType: `${r.tsType} | null`,
        notNull: false
    };
}
//# sourceMappingURL=ts-dynamic-query-descriptor.js.map