"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumParser = enumParser;
const sqlite_1 = require("@wsporto/typesql-parser/sqlite");
function enumParser(createStmts) {
    var _a;
    const result = (0, sqlite_1.parseSql)(createStmts);
    const enumMap = {};
    (_a = result.sql_stmt_list().children) === null || _a === void 0 ? void 0 : _a.forEach(stmt => {
        if (stmt instanceof sqlite_1.Sql_stmtContext) {
            const create_table_stmt = stmt.create_table_stmt();
            if (create_table_stmt) {
                collect_enum_create_table_stmt(create_table_stmt, enumMap);
            }
        }
    });
    return enumMap;
}
function collect_enum_create_table_stmt(create_table_stmt, enumMap) {
    const table_name = create_table_stmt.table_name().getText();
    const enumColumnMap = {};
    create_table_stmt.column_def_list().forEach(column_def => {
        const column_name = column_def.column_name().getText();
        const enum_column = enum_column_def(column_def);
        if (enum_column) {
            enumColumnMap[column_name] = enum_column;
        }
    });
    enumMap[table_name] = enumColumnMap;
}
function enum_column_def(column_def) {
    for (const column_constraint of column_def.column_constraint_list()) {
        if (column_constraint.CHECK_() && column_constraint.expr()) {
            return enum_column(column_constraint.expr());
        }
    }
    return null;
}
function enum_column(expr) {
    if (expr.IN_()) {
        // expr IN expr
        const expr_list = expr.expr_list()[1].expr_list();
        if (expr_list.length > 0) {
            const isEnum = expr_list.every(inExpr => isStringLiteral(inExpr));
            if (isEnum) {
                return `ENUM(${expr_list.map(exprValue => exprValue.literal_value().getText()).join(',')})`;
            }
        }
        return null;
    }
    return null;
}
function isStringLiteral(expr) {
    const literal_value = expr.literal_value();
    if (literal_value) {
        const string_literal = literal_value.STRING_LITERAL();
        if (string_literal) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=enum-parser.js.map