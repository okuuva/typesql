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
exports.dynamicQuery08 = dynamicQuery08;
const os_1 = require("os");
const selectFragments = {
    timestamp_not_null_column: `timestamp_not_null_column`,
};
const NumericOperatorList = ['=', '<>', '>', '<', '>=', '<='];
function dynamicQuery08(client, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { sql, paramsValues } = buildSql(params);
        return client.query({ text: sql, rowMode: 'array', values: paramsValues })
            .then(res => res.rows.map(row => mapArrayToDynamicQuery08Result(row, params === null || params === void 0 ? void 0 : params.select)));
    });
}
function buildSql(queryParams) {
    var _a, _b;
    const { select, where, params } = queryParams || {};
    const selectedSqlFragments = [];
    const paramsValues = [];
    const whereColumns = new Set((where === null || where === void 0 ? void 0 : where.map(w => w.column)) || []);
    if (!select || select.timestamp_not_null_column === true) {
        selectedSqlFragments.push(`timestamp_not_null_column`);
    }
    const fromSqlFragments = [];
    fromSqlFragments.push(`FROM all_types `);
    const whereSqlFragments = [];
    whereSqlFragments.push(`EXTRACT(YEAR FROM timestamp_not_null_column) = $1 AND EXTRACT(MONTH FROM timestamp_not_null_column) = $2`);
    paramsValues.push((_a = params === null || params === void 0 ? void 0 : params.param1) !== null && _a !== void 0 ? _a : null);
    paramsValues.push((_b = params === null || params === void 0 ? void 0 : params.param2) !== null && _b !== void 0 ? _b : null);
    let currentIndex = paramsValues.length;
    const placeholder = () => `$${++currentIndex}`;
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
    if (!select || select.timestamp_not_null_column === true) {
        rowIndex++;
        result.timestamp_not_null_column = data[rowIndex];
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
//# sourceMappingURL=dynamic-query08.js.map