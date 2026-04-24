"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluatesTrueIfNull = evaluatesTrueIfNull;
const PostgreSQLParser_1 = require("@wsporto/typesql-parser/postgres/PostgreSQLParser");
const select_columns_1 = require("../mysql-query-analyzer/select-columns");
const typesql_parser_1 = require("@wsporto/typesql-parser");
function getSingleColumnRefOrNull(elseExpr) {
    var _a;
    if (((_a = elseExpr.children) === null || _a === void 0 ? void 0 : _a.length) != 1) {
        return null;
    }
    const child = elseExpr.children[0];
    if (child instanceof PostgreSQLParser_1.ColumnrefContext) {
        return child;
    }
    if (child instanceof typesql_parser_1.ParserRuleContext) { //composite
        return getSingleColumnRefOrNull(child);
    }
    return null;
}
function evaluatesTrueIfNull(elseExpr, a_expr) {
    // Can only infer if the elseExpr is a single column;
    const columnRef = getSingleColumnRefOrNull(elseExpr.a_expr());
    if (!columnRef) {
        return false;
    }
    const a_expr_qual = a_expr.a_expr_qual();
    if (a_expr_qual) {
        return evaluatesTrueIfNull_a_expr_qual(a_expr_qual, (0, select_columns_1.splitName)(columnRef.getText()));
    }
    return false;
}
function evaluatesTrueIfNull_a_expr_qual(a_expr_qual, field) {
    const a_expr_lessless = a_expr_qual.a_expr_lessless();
    if (a_expr_lessless) {
        return evaluatesTrueIfNull_a_expr_lessless(a_expr_lessless, field);
    }
    return false;
}
function evaluatesTrueIfNull_a_expr_lessless(a_expr_lessless, field) {
    const a_expr_or = a_expr_lessless.a_expr_or_list()[0];
    if (a_expr_or) {
        return evaluatesTrueIfNull_a_expr_or(a_expr_or, field);
    }
    return false;
}
//a_expr_or: "valueisnotnulland(id>0orvalueisnotnull)"
//a_expr_or: "valueisnotnullor(id>0orvalueisnotnull)"
function evaluatesTrueIfNull_a_expr_or(a_expr_or, field) {
    const a_expr_and = a_expr_or.a_expr_and_list();
    if (a_expr_and) {
        //1. valueisnotnull
        //2. (id>0orvalueisnotnull)
        const result = a_expr_and.some(a_expr_and => evaluatesTrueIfNull_a_expr_and(a_expr_and, field));
        return result;
    }
    return false;
}
function evaluatesTrueIfNull_a_expr_and(a_expr_and, field) {
    const a_expr_between_list = a_expr_and.a_expr_between_list();
    if (a_expr_between_list) {
        return a_expr_between_list.every(a_expr_between => evaluatesTrueIfNull_a_expr_between(a_expr_between, field));
    }
    return false;
}
function evaluatesTrueIfNull_a_expr_between(a_expr_between, field) {
    const a_expr_in = a_expr_between.a_expr_in_list()[0];
    if (a_expr_in) {
        return evaluatesTrueIfNull_a_expr_in(a_expr_in, field);
    }
    return false;
}
function evaluatesTrueIfNull_a_expr_in(a_expr_in, field) {
    const a_expr_unary_not = a_expr_in.a_expr_unary_not();
    if (a_expr_unary_not) {
        return evaluatesTrueIfNull_a_expr_unary_not(a_expr_unary_not, field);
    }
    return false;
}
function evaluatesTrueIfNull_a_expr_unary_not(a_expr_unary_not, field) {
    const a_expr_isnull = a_expr_unary_not.a_expr_isnull();
    if (a_expr_isnull) {
        return evaluatesTrueIfNull_a_expr_isnull(a_expr_isnull, field);
    }
    return false;
}
function evaluatesTrueIfNull_a_expr_isnull(a_expr_isnull, field) {
    const a_expr_is_not = a_expr_isnull.a_expr_is_not();
    if (a_expr_is_not) {
        const a_expr_compare = a_expr_is_not.a_expr_compare();
        if (!a_expr_compare) {
            return false;
        }
        const columnRef = getSingleColumnRefOrNull(a_expr_compare);
        if (!columnRef) {
            return false;
        }
        const fieldName = (0, select_columns_1.splitName)(columnRef.getText());
        if (fieldName.name === field.name && (field.prefix === fieldName.prefix || fieldName.prefix === '' || field.prefix === '')
            && a_expr_is_not.IS() && a_expr_is_not.NULL_P()) {
            if (a_expr_is_not.NOT()) {
                return false;
            }
            return true;
        }
        return false;
    }
    return false;
}
//# sourceMappingURL=case-nullability-checker.js.map