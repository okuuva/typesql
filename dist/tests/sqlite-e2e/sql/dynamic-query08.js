"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicQuery08 = dynamicQuery08;
const os_1 = require("os");
const selectFragments = {
    date1: `date1`,
    date: `date(date1)`,
    date_time: `datetime(date2)`,
};
const NumericOperatorList = ['=', '<>', '>', '<', '>=', '<='];
function dynamicQuery08(db, params) {
    const { sql, paramsValues } = buildSql(params);
    return db.prepare(sql)
        .raw(true)
        .all(paramsValues)
        .map(data => mapArrayToDynamicQuery08Result(data, params === null || params === void 0 ? void 0 : params.select));
}
function buildSql(queryParams) {
    var _a, _b, _c, _d;
    const { select, where, params } = queryParams || {};
    const selectedSqlFragments = [];
    const paramsValues = [];
    const whereColumns = new Set((where === null || where === void 0 ? void 0 : where.map(w => w.column)) || []);
    if (!select || select.date1 === true) {
        selectedSqlFragments.push(`date1`);
    }
    if (!select || select.date === true) {
        selectedSqlFragments.push(`date(date1) as date`);
    }
    if (!select || select.date_time === true) {
        selectedSqlFragments.push(`datetime(date2) as date_time`);
    }
    const fromSqlFragments = [];
    fromSqlFragments.push(`FROM date_table`);
    const whereSqlFragments = [];
    whereSqlFragments.push(`date(date1) = ? AND datetime(date2) = ?`);
    paramsValues.push((_b = (_a = params === null || params === void 0 ? void 0 : params.param1) === null || _a === void 0 ? void 0 : _a.toISOString().split('T')[0]) !== null && _b !== void 0 ? _b : null);
    paramsValues.push((_d = (_c = params === null || params === void 0 ? void 0 : params.param2) === null || _c === void 0 ? void 0 : _c.toISOString().split('.')[0].replace('T', ' ')) !== null && _d !== void 0 ? _d : null);
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
function mapArrayToDynamicQuery08Result(data, select) {
    const result = {};
    let rowIndex = -1;
    if (!select || select.date1 === true) {
        rowIndex++;
        result.date1 = data[rowIndex];
    }
    if (!select || select.date === true) {
        rowIndex++;
        result.date = data[rowIndex] != null ? new Date(data[rowIndex]) : data[rowIndex];
    }
    if (!select || select.date_time === true) {
        rowIndex++;
        result.date_time = data[rowIndex] != null ? new Date(data[rowIndex]) : data[rowIndex];
    }
    return result;
}
function whereCondition(condition, placeholder) {
    const selectFragment = selectFragments[condition.column];
    const { op, value } = condition;
    if (op === 'LIKE') {
        return {
            sql: `${selectFragment} LIKE ${placeholder()}`,
            hasValue: value != null,
            values: [value]
        };
    }
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
function isDate(value) {
    return value instanceof Date;
}
//# sourceMappingURL=dynamic-query08.js.map