"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferParamNullabilityQuery = inferParamNullabilityQuery;
exports.inferParamNullabilityQueryExpression = inferParamNullabilityQueryExpression;
exports.inferParamNullability = inferParamNullability;
exports.inferParameterNotNull = inferParameterNotNull;
exports.getParentContext = getParentContext;
const MySQLParser_1 = require("@wsporto/typesql-parser/mysql/MySQLParser");
const typesql_parser_1 = require("@wsporto/typesql-parser");
const parse_1 = require("./parse");
function inferParamNullabilityQuery(queryContext) {
    const queriesSpecification = (0, parse_1.getAllQuerySpecificationsFromSelectStatement)(queryContext);
    const parameters = queriesSpecification.flatMap((querySpec) => getAllParameters(querySpec));
    return parameters.map((param) => inferParameterNotNull(param));
}
function inferParamNullabilityQueryExpression(queryExpression) {
    const parameters = getAllParameters(queryExpression);
    return parameters.map((param) => inferParameterNotNull(param));
}
function inferParamNullability(exprContext) {
    const parameters = getAllParameters(exprContext);
    return parameters.map((param) => inferParameterNotNull(param));
}
function inferParameterNotNull(param) {
    return inferParameterNotNullRule(param);
}
function inferParameterNotNullRule(rule) {
    var _a, _b;
    const isNullContext = getParentContext(rule, MySQLParser_1.PrimaryExprIsNullContext);
    if (isNullContext) {
        if (isNullContext.notRule()) {
            return true;
        }
        return false;
    }
    const nullIfFunction = getParentContext(rule, MySQLParser_1.FunctionCallContext);
    const functionIdentifier = (_a = nullIfFunction === null || nullIfFunction === void 0 ? void 0 : nullIfFunction.pureIdentifier()) === null || _a === void 0 ? void 0 : _a.getText().toLowerCase();
    if (functionIdentifier === 'nullif') {
        const expressionList = (_b = nullIfFunction.udfExprList()) === null || _b === void 0 ? void 0 : _b.udfExpr_list();
        if (expressionList && expressionList.length === 2) {
            const firstArg = expressionList[0];
            const secondArg = expressionList[1];
            if (firstArg.getText() === '?' && secondArg.getText().toLowerCase() === 'null') {
                return false;
            }
        }
        return true;
    }
    if (functionIdentifier === 'ifnull') {
        return false;
    }
    const parent = rule.parentCtx;
    if (parent) {
        return inferParameterNotNullRule(parent);
    }
    return true;
}
function getAllParameters(tree) {
    const result = [];
    collectSimpleExprParamMarker(tree, result);
    return result;
}
function collectSimpleExprParamMarker(tree, result) {
    for (let i = 0; i < tree.getChildCount(); i++) {
        const child = tree.getChild(i);
        if (child instanceof MySQLParser_1.SimpleExprParamMarkerContext) {
            result.push(child);
        }
        else if (child instanceof typesql_parser_1.ParserRuleContext) {
            collectSimpleExprParamMarker(child, result);
        }
    }
}
function getParentContext(ctx, parentContext) {
    if (ctx instanceof parentContext) {
        return ctx;
    }
    if (ctx) {
        return getParentContext(ctx.parentCtx, parentContext);
    }
    return undefined;
}
//# sourceMappingURL=infer-param-nullability.js.map