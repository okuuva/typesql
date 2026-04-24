"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceListParams = replaceListParams;
exports.replacePostgresParams = replacePostgresParams;
function replaceListParams(sql, listParamPositions) {
    if (listParamPositions.length === 0) {
        return sql;
    }
    let newSql = '';
    let start = 0;
    listParamPositions.forEach((param, index, array) => {
        newSql += sql.substring(start, param.paramPosition);
        newSql += `\${params.${param.name}.map(() => '?')}`;
        if (index === array.length - 1) {
            //last
            newSql += sql.substring(param.paramPosition + 1, sql.length);
        }
        start = param.paramPosition + 1;
    });
    return newSql;
}
function replacePostgresParams(sql, paramsIndexes, paramsNames) {
    const paramRegex = /\$(\d+)/g;
    const newSql = sql.replace(paramRegex, (match, index) => {
        const paramIndex = parseInt(index, 10) - 1; // Adjust to zero-based index
        if (paramsIndexes[paramIndex]) {
            return `\${generatePlaceholders('${match}', params.${paramsNames[paramIndex]})}`;
        }
        else {
            return match;
        }
    });
    return newSql;
}
//# sourceMappingURL=replace-list-params.js.map