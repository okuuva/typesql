"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traverseSql = traverseSql;
exports.parseSql = parseSql;
const Either_1 = require("fp-ts/lib/Either");
const sqlite_1 = require("@wsporto/typesql-parser/sqlite");
const traverse_1 = require("./traverse");
const collect_constraints_1 = require("../mysql-query-analyzer/collect-constraints");
const unify_1 = require("../mysql-query-analyzer/unify");
const describe_query_1 = require("../describe-query");
const sqlite_describe_nested_query_1 = require("./sqlite-describe-nested-query");
const util_1 = require("../util");
const replace_list_params_1 = require("./replace-list-params");
const describe_dynamic_query_1 = require("../describe-dynamic-query");
function traverseSql(sql, dbSchema) {
    const { sql: processedSql, namedParameters } = (0, describe_query_1.preprocessSql)(sql, 'sqlite');
    const nested = (0, describe_query_1.hasAnnotation)(sql, '@nested');
    const dynamicQuery = (0, describe_query_1.hasAnnotation)(sql, '@dynamicQuery');
    const parser = (0, sqlite_1.parseSql)(processedSql);
    const sql_stmt = parser.sql_stmt();
    const traverseResult = traverseQuery(sql_stmt, dbSchema);
    if ((0, Either_1.isLeft)(traverseResult)) {
        return traverseResult;
    }
    const result = {
        traverseResult: traverseResult.right,
        namedParameters: namedParameters.map(param => param.paramName),
        nested,
        processedSql,
        dynamicQuery
    };
    return (0, Either_1.right)(result);
}
function parseSql(sql, dbSchema) {
    const parseAndTraverseResult = traverseSql(sql, dbSchema);
    if ((0, Either_1.isLeft)(parseAndTraverseResult)) {
        return parseAndTraverseResult;
    }
    const { traverseResult, processedSql, namedParameters, nested, dynamicQuery } = parseAndTraverseResult.right;
    return createSchemaDefinition(processedSql, traverseResult, namedParameters, nested, dynamicQuery);
}
function traverseQuery(sql_stmtContext, dbSchema) {
    const traverseContext = {
        dbSchema,
        withSchema: [],
        constraints: [],
        parameters: [],
        fromColumns: [],
        subQueryColumns: [],
        subQuery: false,
        where: false,
        dynamicSqlInfo: {
            with: [],
            select: [],
            from: [],
            where: []
        },
        dynamicSqlInfo2: {
            with: [],
            select: [],
            from: [],
            where: []
        },
        relations: []
    };
    const queryResultResult = (0, traverse_1.tryTraverse_Sql_stmtContext)(sql_stmtContext, traverseContext);
    return queryResultResult;
}
function createSchemaDefinition(sql, queryResult, namedParameters, nestedQuery, dynamicQuery) {
    const groupedByName = (0, util_1.indexGroupBy)(namedParameters, (p) => p);
    const paramsById = new Map();
    queryResult.parameters.forEach((param) => {
        paramsById.set(param.type.id, param);
    });
    groupedByName.forEach((sameNameList) => {
        let notNull = queryResult.parameters[sameNameList[0]].notNull !== false; //param is not null if any param with same name is not null
        for (let index = 0; index < sameNameList.length; index++) {
            notNull = notNull && queryResult.parameters[sameNameList[index]].notNull !== false;
            queryResult.constraints.push({
                expression: queryResult.parameters[sameNameList[0]].name,
                type1: queryResult.parameters[sameNameList[0]].type,
                type2: queryResult.parameters[sameNameList[index]].type
            });
        }
        for (let index = 0; index < sameNameList.length; index++) {
            queryResult.parameters[sameNameList[index]].notNull = notNull;
        }
    });
    const substitutions = {}; //TODO - DUPLICADO
    (0, unify_1.unify)(queryResult.constraints, substitutions);
    if (queryResult.queryType === 'Select') {
        const columnResult = queryResult.columns.map((col) => {
            var _a;
            const columnType = (0, collect_constraints_1.getVarType)(substitutions, col.type);
            const columnNotNull = paramsById.get(col.type.id) != null ? ((_a = paramsById.get(col.type.id)) === null || _a === void 0 ? void 0 : _a.notNull) === true : col.notNull === true;
            const colInfo = {
                name: col.name,
                type: (0, describe_query_1.verifyNotInferred)(columnType),
                notNull: columnNotNull,
                table: col.table
            };
            if (nestedQuery) {
                colInfo.intrinsicNotNull = col.intrinsicNotNull;
            }
            return colInfo;
        });
        const paramsResult = queryResult.parameters.map((param, index) => {
            const columnType = (0, collect_constraints_1.getVarType)(substitutions, param.type);
            const columnNotNull = param.notNull === true;
            const colInfo = {
                name: (namedParameters === null || namedParameters === void 0 ? void 0 : namedParameters[index]) ? namedParameters[index] : `param${index + 1}`,
                columnType: (0, describe_query_1.verifyNotInferred)(columnType),
                notNull: columnNotNull
            };
            return colInfo;
        });
        const nameAndParamPosition = paramsResult
            .flatMap((param, index) => {
            var _a;
            if ((_a = param.columnType) === null || _a === void 0 ? void 0 : _a.endsWith('[]')) {
                const nameAndPosition = {
                    name: param.name,
                    paramPosition: queryResult.parameters[index].paramIndex
                };
                return nameAndPosition;
            }
            return [];
        });
        const newSql = (0, replace_list_params_1.replaceListParams)(sql, nameAndParamPosition);
        const schemaDef = {
            sql: newSql,
            queryType: queryResult.queryType,
            multipleRowsResult: queryResult.multipleRowsResult,
            columns: columnResult,
            parameters: paramsResult
        };
        if (queryResult.orderByColumns) {
            schemaDef.orderByColumns = queryResult.orderByColumns;
        }
        if (nestedQuery) {
            const nestedResult = (0, sqlite_describe_nested_query_1.describeNestedQuery)(columnResult, queryResult.relations);
            if ((0, Either_1.isLeft)(nestedResult)) {
                return nestedResult;
            }
            schemaDef.nestedInfo = nestedResult.right;
        }
        if (dynamicQuery) {
            const dynamicSqlInfo = (0, describe_dynamic_query_1.describeDynamicQuery2)(queryResult.dynamicQueryInfo, namedParameters, queryResult.orderByColumns || []);
            schemaDef.dynamicSqlQuery2 = dynamicSqlInfo;
        }
        return (0, Either_1.right)(schemaDef);
    }
    if (queryResult.queryType === 'Insert') {
        const paramsResult = queryResult.parameters.map((param, index) => {
            const columnType = (0, collect_constraints_1.getVarType)(substitutions, param.type);
            const columnNotNull = param.notNull === true;
            const colInfo = {
                name: (namedParameters === null || namedParameters === void 0 ? void 0 : namedParameters[index]) ? namedParameters[index] : `param${index + 1}`,
                columnType: (0, describe_query_1.verifyNotInferred)(columnType),
                notNull: columnNotNull
            };
            return colInfo;
        });
        const columns = queryResult.columns.map((col) => {
            const columnType = (0, collect_constraints_1.getVarType)(substitutions, col.type);
            const colInfo = {
                name: col.name,
                type: (0, describe_query_1.verifyNotInferred)(columnType),
                notNull: col.notNull === true
            };
            return colInfo;
        });
        const schemaDef = {
            sql,
            queryType: queryResult.queryType,
            multipleRowsResult: false,
            columns,
            parameters: paramsResult
        };
        if (queryResult.returing) {
            schemaDef.returning = true;
        }
        return (0, Either_1.right)(schemaDef);
    }
    if (queryResult.queryType === 'Update') {
        const paramsResult = queryResult.columns.map((param, index) => {
            const columnType = (0, collect_constraints_1.getVarType)(substitutions, param.type);
            const columnNotNull = param.notNull === true;
            const colInfo = {
                name: (namedParameters === null || namedParameters === void 0 ? void 0 : namedParameters[index]) ? namedParameters[index] : `param${index + 1}`,
                columnType: (0, describe_query_1.verifyNotInferred)(columnType),
                notNull: columnNotNull
            };
            return colInfo;
        });
        const whereParams = queryResult.whereParams.map((param, index) => {
            const columnType = (0, collect_constraints_1.getVarType)(substitutions, param.type);
            const columnNotNull = param.notNull === true;
            const paramIndex = index + queryResult.columns.length;
            const colInfo = {
                name: (namedParameters === null || namedParameters === void 0 ? void 0 : namedParameters[paramIndex]) ? namedParameters[paramIndex] : `param${index + 1}`,
                columnType: (0, describe_query_1.verifyNotInferred)(columnType),
                notNull: columnNotNull
            };
            return colInfo;
        });
        const returninColumns = queryResult.returningColumns.map((col, index) => {
            const columnType = (0, collect_constraints_1.getVarType)(substitutions, col.type);
            const columnNotNull = col.notNull === true;
            const colInfo = {
                name: col.name,
                type: (0, describe_query_1.verifyNotInferred)(columnType),
                notNull: columnNotNull
            };
            return colInfo;
        });
        const schemaDef = {
            sql,
            queryType: queryResult.queryType,
            multipleRowsResult: false,
            columns: returninColumns,
            data: paramsResult,
            parameters: whereParams
        };
        if (queryResult.returing) {
            schemaDef.returning = true;
        }
        return (0, Either_1.right)(schemaDef);
    }
    if (queryResult.queryType === 'Delete') {
        const whereParams = queryResult.parameters.map((param, index) => {
            const columnType = (0, collect_constraints_1.getVarType)(substitutions, param.type);
            const columnNotNull = param.notNull === true;
            const colInfo = {
                name: (namedParameters === null || namedParameters === void 0 ? void 0 : namedParameters[index]) ? namedParameters[index] : `param${index + 1}`,
                columnType: (0, describe_query_1.verifyNotInferred)(columnType),
                notNull: columnNotNull
            };
            return colInfo;
        });
        const returninColumns = queryResult.returningColumns.map((col, index) => {
            const columnType = (0, collect_constraints_1.getVarType)(substitutions, col.type);
            const columnNotNull = col.notNull === true;
            const colInfo = {
                name: col.name,
                type: (0, describe_query_1.verifyNotInferred)(columnType),
                notNull: columnNotNull
            };
            return colInfo;
        });
        const schemaDef = {
            sql,
            queryType: queryResult.queryType,
            multipleRowsResult: false,
            columns: returninColumns,
            parameters: whereParams
        };
        if (queryResult.returing) {
            schemaDef.returning = true;
        }
        return (0, Either_1.right)(schemaDef);
    }
    return (0, Either_1.left)({
        name: 'parse error',
        description: 'query not supported'
    });
}
//# sourceMappingURL=parser.js.map