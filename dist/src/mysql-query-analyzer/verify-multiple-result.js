"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMultipleResult = verifyMultipleResult;
const MySQLParser_1 = require("@wsporto/typesql-parser/mysql/MySQLParser");
const select_columns_1 = require("./select-columns");
function verifyMultipleResult(exprContext, fromColumns) {
    if (exprContext instanceof MySQLParser_1.ExprIsContext) {
        const boolPri = exprContext.boolPri();
        if (boolPri instanceof MySQLParser_1.PrimaryExprCompareContext) {
            if (boolPri.compOp().EQUAL_OPERATOR()) {
                const compareLeft = boolPri.boolPri();
                const compareRight = boolPri.predicate();
                if (isUniqueKeyComparation(compareLeft, fromColumns) || isUniqueKeyComparation(compareRight, fromColumns)) {
                    return false; //multipleRow = false
                }
            }
            return true; //multipleRow = true
        }
        return true; //multipleRow
    }
    if (exprContext instanceof MySQLParser_1.ExprNotContext) {
        return true;
    }
    if (exprContext instanceof MySQLParser_1.ExprAndContext) {
        const oneIsSingleResult = exprContext.expr_list().some((expr) => verifyMultipleResult(expr, fromColumns) === false);
        return oneIsSingleResult === false;
    }
    // if (exprContext instanceof ExprXorContext) {
    //     const expressions = exprContext.expr();
    // }
    if (exprContext instanceof MySQLParser_1.ExprOrContext) {
        return true; //multipleRow = true
    }
    throw Error(`Unknow type:${exprContext.constructor.name}`);
}
function isUniqueKeyComparation(compare, fromColumns) {
    const tokens = (0, select_columns_1.getSimpleExpressions)(compare);
    if (tokens.length === 1 && tokens[0] instanceof MySQLParser_1.SimpleExprColumnRefContext) {
        const fieldName = (0, select_columns_1.splitName)(tokens[0].getText());
        const col = (0, select_columns_1.findColumn)(fieldName, fromColumns);
        if (col.columnKey === 'PRI' || col.columnKey === 'UNI') {
            //TODO - UNIQUE
            return true; //isUniqueKeyComparation = true
        }
    }
    return false; //isUniqueKeyComparation = false
}
//# sourceMappingURL=verify-multiple-result.js.map