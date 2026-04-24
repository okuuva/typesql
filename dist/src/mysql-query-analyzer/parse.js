"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
exports.parseAndInfer = parseAndInfer;
exports.parseAndInferParamNullability = parseAndInferParamNullability;
exports.extractOrderByParameters = extractOrderByParameters;
exports.extractLimitParameters = extractLimitParameters;
exports.isMultipleRowResult = isMultipleRowResult;
exports.isSumExpressContext = isSumExpressContext;
exports.getLimitOptions = getLimitOptions;
exports.extractQueryInfo = extractQueryInfo;
exports.getAllQuerySpecificationsFromSelectStatement = getAllQuerySpecificationsFromSelectStatement;
const mysql_1 = __importDefault(require("@wsporto/typesql-parser/mysql"));
const typesql_parser_1 = require("@wsporto/typesql-parser");
const MySQLParser_1 = require("@wsporto/typesql-parser/mysql/MySQLParser");
const collect_constraints_1 = require("./collect-constraints");
const infer_param_nullability_1 = require("./infer-param-nullability");
const describe_query_1 = require("../describe-query");
const verify_multiple_result_1 = require("./verify-multiple-result");
const unify_1 = require("./unify");
const traverse_1 = require("./traverse");
const describe_nested_query_1 = require("../describe-nested-query");
const describe_dynamic_query_1 = require("../describe-dynamic-query");
const common_1 = require("@wsporto/typesql-parser/mysql/common");
const parser = new mysql_1.default({
    version: '8.0.17',
    mode: common_1.SqlMode.NoMode
});
function parse(sql) {
    const parseResult = parser.parse(sql);
    return parseResult.tree;
}
//TODO - withSchema DEFAULT VALUE []
function parseAndInfer(sql, dbSchema) {
    const result = extractQueryInfo(sql, dbSchema);
    if (result.kind === 'Select') {
        return {
            columns: result.columns.map((p) => p.type),
            parameters: result.parameters.map((p) => p.type)
        };
    }
    if (result.kind === 'Insert') {
        return {
            columns: [],
            parameters: result.parameters.map((p) => p.columnType)
        };
    }
    if (result.kind === 'Update') {
        return {
            columns: [],
            parameters: result.data.map((p) => p.columnType)
        };
    }
    throw Error(`parseAndInfer: ${sql}`);
}
function parseAndInferParamNullability(sql) {
    var _a;
    const queryContext = parse(sql);
    const selectStatement = (_a = queryContext.simpleStatement()) === null || _a === void 0 ? void 0 : _a.selectStatement();
    return (0, infer_param_nullability_1.inferParamNullabilityQuery)(selectStatement);
}
function extractOrderByParameters(selectStatement) {
    var _a, _b;
    return (((_b = (_a = selectStatement
        .queryExpression()) === null || _a === void 0 ? void 0 : _a.orderClause()) === null || _b === void 0 ? void 0 : _b.orderList().orderExpression_list().filter((orderExpr) => orderExpr.getText() === '?').map((orderExpr) => orderExpr.getText())) || []);
}
function extractLimitParameters(selectStatement) {
    return (getLimitOptions(selectStatement)
        .filter((limit) => limit.PARAM_MARKER())
        .map(() => {
        const paramInfo = {
            type: 'bigint',
            notNull: true
        };
        return paramInfo;
    }) || []);
}
function isMultipleRowResult(selectStatement, fromColumns) {
    var _a, _b;
    const querySpecs = getAllQuerySpecificationsFromSelectStatement(selectStatement);
    if (querySpecs.length === 1) {
        //UNION queries are multipleRowsResult = true
        const fromClause = querySpecs[0].fromClause();
        if (!fromClause) {
            return false;
        }
        if (querySpecs[0].selectItemList().getChildCount() === 1) {
            const selectItem = querySpecs[0].selectItemList().getChild(0);
            //if selectItem = * (TerminalNode) childCount = 0; selectItem.expr() throws exception
            const expr = selectItem.getChildCount() > 0 ? selectItem.expr() : null;
            if (expr) {
                //SUM, MAX... WITHOUT GROUP BY are multipleRowsResult = false
                const groupBy = querySpecs[0].groupByClause();
                if (!groupBy && isSumExpressContext(expr)) {
                    return false;
                }
            }
        }
        const joinedTable = (_a = fromClause.tableReferenceList()) === null || _a === void 0 ? void 0 : _a.tableReference(0).joinedTable_list();
        if (joinedTable && joinedTable.length > 0) {
            return true;
        }
        const whereClauseExpr = (_b = querySpecs[0].whereClause()) === null || _b === void 0 ? void 0 : _b.expr();
        const isMultipleRowResult = whereClauseExpr && (0, verify_multiple_result_1.verifyMultipleResult)(whereClauseExpr, fromColumns);
        if (isMultipleRowResult === false) {
            return false;
        }
    }
    const limitOptions = getLimitOptions(selectStatement);
    if (limitOptions.length === 1 && limitOptions[0].getText() === '1') {
        return false;
    }
    if (limitOptions.length === 2 && limitOptions[1].getText() === '1') {
        return false;
    }
    return true;
}
function isSumExpressContext(selectItem) {
    var _a;
    if (selectItem instanceof MySQLParser_1.SimpleExprWindowingFunctionContext || selectItem instanceof typesql_parser_1.TerminalNode) {
        return false;
    }
    if (selectItem instanceof MySQLParser_1.SumExprContext) {
        if (selectItem.children) {
            //any of the children is WindowingClauseContext OVER()
            for (const child of selectItem.children) {
                if (child instanceof MySQLParser_1.WindowingClauseContext) {
                    return false;
                }
            }
        }
        return true;
    }
    //https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html
    if (selectItem instanceof MySQLParser_1.FunctionCallContext) {
        if (((_a = selectItem.qualifiedIdentifier()) === null || _a === void 0 ? void 0 : _a.getText().toLowerCase()) === 'avg') {
            return true;
        }
    }
    if (selectItem instanceof typesql_parser_1.ParserRuleContext && selectItem.getChildCount() === 1) {
        return isSumExpressContext(selectItem.getChild(0));
    }
    return false;
}
function getLimitOptions(selectStatement) {
    var _a, _b;
    return ((_b = (_a = selectStatement.queryExpression()) === null || _a === void 0 ? void 0 : _a.limitClause()) === null || _b === void 0 ? void 0 : _b.limitOptions().limitOption_list()) || [];
}
function extractQueryInfo(sql, dbSchema) {
    const { sql: processedSql, namedParameters } = (0, describe_query_1.preprocessSql)(sql, 'mysql');
    const paramNames = namedParameters.map(param => param.paramName);
    const gererateNested = (0, describe_query_1.hasAnnotation)(sql, '@nested');
    const gererateDynamicQuery = (0, describe_query_1.hasAnnotation)(sql, '@dynamicQuery');
    const tree = parse(processedSql);
    const traverseResult = (0, traverse_1.traverseQueryContext)(tree, dbSchema, paramNames);
    if (traverseResult.type === 'Select') {
        const queryInfoResult = extractSelectQueryInfo(traverseResult);
        if (gererateNested) {
            const nestedInfo = (0, describe_nested_query_1.generateNestedInfo)(tree, dbSchema, queryInfoResult.columns);
            queryInfoResult.nestedResultInfo = nestedInfo;
        }
        if (gererateDynamicQuery) {
            const dynamicQuery = (0, describe_dynamic_query_1.describeDynamicQuery)(traverseResult.dynamicSqlInfo, paramNames, queryInfoResult.orderByColumns || []);
            queryInfoResult.dynamicQuery = dynamicQuery;
        }
        return queryInfoResult;
    }
    if (traverseResult.type === 'Insert') {
        const newResult = {
            kind: 'Insert',
            parameters: traverseResult.parameters
        };
        return newResult;
    }
    if (traverseResult.type === 'Update') {
        const substitutions = {}; //TODO - DUPLICADO
        (0, unify_1.unify)(traverseResult.constraints, substitutions);
        const columnResult = traverseResult.data.map((col) => {
            const columnType = (0, collect_constraints_1.getVarType)(substitutions, col.type);
            const columnNotNull = col.notNull === true;
            const colInfo = {
                name: col.name,
                columnType: (0, describe_query_1.verifyNotInferred)(columnType),
                notNull: columnNotNull
            };
            return colInfo;
        });
        const paramResult = traverseResult.parameters.map((col) => {
            const columnType = (0, collect_constraints_1.getVarType)(substitutions, col.type);
            const columnNotNull = col.notNull === true;
            const colInfo = {
                name: col.name,
                columnType: (0, describe_query_1.verifyNotInferred)(columnType),
                notNull: columnNotNull
            };
            return colInfo;
        });
        const newResult = {
            kind: 'Update',
            data: columnResult,
            parameters: paramResult
        };
        return newResult;
    }
    if (traverseResult.type === 'Delete') {
        const newResult = {
            kind: 'Delete',
            parameters: traverseResult.parameters
        };
        return newResult;
    }
    throw Error('Not supported');
}
function extractSelectQueryInfo(traverseResult) {
    const substitutions = {}; //TODO - DUPLICADO
    (0, unify_1.unify)(traverseResult.constraints, substitutions);
    const columnResult = traverseResult.columns.map((col) => {
        const columnType = (0, collect_constraints_1.getVarType)(substitutions, col.type);
        const columnNotNull = col.notNull === true;
        const colInfo = {
            name: col.name,
            type: (0, describe_query_1.verifyNotInferred)(columnType),
            notNull: columnNotNull,
            table: col.table
        };
        return colInfo;
    });
    const paramsResult = traverseResult.parameters
        .map((param) => {
        const columnType = (0, collect_constraints_1.getVarType)(substitutions, param.type);
        const columnNotNull = param.notNull === true;
        const colInfo = {
            // columnName: param.name,
            type: (0, describe_query_1.verifyNotInferred)(columnType),
            notNull: columnNotNull
        };
        return colInfo;
    })
        .concat(traverseResult.limitParameters);
    const resultWithoutOrderBy = {
        kind: 'Select',
        multipleRowsResult: traverseResult.isMultiRow,
        columns: columnResult,
        parameters: paramsResult
    };
    if (traverseResult.orderByColumns) {
        resultWithoutOrderBy.orderByColumns = traverseResult.orderByColumns;
    }
    return resultWithoutOrderBy;
}
function getAllQuerySpecificationsFromSelectStatement(selectStatement) {
    const result = [];
    collectAllQuerySpecifications(selectStatement, result);
    return result;
}
function collectAllQuerySpecifications(tree, result) {
    for (let i = 0; i < tree.getChildCount(); i++) {
        const child = tree.getChild(i);
        if (child instanceof MySQLParser_1.QuerySpecificationContext) {
            result.push(child);
        }
        else if (child instanceof typesql_parser_1.ParserRuleContext) {
            collectAllQuerySpecifications(child, result);
        }
    }
}
//# sourceMappingURL=parse.js.map