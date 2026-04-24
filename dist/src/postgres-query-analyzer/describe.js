"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeQuery = describeQuery;
const postgres_1 = require("../drivers/postgres");
const parser_1 = require("./parser");
const replace_list_params_1 = require("../sqlite-query-analyzer/replace-list-params");
const neverthrow_1 = require("neverthrow");
const postgres_2 = require("../dialects/postgres");
const sqlite_describe_nested_query_1 = require("../sqlite-query-analyzer/sqlite-describe-nested-query");
const Either_1 = require("fp-ts/lib/Either");
const describe_query_1 = require("../describe-query");
const describe_dynamic_query_1 = require("../describe-dynamic-query");
const util_1 = require("./util");
function describeQueryRefine(describeParameters) {
    const { sql, postgresDescribeResult, namedParameters, schemaInfo } = describeParameters;
    const { columns: dbSchema, enumTypes, userFunctions, checkConstraints } = schemaInfo;
    const generateNestedInfo = (0, describe_query_1.hasAnnotation)(sql, '@nested');
    const generateDynamicQueryInfo = (0, describe_query_1.hasAnnotation)(sql, '@dynamicQuery');
    const parseResult = (0, parser_1.safeParseSql)(sql, dbSchema, checkConstraints, userFunctions, { collectNestedInfo: generateNestedInfo, collectDynamicQueryInfo: generateDynamicQueryInfo });
    if (parseResult.isErr()) {
        return (0, neverthrow_1.err)({
            name: 'ParserError',
            description: parseResult.error
        });
    }
    const traverseResult = parseResult.value;
    const paramWithTypes = namedParameters.map(param => {
        const paramTypeOid = postgresDescribeResult.parameters[param.paramNumber - 1];
        return Object.assign(Object.assign({}, param), { typeOid: paramTypeOid });
    });
    //replace list parameters
    const newSql = (0, replace_list_params_1.replacePostgresParams)(sql, traverseResult.parameterList, namedParameters.map(param => param.paramName));
    const parameters = transformToParamDefList(traverseResult, enumTypes, paramWithTypes);
    const descResult = {
        sql: newSql,
        queryType: traverseResult.queryType,
        multipleRowsResult: traverseResult.multipleRowsResult,
        columns: getColumnsForQuery(generateNestedInfo, traverseResult, postgresDescribeResult, enumTypes, checkConstraints),
        parameters: getParametersForQuery(traverseResult, parameters)
    };
    if (traverseResult.queryType === 'Update') {
        descResult.data = getDataParametersForQuery(traverseResult, parameters);
    }
    if (traverseResult.returning) {
        descResult.returning = traverseResult.returning;
    }
    if (traverseResult.orderByColumns) {
        descResult.orderByColumns = traverseResult.orderByColumns;
    }
    if (traverseResult.relations) {
        const nestedResult = (0, sqlite_describe_nested_query_1.describeNestedQuery)(descResult.columns, traverseResult.relations || []);
        if ((0, Either_1.isLeft)(nestedResult)) {
            return (0, neverthrow_1.err)({
                name: 'ParserError',
                description: 'Error during nested query result: ' + nestedResult.left.description
            });
        }
        descResult.nestedInfo = nestedResult.right;
    }
    if (traverseResult.dynamicQueryInfo) {
        const orderByColumns = describeParameters.hasOrderBy ? traverseResult.orderByColumns || [] : [];
        const dynamicSqlQueryInfo = (0, describe_dynamic_query_1.describeDynamicQuery2)(traverseResult.dynamicQueryInfo, namedParameters.map(param => param.paramName), orderByColumns);
        descResult.dynamicSqlQuery2 = dynamicSqlQueryInfo;
    }
    return (0, neverthrow_1.ok)(descResult);
}
function mapToColumnInfo(collectNestedInfo, col, posgresTypes, enumTypes, checkConstraints, colInfo) {
    const constraintKey = `[${colInfo.schema}][${colInfo.table}][${colInfo.column_name}]`;
    const columnInfo = {
        name: col.name,
        notNull: !colInfo.is_nullable,
        type: createType(col.typeId, posgresTypes, enumTypes.get(col.typeId), checkConstraints[constraintKey], colInfo.jsonType),
        table: colInfo.table
    };
    if (collectNestedInfo) {
        columnInfo.intrinsicNotNull = !colInfo.original_is_nullable;
    }
    return columnInfo;
}
function createType(typeId, postgresTypes, enumType, checkConstraint, jsonType) {
    var _a;
    if (enumType) {
        return createEnumType(enumType);
    }
    if (checkConstraint) {
        return checkConstraint;
    }
    if (jsonType) {
        return jsonType;
    }
    return (_a = postgresTypes[typeId]) !== null && _a !== void 0 ? _a : 'unknown';
}
function createEnumType(enumList) {
    const enumListStr = enumList.map(col => `'${col.enumlabel}'`).join(',');
    return `enum(${enumListStr})`;
}
function mapToParamDef(postgresTypes, enumTypes, paramName, paramTypeOid, checkConstraint, notNull, isList) {
    const arrayType = isList ? '[]' : '';
    return {
        name: paramName,
        notNull,
        type: `${createType(paramTypeOid, postgresTypes, enumTypes.get(paramTypeOid), checkConstraint, undefined)}${arrayType}`
    };
}
function describeQuery(postgres, sql, schemaInfo) {
    const newSql = (0, util_1.replaceOrderByParamWithPlaceholder)(sql);
    const { sql: preprocessed, namedParameters } = (0, describe_query_1.preprocessSql)(newSql.sql, 'postgres');
    return (0, postgres_1.postgresDescribe)(postgres, preprocessed).andThen(analyzeResult => {
        const describeParameters = {
            sql: preprocessed,
            postgresDescribeResult: analyzeResult,
            namedParameters,
            schemaInfo,
            hasOrderBy: newSql.replaced
        };
        return describeQueryRefine(describeParameters).map(desc => {
            const { orderByColumns } = desc, res = __rest(desc, ["orderByColumns"]);
            const result = Object.assign(Object.assign({}, res), { sql: (0, util_1.replaceOrderByPlaceholderWithBuildOrderBy)(desc.sql) });
            if (newSql.replaced) {
                result.orderByColumns = desc.orderByColumns;
            }
            return result;
        });
    });
}
function getColumnsForQuery(collectNestedInfo, traverseResult, postgresDescribeResult, enumTypes, checkConstraints) {
    return postgresDescribeResult.columns.map((col, index) => mapToColumnInfo(collectNestedInfo, col, postgres_2.postgresTypes, enumTypes, checkConstraints, traverseResult.columns[index]));
}
function transformToParamDefList(traverseResult, enumTypes, params) {
    const parametersNullability = traverseResult.parametersNullability.concat(traverseResult.whereParamtersNullability || []);
    const paramMap = groupByParamNumber(params);
    return Object.values(paramMap).map(group => {
        const notNull = group.every(param => { var _a; return (_a = parametersNullability[param.index]) === null || _a === void 0 ? void 0 : _a.isNotNull; });
        const paramList = group.every(param => traverseResult.parameterList[param.index]);
        const paramCheckConstraint = group.map(param => { var _a; return (_a = parametersNullability[param.index]) === null || _a === void 0 ? void 0 : _a.checkConstraint; }).find(Boolean);
        const paramResult = mapToParamDef(postgres_2.postgresTypes, enumTypes, group[0].paramName, group[0].typeOid, paramCheckConstraint, notNull, paramList);
        return paramResult;
    });
}
function groupByParamNumber(params) {
    return params.reduce((acc, param, index) => {
        const withIndex = Object.assign(Object.assign({}, param), { index });
        if (!acc[param.paramNumber]) {
            acc[param.paramNumber] = [];
        }
        acc[param.paramNumber].push(withIndex);
        return acc;
    }, {});
}
function getColumnsForCopyStmt(traverseResult) {
    return traverseResult.columns.map(col => {
        var _a;
        const result = {
            name: col.column_name,
            type: (_a = col.type) !== null && _a !== void 0 ? _a : 'unknown',
            notNull: !col.is_nullable
        };
        return result;
    });
}
function getParametersForQuery(traverseResult, params) {
    if (traverseResult.queryType === 'Update') {
        const dataParamCount = traverseResult.parametersNullability.length;
        const dataParams = params.slice(0, dataParamCount);
        const whereParams = params.slice(dataParamCount);
        const dataParamNames = new Set(dataParams.map(p => p.name));
        // Filter out whereParams that are already in dataParams
        const filteredWhereParams = whereParams.filter(p => !dataParamNames.has(p.name));
        return filteredWhereParams;
    }
    if (traverseResult.queryType === 'Copy') {
        return getColumnsForCopyStmt(traverseResult);
    }
    return params;
}
function getDataParametersForQuery(traverseResult, params) {
    const dataParams = params.slice(0, traverseResult.parametersNullability.length);
    return dataParams;
}
//# sourceMappingURL=describe.js.map