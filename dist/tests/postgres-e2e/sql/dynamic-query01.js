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
exports.dynamicQuery01 = dynamicQuery01;
const os_1 = require("os");
const selectFragments = {
    id: `m1.id`,
    value: `m1.value`,
    name: `m2.name`,
    description: `m2.descr`,
};
const NumericOperatorList = ['=', '<>', '>', '<', '>=', '<='];
function dynamicQuery01(client, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { sql, paramsValues } = buildSql(params);
        return client.query({ text: sql, rowMode: 'array', values: paramsValues })
            .then(res => res.rows.map(row => mapArrayToDynamicQuery01Result(row, params === null || params === void 0 ? void 0 : params.select)));
    });
}
function buildSql(queryParams) {
    const { select, where } = queryParams || {};
    const selectedSqlFragments = [];
    const paramsValues = [];
    const whereColumns = new Set((where === null || where === void 0 ? void 0 : where.map(w => w.column)) || []);
    if (!select || select.id === true) {
        selectedSqlFragments.push(`m1.id`);
    }
    if (!select || select.value === true) {
        selectedSqlFragments.push(`m1.value`);
    }
    if (!select || select.name === true) {
        selectedSqlFragments.push(`m2.name`);
    }
    if (!select || select.description === true) {
        selectedSqlFragments.push(`m2.descr as description`);
    }
    const fromSqlFragments = [];
    fromSqlFragments.push(`FROM mytable1 m1`);
    if ((!select || select.name === true)
        || (!select || select.description === true)
        || whereColumns.has('name')
        || whereColumns.has('description')) {
        fromSqlFragments.push(`INNER JOIN mytable2 m2 on m1.id = m2.id`);
    }
    const whereSqlFragments = [];
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
function mapArrayToDynamicQuery01Result(data, select) {
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
    if (!select || select.name === true) {
        rowIndex++;
        result.name = data[rowIndex];
    }
    if (!select || select.description === true) {
        rowIndex++;
        result.description = data[rowIndex];
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
//# sourceMappingURL=dynamic-query01.js.map