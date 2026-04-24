"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderByColumns = getOrderByColumns;
exports.replaceOrderByParamWithPlaceholder = replaceOrderByParamWithPlaceholder;
exports.replaceOrderByPlaceholderWithBuildOrderBy = replaceOrderByPlaceholderWithBuildOrderBy;
function getOrderByColumns(fromColumns, selectColumns) {
    const seen = new Set();
    const result = [];
    // Add fromColumns
    for (const col of fromColumns) {
        const name = isAmbiguous(fromColumns, col.column_name)
            ? `${col.table}.${col.column_name}`
            : col.column_name;
        const lowerName = name.toLowerCase();
        if (!seen.has(lowerName)) {
            result.push(lowerName);
            seen.add(lowerName);
        }
    }
    // Add selectColumns (may include expressions like 'nullif')
    for (const col of selectColumns) {
        const name = isAmbiguous(fromColumns, col.column_name)
            ? `${col.table}.${col.column_name}`
            : col.column_name;
        const lowerName = name.toLowerCase();
        if (!seen.has(lowerName)) {
            result.push(lowerName);
            seen.add(lowerName);
        }
    }
    return result;
}
function isAmbiguous(columns, columnName) {
    const filterByName = columns.filter((col) => col.column_name.toLowerCase() === columnName.toLowerCase());
    return filterByName.length > 1;
}
function replaceOrderByParamWithPlaceholder(sql) {
    // Match ORDER BY followed by $<number> or :<paramName>
    const pattern = /(order\s+by\s+)(\$[0-9]+|:[a-zA-Z_][a-zA-Z0-9_]*)/i;
    const match = sql.match(pattern);
    if (!match) {
        return { sql, replaced: false };
    }
    const [fullMatch, orderByKeyword] = match;
    const placeholder = `${orderByKeyword}/*__orderByPlaceholder__*/ 1`;
    const newSql = sql.replace(fullMatch, placeholder);
    return {
        sql: newSql,
        replaced: true,
    };
}
function replaceOrderByPlaceholderWithBuildOrderBy(sql) {
    const pattern = /(order\s+by\s+)\/\*__orderByPlaceholder__\*\/\s+1/i;
    return sql.replace(pattern, (_, originalOrderBy) => {
        return `${originalOrderBy}\${buildOrderBy(params.orderBy)}`;
    });
}
//# sourceMappingURL=util.js.map