"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndInferNotNull = parseAndInferNotNull;
exports.inferNotNull = inferNotNull;
exports.possibleNull = possibleNull;
const MySQLParser_1 = require("@wsporto/typesql-parser/mysql/MySQLParser");
const select_columns_1 = require("./select-columns");
const infer_param_nullability_1 = require("./infer-param-nullability");
const traverse_1 = require("./traverse");
const parse_1 = require("./parse");
const describe_query_1 = require("../describe-query");
//TODO - COLUMN SCHEMA DEFAULT = []
//utility for tests
function parseAndInferNotNull(sql, dbSchema) {
    const { sql: processedSql, namedParameters } = (0, describe_query_1.preprocessSql)(sql, 'mysql');
    const tree = (0, parse_1.parse)(processedSql);
    const result = (0, traverse_1.traverseQueryContext)(tree, dbSchema, namedParameters.map(param => param.paramName));
    if (result.type === 'Select') {
        return result.columns.map((col) => col.notNull);
    }
    return [];
}
function inferNotNull(querySpec, dbSchema, fromColumns) {
    const notNullInference = [];
    const whereClause = querySpec.whereClause();
    if (querySpec.selectItemList().MULT_OPERATOR()) {
        for (const col of fromColumns) {
            const field = (0, select_columns_1.splitName)(col.columnName);
            const notNull = col.notNull || (whereClause && !possibleNullWhere(field, whereClause)) || false;
            notNullInference.push(notNull); //TODO infernot null in where?
        }
    }
    const selectItem_list = querySpec.selectItemList().selectItem_list();
    for (const selectItem of selectItem_list) {
        notNullInference.push(...inferNotNullSelectItem(selectItem, dbSchema, fromColumns, whereClause));
    }
    return notNullInference;
}
function inferNotNullSelectItem(selectItem, dbSchema, fromColumns, whereClause) {
    const notNullItems = [];
    const tableWild = selectItem.tableWild();
    if (tableWild === null || tableWild === void 0 ? void 0 : tableWild.MULT_OPERATOR()) {
        tableWild.identifier_list().forEach((tabWild) => {
            const prefix = tabWild.getText();
            const columns = (0, select_columns_1.selectAllColumns)(prefix, fromColumns);
            columns.forEach((col) => {
                const field = (0, select_columns_1.splitName)(col.columnName);
                const notNull = col.notNull || (whereClause && !possibleNullWhere(field, whereClause)) || false;
                notNullItems.push(notNull);
            });
        });
        return notNullItems;
    }
    const expr = selectItem.expr();
    if (expr) {
        const notNull = inferNotNullExpr(expr, dbSchema, fromColumns);
        return [notNull];
    }
    throw Error('Error during column null inference');
}
function inferNotNullExpr(expr, dbSchema, fromColumns) {
    if (expr instanceof MySQLParser_1.ExprIsContext) {
        return inferNotNullExprIs(expr, dbSchema, fromColumns);
    }
    throw Error('Error during column null inference');
}
function inferNotNullExprIs(exprIs, dbSchema, fromColumns) {
    const boolPri = exprIs.boolPri();
    return inferNotNullBoolPri(boolPri, dbSchema, fromColumns);
}
function inferNotNullBoolPri(boolPri, dbSchema, fromColumns) {
    if (boolPri instanceof MySQLParser_1.PrimaryExprPredicateContext) {
        const predicate = boolPri.predicate();
        return inferNotNullPredicate(predicate, dbSchema, fromColumns);
    }
    if (boolPri instanceof MySQLParser_1.PrimaryExprCompareContext) {
        const compareLeft = boolPri.boolPri();
        const compareRight = boolPri.predicate();
        const notNullLeft = inferNotNullBoolPri(compareLeft, dbSchema, fromColumns);
        const notNullRight = inferNotNullPredicate(compareRight, dbSchema, fromColumns);
        return notNullLeft && notNullRight;
    }
    if (boolPri instanceof MySQLParser_1.PrimaryExprIsNullContext) {
        return true;
    }
    throw Error('Error during column null inference');
}
function inferNotNullPredicate(predicate, dbSchema, fromColumns) {
    const bitExpr = predicate.bitExpr_list();
    if (bitExpr.length === 1) {
        return inferNotNullBitExpr(bitExpr[0], dbSchema, fromColumns);
    }
    throw Error('Error during column null inference');
}
function inferNotNullBitExpr(bitExpr, dbSchema, fromColumns) {
    const simpleExpr = bitExpr.simpleExpr();
    if (simpleExpr) {
        return inferNotNullSimpleExpr(simpleExpr, dbSchema, fromColumns);
    }
    const bitExpr2 = bitExpr.bitExpr_list();
    const notNull = bitExpr2.every((bitExprItem) => inferNotNullBitExpr(bitExprItem, dbSchema, fromColumns));
    return notNull;
}
function inferNotNullSimpleExpr(simpleExpr, dbSchema, fromColumns) {
    var _a;
    const querySpec = (0, infer_param_nullability_1.getParentContext)(simpleExpr, MySQLParser_1.QuerySpecificationContext);
    const whereClause = querySpec.whereClause();
    if (simpleExpr instanceof MySQLParser_1.SimpleExprColumnRefContext) {
        const columnName = simpleExpr.columnRef().fieldIdentifier().getText();
        const fieldName = (0, select_columns_1.splitName)(columnName);
        const column = (0, select_columns_1.findColumn)(fieldName, fromColumns);
        if (column.notNull) {
            return true;
        }
        if (whereClause && !possibleNullWhere(fieldName, whereClause)) {
            return true;
        }
        return false;
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprRuntimeFunctionContext) {
        return inferNotNullRuntimeFunctionCall(simpleExpr, dbSchema, fromColumns);
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprFunctionContext) {
        const functionCall = simpleExpr.functionCall();
        return inferNotNullFunctionCall(functionCall, dbSchema, fromColumns);
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprLiteralContext) {
        const nullLiteral = simpleExpr.literal().nullLiteral();
        if (nullLiteral) {
            return false;
        }
        return true;
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprParamMarkerContext) {
        const inferParam = (0, infer_param_nullability_1.inferParameterNotNull)(simpleExpr);
        return inferParam;
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprSumContext) {
        const sumExpr = simpleExpr.sumExpr();
        if (sumExpr.COUNT_SYMBOL()) {
            return true;
        }
        if (sumExpr.GROUP_CONCAT_SYMBOL()) {
            const exprList = (_a = sumExpr.exprList()) === null || _a === void 0 ? void 0 : _a.expr_list();
            if (exprList) {
                return exprList.every((expr) => inferNotNullExpr(expr, dbSchema, fromColumns));
            }
            //IF has not exprList, GROUP_CONCAT will concat all the fields from select
            return false; //TODO - INFER NULLABILITY
        }
        const inSumExpr = sumExpr.inSumExpr();
        if (inSumExpr) {
            return false;
        }
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprListContext) {
        const exprList = simpleExpr.exprList().expr_list();
        return exprList.every((expr) => inferNotNullExpr(expr, dbSchema, fromColumns));
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprSubQueryContext) {
        if (simpleExpr.EXISTS_SYMBOL()) {
            return true;
        }
        return false;
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprCaseContext) {
        const thenExprList = simpleExpr.thenExpression_list();
        const elseExpr = simpleExpr.elseExpression();
        if (elseExpr) {
            const caseNotNull = thenExprList.every((thenExpr) => inferNotNullExpr(thenExpr.expr(), dbSchema, fromColumns));
            return caseNotNull && inferNotNullExpr(elseExpr.expr(), dbSchema, fromColumns);
        }
        return false; //if doesn't have else, the not null can't be inferred
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprIntervalContext) {
        const exprList = simpleExpr.expr_list();
        return exprList.every((expr) => inferNotNullExpr(expr, dbSchema, fromColumns));
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprWindowingFunctionContext) {
        return inferNotNullWindowFunctionCall(simpleExpr.windowFunctionCall(), dbSchema, fromColumns);
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprCastContext) {
        const expr = simpleExpr.expr();
        return inferNotNullExpr(expr, dbSchema, fromColumns);
    }
    throw Error(`Error during column null inference. Expr: ${simpleExpr.getText()}`);
}
function inferNotNullWindowFunctionCall(windowFunctionCall, dbSchema, fromColumns) {
    if (windowFunctionCall.ROW_NUMBER_SYMBOL() ||
        windowFunctionCall.RANK_SYMBOL() ||
        windowFunctionCall.DENSE_RANK_SYMBOL() ||
        windowFunctionCall.CUME_DIST_SYMBOL() ||
        windowFunctionCall.PERCENT_RANK_SYMBOL()) {
        return true;
    }
    if (windowFunctionCall.LEAD_SYMBOL() || windowFunctionCall.LAG_SYMBOL()) {
        return false;
    }
    const exprWithParentheses = windowFunctionCall.exprWithParentheses();
    if (exprWithParentheses) {
        const expr = exprWithParentheses.expr();
        return inferNotNullExpr(expr, dbSchema, fromColumns);
    }
    throw Error('Error during column null inference in WindowFunctionCallContext');
}
function inferNotNullRuntimeFunctionCall(simpleExprRuntimeFunction, dbSchema, fromColumns) {
    var _a, _b;
    const functionCall = simpleExprRuntimeFunction.runtimeFunctionCall();
    if (functionCall.NOW_SYMBOL() || functionCall.CURDATE_SYMBOL() || functionCall.CURTIME_SYMBOL()) {
        return true;
    }
    if (functionCall.MOD_SYMBOL()) {
        return false; //MOD(N,0) returns NULL.
    }
    if (functionCall.REPLACE_SYMBOL()) {
        const exprList = functionCall.expr_list();
        return exprList.every((expr) => inferNotNullExpr(expr, dbSchema, fromColumns));
    }
    const trimFunction = functionCall.trimFunction();
    if (trimFunction) {
        const exprList = trimFunction.expr_list();
        return exprList.every((expr) => inferNotNullExpr(expr, dbSchema, fromColumns));
    }
    const substringFunction = functionCall.substringFunction();
    if (substringFunction) {
        const exprList = substringFunction.expr_list();
        return exprList.every((expr) => inferNotNullExpr(expr, dbSchema, fromColumns));
    }
    if (functionCall.YEAR_SYMBOL() ||
        functionCall.MONTH_SYMBOL() ||
        functionCall.DAY_SYMBOL() ||
        functionCall.HOUR_SYMBOL() ||
        functionCall.MINUTE_SYMBOL() ||
        functionCall.SECOND_SYMBOL()) {
        const expr = (_a = functionCall.exprWithParentheses()) === null || _a === void 0 ? void 0 : _a.expr();
        return inferNotNullExpr(expr, dbSchema, fromColumns);
    }
    if (functionCall.ADDDATE_SYMBOL() || functionCall.SUBDATE_SYMBOL() || functionCall.DATE_ADD_SYMBOL() || functionCall.DATE_SUB_SYMBOL()) {
        const exprList = functionCall.expr_list();
        return exprList.every((expr) => inferNotNullExpr(expr, dbSchema, fromColumns));
    }
    if (functionCall.COALESCE_SYMBOL()) {
        const exprList = (_b = functionCall.exprListWithParentheses()) === null || _b === void 0 ? void 0 : _b.exprList().expr_list();
        //COALEST: Return the first non-null value in a list
        return exprList.some((expr) => inferNotNullExpr(expr, dbSchema, fromColumns));
    }
    if (functionCall.IF_SYMBOL()) {
        const exprList = functionCall.expr_list();
        return exprList.every((expr) => inferNotNullExpr(expr, dbSchema, fromColumns));
    }
    throw Error(`Function not supported: ${functionCall.getText()}`);
}
function inferNotNullFunctionCall(functionCall, dbSchema, fromColumns) {
    var _a, _b, _c, _d;
    const functionName = ((_a = functionCall.pureIdentifier()) === null || _a === void 0 ? void 0 : _a.getText().toLowerCase()) || ((_b = functionCall.qualifiedIdentifier()) === null || _b === void 0 ? void 0 : _b.getText().toLowerCase());
    const udfExprList = (_c = functionCall.udfExprList()) === null || _c === void 0 ? void 0 : _c.udfExpr_list();
    if (functionName === 'ifnull') {
        if (udfExprList) {
            const [expr1, expr2] = udfExprList;
            const notNull = inferNotNullExpr(expr1.expr(), dbSchema, fromColumns) || inferNotNullExpr(expr2.expr(), dbSchema, fromColumns);
            return notNull;
        }
        return false;
    }
    if (functionName === 'nullif') {
        return false;
    }
    if (functionName === 'avg') {
        return false;
    }
    if (functionName === 'str_to_date') {
        return false; //invalid date
    }
    if (udfExprList) {
        return udfExprList
            .filter((expr, paramIndex) => {
            return functionName === 'timestampdiff' ? paramIndex !== 0 : true; //filter the first parameter of timestampdiff function
        })
            .every((udfExpr) => {
            const expr = udfExpr.expr();
            return inferNotNullExpr(expr, dbSchema, fromColumns);
        });
    }
    const exprList = (_d = functionCall.exprList()) === null || _d === void 0 ? void 0 : _d.expr_list();
    if (exprList) {
        return exprList.every((expr) => {
            return inferNotNullExpr(expr, dbSchema, fromColumns);
        });
    }
    return true;
}
function possibleNullWhere(field, whereClause) {
    const expr = whereClause.expr();
    return possibleNull(field, expr);
}
function possibleNull(field, exprContext) {
    if (exprContext instanceof MySQLParser_1.ExprIsContext) {
        const boolPri = exprContext.boolPri();
        if (boolPri instanceof MySQLParser_1.PrimaryExprPredicateContext) {
            const res = boolPri.predicate().bitExpr(0).simpleExpr();
            if (res instanceof MySQLParser_1.SimpleExprListContext) {
                const expr = res.exprList().expr(0);
                return possibleNull(field, expr);
            }
            if (res instanceof MySQLParser_1.SimpleExprSubQueryContext) {
                //exists, not exists
                return true; //possibleNull
            }
        }
        if (boolPri instanceof MySQLParser_1.PrimaryExprIsNullContext) {
            const compare = boolPri.boolPri();
            if (boolPri.notRule() && areEquals(field, compare.getText())) {
                return false; //possibleNull
            }
        }
        if (boolPri instanceof MySQLParser_1.PrimaryExprCompareContext) {
            const compare = boolPri.boolPri().getText(); //value > 10;
            const compare2 = boolPri.predicate().getText(); //10 < value
            //TODO - more complex expressions. ex. (value + value2) > 10;
            if (areEquals(field, compare) || areEquals(field, compare2)) {
                return false; //possibleNull
            }
        }
        return true; //possibleNull
    }
    if (exprContext instanceof MySQLParser_1.ExprNotContext) {
        const expr = exprContext.expr();
        return possibleNull(field, expr);
    }
    if (exprContext instanceof MySQLParser_1.ExprAndContext) {
        const [first, ...rest] = exprContext.expr_list();
        let possibleNullVar = possibleNull(field, first);
        for (const expr of rest) {
            possibleNullVar = possibleNullVar && possibleNull(field, expr);
        }
        return possibleNullVar;
    }
    if (exprContext instanceof MySQLParser_1.ExprXorContext) {
        const expressions = exprContext.expr_list();
    }
    if (exprContext instanceof MySQLParser_1.ExprOrContext) {
        const [first, ...rest] = exprContext.expr_list();
        let possibleNullVar = possibleNull(field, first);
        for (const expr of rest) {
            possibleNullVar = possibleNullVar || possibleNull(field, expr);
        }
        return possibleNullVar;
    }
    throw Error(`Unknow type:${exprContext.constructor.name}`);
}
function areEquals(field, expressionField) {
    const compare = (0, select_columns_1.splitName)(expressionField); //t1.name
    /*
    t1.name == t1.name
    t1.name == name
    name    == t1.name
    */
    return field.name === compare.name && (field.prefix === compare.prefix || field.prefix === '' || compare.prefix === '');
}
//# sourceMappingURL=infer-column-nullability.js.map