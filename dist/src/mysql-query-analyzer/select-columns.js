"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionAlias = void 0;
exports.includeColumn = includeColumn;
exports.filterColumns = filterColumns;
exports.selectAllColumns = selectAllColumns;
exports.getColumnName = getColumnName;
exports.extractFieldsFromUsingClause = extractFieldsFromUsingClause;
exports.splitName = splitName;
exports.splitTableName = splitTableName;
exports.findColumnSchema = findColumnSchema;
exports.findColumn = findColumn;
exports.findColumnOrNull = findColumnOrNull;
exports.extractOriginalSql = extractOriginalSql;
exports.getExpressions = getExpressions;
exports.getTopLevelAndExpr = getTopLevelAndExpr;
exports.getSimpleExpressions = getSimpleExpressions;
const typesql_parser_1 = require("@wsporto/typesql-parser");
const MySQLParser_1 = require("@wsporto/typesql-parser/mysql/MySQLParser");
const collect_constraints_1 = require("./collect-constraints");
const sqlite_1 = require("@wsporto/typesql-parser/sqlite");
function includeColumn(column, table) {
    var _a;
    return column.table.toLowerCase() === table.toLowerCase() || ((_a = column.tableAlias) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === table.toLowerCase();
}
function filterColumns(dbSchema, withSchema, tableAlias, table) {
    var _a;
    const schemaName = table.prefix === '' ? (_a = dbSchema.find((col) => col.table === table.name)) === null || _a === void 0 ? void 0 : _a.schema : table.prefix; //find first
    const tableColumns1 = dbSchema
        .filter((schema) => schema.table.toLowerCase() === table.name.toLowerCase() && schema.schema === schemaName)
        .map((tableColumn) => {
        //name and colum are the same on the leaf table
        const r = {
            columnName: tableColumn.column,
            columnType: (0, collect_constraints_1.createColumnTypeFomColumnSchema)(tableColumn),
            notNull: tableColumn.notNull,
            table: table.name,
            tableAlias: tableAlias || '',
            columnKey: tableColumn.columnKey,
            hidden: tableColumn.hidden
        };
        return r;
    });
    const result = tableColumns1.concat(withSchema.filter((schema) => schema.table.toLowerCase() === table.name.toLowerCase())).map((col) => {
        const r = Object.assign(Object.assign({}, col), { table: table.name, tableAlias: tableAlias, intrinsicNotNull: col.notNull });
        return r;
    });
    return result;
}
function selectAllColumns(tablePrefix, fromColumns) {
    const allColumns = []; //TODO - FILTER
    fromColumns.forEach((column) => {
        if (tablePrefix === '' || tablePrefix === column.tableAlias || tablePrefix === column.table) {
            allColumns.push(column);
        }
    });
    return allColumns;
}
const stripQuotes = (text) => text.slice(1, -1);
function getColumnName(selectItem) {
    var _a, _b;
    const identifier = (_a = selectItem.selectAlias()) === null || _a === void 0 ? void 0 : _a.identifier();
    if (identifier) {
        const pureIdentifier = identifier.pureIdentifier();
        if ((pureIdentifier === null || pureIdentifier === void 0 ? void 0 : pureIdentifier.BACK_TICK_QUOTED_ID()) || (pureIdentifier === null || pureIdentifier === void 0 ? void 0 : pureIdentifier.DOUBLE_QUOTED_TEXT())) {
            return stripQuotes(pureIdentifier.getText()); //id as `customQuotedName`
        }
        return identifier.getText();
    }
    const textStringLiteral = (_b = selectItem.selectAlias()) === null || _b === void 0 ? void 0 : _b.textStringLiteral();
    //id as "customQuotedName" or id as 'customQuotedName'
    if ((textStringLiteral === null || textStringLiteral === void 0 ? void 0 : textStringLiteral.DOUBLE_QUOTED_TEXT()) || (textStringLiteral === null || textStringLiteral === void 0 ? void 0 : textStringLiteral.SINGLE_QUOTED_TEXT())) {
        return stripQuotes(textStringLiteral.getText());
    }
    const tokens = getSimpleExpressions(selectItem);
    const columnName = extractOriginalSql(selectItem.expr()); //TODO VERIFICAR NULL
    if (tokens.length === 1 && tokens[0] instanceof MySQLParser_1.SimpleExprColumnRefContext) {
        return splitName(tokens[0].getText()).name;
    }
    return columnName;
}
function extractFieldsFromUsingClause(joinedTableContext) {
    var _a;
    const usingFieldsClause = (_a = joinedTableContext.identifierListWithParentheses()) === null || _a === void 0 ? void 0 : _a.identifierList();
    if (usingFieldsClause) {
        return usingFieldsClause
            .getText()
            .split(',')
            .map((field) => field.trim());
    }
    return [];
}
function splitName(fieldName) {
    const fieldNameSplit = fieldName.split('.');
    const result = {
        name: fieldNameSplit.length === 2 ? fieldNameSplit[1] : fieldNameSplit[0],
        prefix: fieldNameSplit.length === 2 ? fieldNameSplit[0] : ''
    };
    const withoutStick = {
        name: removeBackStick(result.name),
        prefix: result.prefix
    };
    return withoutStick;
}
function splitTableName(fieldName) {
    const tableNameSplit = fieldName.split('.');
    const result = {
        name: tableNameSplit.length === 2 ? tableNameSplit[1] : '*', //p.*
        prefix: tableNameSplit[0]
    };
    const withoutStick = {
        name: removeBackStick(result.name),
        prefix: result.prefix
    };
    return withoutStick;
}
function removeBackStick(name) {
    const withoutBackStick = name.startsWith('`') && name.endsWith('`') ? name.slice(1, -1) : name;
    return withoutBackStick;
}
exports.functionAlias = [
    {
        column: 'CURRENT_DATE',
        column_type: 'date',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'CURRENT_TIME',
        column_type: 'time',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'CURRENT_TIMESTAMP',
        column_type: 'timestamp',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'LOCALTIME',
        column_type: 'datetime',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'LOCALTIMESTAMP',
        column_type: 'datetime',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'MICROSECOND',
        column_type: 'bigint',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'SECOND',
        column_type: 'bigint',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'MINUTE',
        column_type: 'bigint',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'HOUR',
        column_type: 'bigint',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'DAY',
        column_type: 'bigint',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'WEEK',
        column_type: 'bigint',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'MONTH',
        column_type: 'bigint',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'QUARTER',
        column_type: 'bigint',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    },
    {
        column: 'YEAR',
        column_type: 'year',
        columnKey: '',
        notNull: true,
        schema: '',
        table: '',
        hidden: 0
    }
];
function findColumnSchema(tableName, columnName, dbSchema) {
    const found = dbSchema.find((col) => col.table.toLowerCase() === tableName.toLowerCase() && col.column.toLowerCase() === columnName.toLowerCase());
    return found;
}
function findColumn(fieldName, columns) {
    const found = findColumnOrNull(fieldName, columns);
    if (!found) {
        throw Error(`no such column: ${formatField(fieldName)}`);
    }
    return found;
}
function formatField(fieldName) {
    return fieldName.prefix === '' ? fieldName.name : `${fieldName.prefix}.${fieldName.name}`;
}
function findColumnOrNull(fieldName, columns) {
    const found = columns.find((col) => col.columnName.toLowerCase() === fieldName.name.toLowerCase() &&
        (fieldName.prefix === '' || fieldName.prefix === col.tableAlias || fieldName.prefix === col.table));
    if (found) {
        return found;
    }
    const functionType = exports.functionAlias.find((col) => col.column.toLowerCase() === fieldName.name.toLowerCase());
    if (functionType) {
        const colDef = {
            columnName: functionType.column,
            columnType: (0, collect_constraints_1.createColumnTypeFomColumnSchema)(functionType),
            columnKey: functionType.columnKey,
            notNull: functionType.notNull,
            table: '',
            hidden: 0
        };
        return colDef;
    }
    return found;
}
function extractOriginalSql(rule) {
    var _a, _b;
    const startIndex = rule.start.start;
    const stopIndex = ((_a = rule.stop) === null || _a === void 0 ? void 0 : _a.stop) || startIndex;
    const result = (_b = rule.start.getInputStream()) === null || _b === void 0 ? void 0 : _b.getText(startIndex, stopIndex);
    return result;
}
function getExpressions(ctx, exprType) {
    const tokens = [];
    collectExpr(tokens, ctx, exprType);
    return tokens;
}
function collectExpr(tokens, parent, exprType, isSubQuery = false) {
    if (parent instanceof exprType) {
        tokens.push({
            expr: parent,
            isSubQuery
        });
    }
    for (let i = 0; i < parent.getChildCount(); i++) {
        const child = parent.getChild(i);
        if (child instanceof typesql_parser_1.ParserRuleContext) {
            collectExpr(tokens, child, exprType, isSubQuery || child instanceof MySQLParser_1.SimpleExprSubQueryContext || child instanceof sqlite_1.Select_coreContext);
        }
    }
}
function getTopLevelAndExpr(expr, all) {
    if (expr instanceof MySQLParser_1.ExprAndContext || expr instanceof MySQLParser_1.ExprXorContext || expr instanceof MySQLParser_1.ExprOrContext) {
        const exprLeft = expr.expr(0);
        getTopLevelAndExpr(exprLeft, all);
        const exprRight = expr.expr(1);
        all.push({
            operator: 'AND',
            expr: exprRight
        });
    }
    else {
        all.push({
            operator: 'AND',
            expr
        });
    }
}
function getSimpleExpressions(ctx) {
    const tokens = [];
    collectSimpleExpr(tokens, ctx);
    return tokens;
}
function collectSimpleExpr(tokens, parent) {
    if (isSimpleExpression(parent)) {
        tokens.push(parent);
    }
    for (let i = 0; i < parent.getChildCount(); i++) {
        const child = parent.getChild(i);
        if (child instanceof typesql_parser_1.ParserRuleContext) {
            collectSimpleExpr(tokens, child);
        }
    }
}
function isSimpleExpression(ctx) {
    return (ctx instanceof MySQLParser_1.SimpleExprVariableContext ||
        ctx instanceof MySQLParser_1.SimpleExprColumnRefContext ||
        ctx instanceof MySQLParser_1.SimpleExprRuntimeFunctionContext ||
        ctx instanceof MySQLParser_1.SimpleExprFunctionContext ||
        ctx instanceof MySQLParser_1.SimpleExprCollateContext ||
        ctx instanceof MySQLParser_1.SimpleExprLiteralContext ||
        ctx instanceof MySQLParser_1.SimpleExprParamMarkerContext ||
        ctx instanceof MySQLParser_1.SimpleExprSumContext ||
        ctx instanceof MySQLParser_1.SimpleExprGroupingOperationContext ||
        ctx instanceof MySQLParser_1.SimpleExprWindowingFunctionContext ||
        ctx instanceof MySQLParser_1.SimpleExprConcatContext ||
        ctx instanceof MySQLParser_1.SimpleExprUnaryContext ||
        ctx instanceof MySQLParser_1.SimpleExprNotContext ||
        ctx instanceof MySQLParser_1.SimpleExprListContext ||
        ctx instanceof MySQLParser_1.SimpleExprSubQueryContext ||
        ctx instanceof MySQLParser_1.SimpleExprOdbcContext ||
        ctx instanceof MySQLParser_1.SimpleExprMatchContext ||
        ctx instanceof MySQLParser_1.SimpleExprBinaryContext ||
        ctx instanceof MySQLParser_1.SimpleExprCastContext ||
        ctx instanceof MySQLParser_1.SimpleExprCaseContext ||
        ctx instanceof MySQLParser_1.SimpleExprConvertContext ||
        ctx instanceof MySQLParser_1.SimpleExprConvertUsingContext ||
        ctx instanceof MySQLParser_1.SimpleExprDefaultContext ||
        ctx instanceof MySQLParser_1.SimpleExprValuesContext ||
        ctx instanceof MySQLParser_1.SimpleExprIntervalContext);
}
//# sourceMappingURL=select-columns.js.map