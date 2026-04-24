"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicQuery03 = dynamicQuery03;
const os_1 = require("os");
const selectFragments = {
    id: `t1.id`,
    value: `t1.value`,
};
const NumericOperatorList = ['=', '<>', '>', '<', '>=', '<='];
function dynamicQuery03(db, params) {
    const { sql, paramsValues } = buildSql(params);
    return db.prepare(sql)
        .raw(true)
        .all(paramsValues)
        .map(data => mapArrayToDynamicQuery03Result(data, params === null || params === void 0 ? void 0 : params.select));
}
function buildSql(queryParams) {
    const { select, where } = queryParams || {};
    const selectedSqlFragments = [];
    const paramsValues = [];
    const whereColumns = new Set((where === null || where === void 0 ? void 0 : where.map(w => w.column)) || []);
    if (!select || select.id === true) {
        selectedSqlFragments.push(`t1.id`);
    }
    if (!select || select.value === true) {
        selectedSqlFragments.push(`t1.value`);
    }
    const fromSqlFragments = [];
    fromSqlFragments.push(`FROM mytable1 t1`);
    const whereSqlFragments = [];
    const placeholder = () => '?';
    where === null || where === void 0 ? void 0 : where.forEach(condition => {
        const whereClause = whereCondition(condition, placeholder);
        if (whereClause === null || whereClause === void 0 ? void 0 : whereClause.hasValue) {
            whereSqlFragments.push(whereClause.sql);
            paramsValues.push(...whereClause.values);
        }
    });
    const whereSql = whereSqlFragments.length > 0 ? `WHERE ${whereSqlFragments.join(' AND ')}` : '';
    const sql = `SELECT
	${selectedSqlFragments.join(`,${os_1.EOL}`)}
	${fromSqlFragments.join(os_1.EOL)}
	${whereSql}`;
    return { sql, paramsValues };
}
function mapArrayToDynamicQuery03Result(data, select) {
    const result = {};
    let rowIndex = -1;
    if (!select || select.id === true) {
        rowIndex++;
        result.id = data[rowIndex];
    }
    if (!select || select.value === true) {
        rowIndex++;
        result.value = data[rowIndex];
    }
    return result;
}
function whereCondition(condition, placeholder) {
    const selectFragment = selectFragments[condition.column];
    const { op, value } = condition;
    if (op === 'BETWEEN') {
        const [from, to] = Array.isArray(value) ? value : [null, null];
        return {
            sql: `${selectFragment} BETWEEN ${placeholder()} AND ${placeholder()}`,
            hasValue: from != null && to != null,
            values: [from, to]
        };
    }
    if (op === 'IN' || op === 'NOT IN') {
        if (!Array.isArray(value) || value.length === 0) {
            return { sql: '', hasValue: false, values: [] };
        }
        return {
            sql: `${selectFragment} ${op} (${value.map(() => placeholder()).join(', ')})`,
            hasValue: true,
            values: value
        };
    }
    if (NumericOperatorList.includes(op)) {
        return {
            sql: `${selectFragment} ${op} ${placeholder()}`,
            hasValue: value != null,
            values: [value]
        };
    }
    return null;
}
//# sourceMappingURL=dynamic-query03.js.map