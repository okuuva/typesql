"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryTraverse_Sql_stmtContext = tryTraverse_Sql_stmtContext;
exports.isNotNull = isNotNull;
exports.isMultipleRowResult = isMultipleRowResult;
const sqlite_1 = require("@wsporto/typesql-parser/sqlite");
const select_columns_1 = require("../mysql-query-analyzer/select-columns");
const collect_constraints_1 = require("../mysql-query-analyzer/collect-constraints");
const traverse_1 = require("../mysql-query-analyzer/traverse");
const Either_1 = require("fp-ts/lib/Either");
function traverse_Sql_stmtContext(sql_stmt, traverseContext) {
    const select_stmt = sql_stmt.select_stmt();
    if (select_stmt) {
        const selectResult = traverse_select_stmt(select_stmt, traverseContext);
        return selectResult;
    }
    const insert_stmt = sql_stmt.insert_stmt();
    if (insert_stmt) {
        const insertResult = traverse_insert_stmt(insert_stmt, traverseContext);
        return insertResult;
    }
    const update_stmt = sql_stmt.update_stmt();
    if (update_stmt) {
        const updateResult = traverse_update_stmt(update_stmt, traverseContext);
        return updateResult;
    }
    const delete_stmt = sql_stmt.delete_stmt();
    if (delete_stmt) {
        const deleteResult = traverse_delete_stmt(delete_stmt, traverseContext);
        return deleteResult;
    }
    throw Error('traverse_Sql_stmtContext');
}
function tryTraverse_Sql_stmtContext(sql_stmt, traverseContext) {
    try {
        const traverseResult = traverse_Sql_stmtContext(sql_stmt, traverseContext);
        return (0, Either_1.right)(traverseResult);
    }
    catch (err) {
        const error = err;
        return (0, Either_1.left)({
            name: 'parser error',
            description: error.message
        });
    }
}
function traverse_select_stmt(select_stmt, traverseContext, subQuery = false, recursive = false, recursiveNames = [], withTable) {
    const common_table_stmt = select_stmt.common_table_stmt();
    if (common_table_stmt) {
        const recursive = common_table_stmt.RECURSIVE_() != null;
        const common_table_expression = common_table_stmt.common_table_expression_list();
        common_table_expression.forEach((common_table_expression) => {
            const table_name = common_table_expression.table_name();
            const recursiveNames = common_table_expression.column_name_list().map((column_name) => column_name.getText());
            const paramsBefore = traverseContext.parameters.length;
            const select_stmt = common_table_expression.select_stmt();
            traverse_select_stmt(select_stmt, Object.assign(Object.assign({}, traverseContext), { subQuery: true }), subQuery, recursive, recursiveNames, table_name.getText());
            const parameters = traverseContext.parameters.slice(paramsBefore).map((_, index) => paramsBefore + index);
            traverseContext.dynamicSqlInfo2.with.push({
                fragment: extractOriginalSql(common_table_expression),
                relationName: table_name.getText(),
                parameters: parameters
            });
        });
    }
    const [mainSelect, ...unionSelect] = select_stmt.select_core_list();
    const mainQueryResult = traverse_select_core(mainSelect, traverseContext, subQuery, recursive, recursiveNames);
    if (withTable) {
        for (const [index, col] of mainQueryResult.columns.entries()) {
            const colDef = mapTypeAndNullInferToColumnDef(col, recursiveNames[index], withTable);
            traverseContext.withSchema.push(colDef);
        }
    }
    unionSelect.forEach((select_core) => {
        const unionResult = traverse_select_core(select_core, traverseContext, subQuery, recursive);
        unionResult.columns.forEach((col, colIndex) => {
            mainQueryResult.columns[colIndex].table = '';
            traverseContext.constraints.push({
                expression: 'UNION',
                type1: mainQueryResult.columns[colIndex].type,
                type2: col.type
            });
        });
    });
    const sortedParameters = traverseContext.parameters.sort((param1, param2) => param1.paramIndex - param2.paramIndex);
    const selectResult = {
        queryType: 'Select',
        parameters: sortedParameters,
        columns: mainQueryResult.columns,
        multipleRowsResult: isMultipleRowResult(select_stmt, traverseContext.dbSchema, mainQueryResult.fromColumns),
        relations: traverseContext.relations,
        dynamicQueryInfo: traverseContext.dynamicSqlInfo2,
        constraints: traverseContext.constraints
    };
    const order_by_stmt = select_stmt.order_by_stmt();
    let hasOrderByParameter = false;
    if (order_by_stmt) {
        const selectColumns = mainQueryResult.columns.map((col, index) => mapTypeAndNullInferToColumnDef(col, recursiveNames[index]));
        const ordering_term_list = order_by_stmt.ordering_term_list();
        ordering_term_list.forEach((ordering_term) => {
            const expr = ordering_term.expr();
            if (expr.getText() === '?') {
                hasOrderByParameter = true;
            }
            else {
                traverse_expr(expr, Object.assign(Object.assign({}, traverseContext), { fromColumns: mainQueryResult.fromColumns.concat(selectColumns) }));
            }
        });
        if (hasOrderByParameter) {
            const orderByColumns = (0, traverse_1.getOrderByColumns)(mainQueryResult.fromColumns, mainQueryResult.columns);
            selectResult.orderByColumns = orderByColumns;
        }
    }
    const limit = select_stmt.limit_stmt();
    if (limit) {
        traverseContext.dynamicSqlInfo2.limitOffset = {
            fragment: extractOriginalSql(limit),
            parameters: []
        };
        const expr_list = limit.expr_list();
        const expr1 = expr_list[0];
        const paramsBefore = traverseContext.parameters.length;
        const exrp1Type = traverse_expr(expr1, traverseContext);
        exrp1Type.notNull = true;
        traverseContext.constraints.push({
            expression: expr1.getText(),
            type1: exrp1Type.type,
            type2: (0, collect_constraints_1.freshVar)('INTEGER', 'INTEGER')
        });
        if (expr_list.length === 2) {
            const expr2 = expr_list[1];
            const exrp2Type = traverse_expr(expr2, traverseContext);
            exrp2Type.notNull = true;
            traverseContext.constraints.push({
                expression: expr2.getText(),
                type1: exrp2Type.type,
                type2: (0, collect_constraints_1.freshVar)('INTEGER', 'INTEGER')
            });
        }
        traverseContext.parameters.slice(paramsBefore).forEach((_, index) => {
            var _a;
            (_a = traverseContext.dynamicSqlInfo2.limitOffset) === null || _a === void 0 ? void 0 : _a.parameters.push(paramsBefore + index);
        });
    }
    return selectResult;
}
function mapTypeAndNullInferToColumnDef(col, name, tableName) {
    return {
        columnName: name !== null && name !== void 0 ? name : col.name,
        columnType: col.type,
        notNull: col.notNull,
        columnKey: '',
        table: tableName !== null && tableName !== void 0 ? tableName : col.table,
        tableAlias: '',
        hidden: col.hidden || 0
    };
}
function traverse_select_core(select_core, traverseContext, subQuery = false, recursive = false, recursiveName) {
    const columnsResult = [];
    const listType = [];
    const table_or_subquery = select_core.table_or_subquery_list();
    if (table_or_subquery) {
        const fields = traverse_table_or_subquery(table_or_subquery, null, null, traverseContext);
        columnsResult.push(...fields);
    }
    const join_clause = select_core.join_clause();
    if (join_clause) {
        const join_table_or_subquery = join_clause.table_or_subquery_list();
        const join_constraint_list = join_clause.join_constraint_list();
        const join_operator_list = join_clause.join_operator_list();
        const fields = traverse_table_or_subquery(join_table_or_subquery, join_constraint_list, join_operator_list, traverseContext);
        columnsResult.push(...fields);
    }
    const result_column = select_core.result_column_list();
    const fromColumns = subQuery || recursive ? traverseContext.fromColumns.concat(columnsResult) : columnsResult;
    result_column.forEach((result_column) => {
        var _a, _b;
        if (result_column.STAR()) {
            const tableName = (_a = result_column.table_name()) === null || _a === void 0 ? void 0 : _a.getText();
            columnsResult.filter(col => col.hidden !== 1).forEach((col) => {
                const table = col.tableAlias || col.table;
                if (!tableName || (0, select_columns_1.includeColumn)(col, tableName)) {
                    listType.push({
                        name: col.columnName,
                        type: col.columnType,
                        notNull: col.notNull,
                        intrinsicNotNull: col.intrinsicNotNull,
                        table: table,
                        hidden: col.hidden
                    });
                    if (!traverseContext.subQuery) {
                        traverseContext.dynamicSqlInfo2.select.push({
                            fragment: `${table}.${col.columnName}`,
                            fragmentWitoutAlias: `${table}.${col.columnName}`,
                            dependOnRelations: [table],
                            parameters: []
                        });
                    }
                }
            });
        }
        const expr = result_column.expr();
        const aliasRaw = (_b = result_column.column_alias()) === null || _b === void 0 ? void 0 : _b.getText();
        const alias = aliasRaw && aliasRaw.startsWith('"') && aliasRaw.endsWith('"') ? aliasRaw.slice(1, -1) : aliasRaw;
        if (expr) {
            const exprType = traverse_expr(expr, Object.assign(Object.assign({}, traverseContext), { fromColumns: fromColumns }));
            if (alias) {
                traverseContext.relations
                    .filter((relation) => relation.joinColumn === exprType.name && (relation.name === exprType.table || relation.alias === exprType.table))
                    .forEach((relation) => {
                    relation.joinColumn = alias;
                });
            }
            if (exprType.type.kind === 'TypeVar') {
                if (alias) {
                    exprType.name = alias;
                }
                listType.push(exprType);
            }
            if (!traverseContext.subQuery) {
                const { relations, params } = extractRelationsAndParams(expr, fromColumns, traverseContext.parameters);
                traverseContext.dynamicSqlInfo2.select.push({
                    fragment: extractOriginalSql(result_column),
                    fragmentWitoutAlias: extractOriginalSql(expr),
                    dependOnRelations: [...new Set(relations)],
                    parameters: params
                });
            }
        }
    });
    const newColumns = listType.map((selectField) => {
        const col = {
            columnName: selectField.name,
            table: selectField.table,
            columnType: selectField.type,
            notNull: selectField.notNull,
            intrinsicNotNull: selectField.intrinsicNotNull,
            columnKey: '',
            hidden: selectField.hidden || 0
        };
        return col;
    });
    const whereExpr = select_core._whereExpr;
    if (whereExpr) {
        traverse_expr(whereExpr, Object.assign(Object.assign({}, traverseContext), { fromColumns: fromColumns.concat(newColumns) }));
        if (!traverseContext.subQuery) {
            const { relations, params } = extractRelationsAndParams(whereExpr, fromColumns.concat(newColumns), traverseContext.parameters);
            traverseContext.dynamicSqlInfo2.where.push({
                fragment: `${extractOriginalSql(whereExpr)}`,
                dependOnRelations: [...new Set(relations)], //remove duplicated
                parameters: params
            });
        }
    }
    const groupByExprList = select_core._groupByExpr || [];
    groupByExprList.forEach((groupByExpr) => {
        traverse_expr(groupByExpr, Object.assign(Object.assign({}, traverseContext), { fromColumns: newColumns.concat(fromColumns) }));
    });
    const havingExpr = select_core._havingExpr;
    if (havingExpr) {
        //select have precedence: newColumns.concat(fromColumns)
        traverse_expr(havingExpr, Object.assign(Object.assign({}, traverseContext), { fromColumns: newColumns.concat(fromColumns) }));
    }
    const querySpecification = {
        columns: listType.map((col) => {
            const columnName = { name: col.name, table: col.table };
            const column = Object.assign(Object.assign({}, col), { notNull: col.notNull || isNotNull(columnName, whereExpr) || isNotNull(columnName, havingExpr), intrinsicNotNull: col.intrinsicNotNull });
            return column;
        }),
        fromColumns: columnsResult //TODO - return isMultipleRowResult instead
    };
    return querySpecification;
}
function extractRelationsAndParams(expr, fromColumns, parameters) {
    const columnsRef = (0, select_columns_1.getExpressions)(expr, sqlite_1.Column_nameContext);
    const relations = columnsRef
        .filter((expr) => !expr.isSubQuery)
        .map((colRefExpr) => {
        const colRef = colRefExpr.expr;
        const expr = colRef.parentCtx;
        const tableName = expr.table_name();
        const column = traverse_column_name(colRef, tableName, fromColumns);
        return column.tableAlias || column.table;
    });
    const expressionList = (0, select_columns_1.getExpressions)(expr, sqlite_1.ExprContext);
    const paramsIds = expressionList
        .filter((expr) => expr.expr.BIND_PARAMETER() != null)
        .map((expr) => expr.expr.BIND_PARAMETER().symbol.start);
    const params = getParamsIndexes(parameters, paramsIds);
    return {
        relations,
        params
    };
}
function traverse_table_or_subquery(table_or_subquery_list, join_constraint_list, join_operator_list, traverseContext) {
    const allFields = [];
    table_or_subquery_list.forEach((table_or_subquery, index) => {
        var _a, _b, _c, _d, _e, _f;
        const numParamsBefore = traverseContext.parameters.length;
        const isLeftJoin = index > 0 && join_operator_list ? ((_a = join_operator_list[index - 1]) === null || _a === void 0 ? void 0 : _a.LEFT_()) != null : false;
        const table_function_name = table_or_subquery.table_function_name();
        const table_name = table_or_subquery.table_name() || table_function_name;
        const table_alias_temp = ((_b = table_or_subquery.table_alias()) === null || _b === void 0 ? void 0 : _b.getText()) || '';
        let tableOrSubqueryFields = [];
        const virtualTableMatch = /\('.*'\)/; //ex. FROM email('fts5')
        //grammar error: select * from table1 inner join table2....; inner is parsed as table_alias
        const table_alias = table_alias_temp.toLowerCase() === 'left' ||
            table_alias_temp.toLowerCase() === 'right' ||
            table_alias_temp.toLowerCase() === 'full' ||
            table_alias_temp.toLowerCase() === 'outer' ||
            table_alias_temp.toLowerCase() === 'inner' ||
            table_alias_temp.toLowerCase() === 'cross' ||
            table_alias_temp.match(virtualTableMatch)
            ? ''
            : table_alias_temp;
        const join_constraint = join_constraint_list && index > 0 ? join_constraint_list[index - 1] : undefined;
        const asAlias = table_or_subquery.AS_() || false;
        const tableAlias = (_c = table_or_subquery.table_alias()) === null || _c === void 0 ? void 0 : _c.getText();
        const tableOrSubqueryName = table_name ? table_name.any_name().getText() : '';
        const schema = ((_d = table_or_subquery.schema_name()) === null || _d === void 0 ? void 0 : _d.getText()) || '';
        if (table_name) {
            const tableName = getTableName(table_name, schema);
            tableOrSubqueryFields = (0, select_columns_1.filterColumns)(traverseContext.dbSchema, traverseContext.withSchema, table_alias, tableName);
            if (table_function_name) {
                const table_function_expr = table_or_subquery.expr(0);
                if (table_function_expr) {
                    const exprType = traverse_expr(table_function_expr, Object.assign(Object.assign({}, traverseContext), { fromColumns: allFields }));
                    if (exprType.name === '?' && ((_e = tableOrSubqueryFields[0]) === null || _e === void 0 ? void 0 : _e.columnKey) === 'VT') {
                        exprType.type.type = 'TEXT';
                        exprType.notNull = true;
                    }
                }
            }
            const usingFields = (join_constraint === null || join_constraint === void 0 ? void 0 : join_constraint.USING_()) ? join_constraint === null || join_constraint === void 0 ? void 0 : join_constraint.column_name_list().map((column_name) => column_name.getText()) : [];
            const filteredFields = usingFields.length > 0 ? filterUsingFields(tableOrSubqueryFields, usingFields) : tableOrSubqueryFields;
            if (isLeftJoin) {
                allFields.push(...filteredFields.map((field) => (Object.assign(Object.assign({}, field), { notNull: false, intrinsicNotNull: field.notNull }))));
            }
            else {
                allFields.push(...filteredFields);
            }
        }
        const select_stmt = table_or_subquery.select_stmt();
        if (select_stmt) {
            const subQueryResult = traverse_select_stmt(select_stmt, Object.assign(Object.assign({}, traverseContext), { subQuery: true }));
            tableOrSubqueryFields = subQueryResult.columns.map((t) => {
                const colDef = {
                    table: t.table ? tableAlias || '' : '',
                    columnName: t.name,
                    columnType: t.type,
                    columnKey: '',
                    notNull: t.notNull,
                    tableAlias: tableAlias,
                    hidden: t.hidden || 0
                };
                return colDef;
            });
            allFields.push(...tableOrSubqueryFields);
        }
        const table_or_subquery_list2 = table_or_subquery.table_or_subquery_list();
        if (table_or_subquery_list2.length > 0) {
            tableOrSubqueryFields = traverse_table_or_subquery(table_or_subquery_list2, null, null, traverseContext);
            allFields.push(...tableOrSubqueryFields);
        }
        const idColumn = (_f = tableOrSubqueryFields.find((field) => field.columnKey === 'PRI')) === null || _f === void 0 ? void 0 : _f.columnName;
        const relation = {
            name: asAlias ? table_alias : tableOrSubqueryName,
            alias: table_alias,
            renameAs: false,
            parentRelation: '',
            cardinality: 'one',
            parentCardinality: 'one',
            joinColumn: idColumn
        };
        if (join_constraint) {
            //index 0 is the FROM (root relation)
            const expr = join_constraint.expr(); //ON expr
            if (expr) {
                traverse_expr(expr, Object.assign(Object.assign({}, traverseContext), { fromColumns: allFields }));
                const allJoinColumsn = getAllColumns(expr);
                allJoinColumsn.forEach((joinColumn) => {
                    const column = allFields.find((col) => col.columnName === joinColumn.name && (col.tableAlias === joinColumn.prefix || col.table === joinColumn.prefix));
                    const filterUniqueKeys = allFields.filter((col) => (joinColumn.prefix === col.table || joinColumn.prefix === col.tableAlias) && col.columnKey === 'PRI');
                    const compositeKey = filterUniqueKeys.find((uni) => uni.columnName === column.columnName);
                    const notUnique = (filterUniqueKeys.length > 1 && compositeKey) || ((column === null || column === void 0 ? void 0 : column.columnKey) !== 'UNI' && (column === null || column === void 0 ? void 0 : column.columnKey) !== 'PRI');
                    if (joinColumn.prefix !== relation.name && joinColumn.prefix !== relation.alias) {
                        relation.parentRelation = joinColumn.prefix;
                        if (notUnique) {
                            relation.parentCardinality = 'many';
                        }
                    }
                    if (joinColumn.prefix === relation.name || joinColumn.prefix === relation.alias) {
                        if (notUnique) {
                            relation.cardinality = 'many';
                        }
                    }
                });
            }
        }
        if (!traverseContext.subQuery) {
            traverseContext.relations.push(relation);
            //dynamic query
            const fragment = `${join_operator_list != null && index > 0 ? extractOriginalSql(join_operator_list[index - 1]) : 'FROM'} ${extractOriginalSql(table_or_subquery_list[index])}${join_constraint != null ? ` ${extractOriginalSql(join_constraint)}` : ''}`;
            const params = traverseContext.parameters.slice(numParamsBefore).map((_, index) => index + numParamsBefore);
            traverseContext.dynamicSqlInfo2.from.push({
                fragment: fragment,
                relationName: relation.name,
                relationAlias: relation.alias,
                parentRelation: relation.parentRelation,
                fields: tableOrSubqueryFields.map((field) => field.columnName),
                parameters: params
            });
        }
    });
    return allFields;
}
function traverse_expr(expr, traverseContext) {
    var _a, _b;
    const function_name = (_a = expr.function_name()) === null || _a === void 0 ? void 0 : _a.getText().toLowerCase();
    if (function_name) {
        return traverse_function(expr, function_name, traverseContext);
    }
    const column_name = expr.column_name();
    const table_name = expr.table_name();
    if (column_name) {
        const type = traverse_column_name(column_name, table_name, traverseContext.fromColumns);
        return {
            name: type.columnName,
            type: type.columnType,
            notNull: type.notNull,
            intrinsicNotNull: type.notNull,
            table: type.tableAlias || type.table,
            hidden: type.hidden
        };
    }
    const literal = expr.literal_value();
    if (literal) {
        if (literal.STRING_LITERAL()) {
            const type = (0, collect_constraints_1.freshVar)(literal.getText(), 'TEXT');
            return {
                name: type.name,
                type: type,
                notNull: true,
                table: type.table || ''
            };
        }
        if (literal.NUMERIC_LITERAL()) {
            const type = (0, collect_constraints_1.freshVar)(literal.getText(), 'INTEGER');
            return {
                name: type.name,
                type: type,
                notNull: true,
                table: type.table || ''
            };
        }
        if (literal.TRUE_() || literal.FALSE_()) {
            const type = (0, collect_constraints_1.freshVar)(literal.getText(), 'BOOLEAN');
            return {
                name: type.name,
                type: type,
                notNull: true,
                table: type.table || ''
            };
        }
        const type = (0, collect_constraints_1.freshVar)(literal.getText(), '?');
        return {
            name: type.name,
            type: type,
            notNull: literal.NULL_() == null,
            table: type.table || ''
        };
    }
    if (expr.unary_operator()) {
        const exprRight = expr.expr(0);
        return traverse_expr(exprRight, traverseContext);
    }
    const parameter = expr.BIND_PARAMETER();
    if (parameter) {
        const param = (0, collect_constraints_1.freshVar)('?', '?');
        const type = {
            name: param.name,
            type: param,
            notNull: true, //default is true
            table: param.table || '',
            paramIndex: parameter.symbol.start
        };
        traverseContext.parameters.push(type);
        return type;
    }
    if (expr.STAR() || expr.DIV() || expr.MOD()) {
        const exprLeft = expr.expr(0);
        const exprRight = expr.expr(1);
        const typeLeft = traverse_expr(exprLeft, traverseContext);
        const typeRight = traverse_expr(exprRight, traverseContext);
        if (typeLeft.name === '?') {
            typeLeft.notNull = true;
        }
        if (typeRight.name === '?') {
            typeRight.notNull = true;
        }
        const returnType = (0, collect_constraints_1.freshVar)(expr.getText(), '?');
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: typeLeft.type,
            type2: returnType
        });
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: typeRight.type,
            type2: returnType
        });
        return {
            name: returnType.name,
            type: returnType,
            notNull: typeLeft.notNull && typeRight.notNull,
            table: returnType.table || ''
        };
    }
    if (expr.PLUS() || expr.MINUS()) {
        const returnType = (0, collect_constraints_1.freshVar)(expr.getText(), 'REAL'); //NUMERIC
        const exprLeft = expr.expr(0);
        const exprRight = expr.expr(1);
        const typeLeft = traverse_expr(exprLeft, traverseContext);
        const typeRight = traverse_expr(exprRight, traverseContext);
        typeLeft.table = '';
        typeRight.table = '';
        if (typeLeft.name === '?') {
            typeLeft.notNull = true;
        }
        if (typeRight.name === '?') {
            typeRight.notNull = true;
        }
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: returnType,
            type2: typeLeft.type
        });
        const isDateFunctionContext = expr.parentCtx instanceof sqlite_1.ExprContext && ((_b = expr.parentCtx.function_name()) === null || _b === void 0 ? void 0 : _b.getText().toLowerCase()) === 'date';
        if (!isDateFunctionContext) {
            traverseContext.constraints.push({
                expression: exprRight.getText(),
                type1: returnType,
                type2: typeRight.type
            });
        }
        return Object.assign(Object.assign({}, typeLeft), { name: expr.getText(), notNull: typeLeft.notNull && typeRight.notNull });
    }
    if (expr.LT2() ||
        expr.GT2() ||
        expr.AMP() ||
        expr.PIPE() ||
        expr.LT() ||
        expr.LT_EQ() ||
        expr.GT() ||
        expr.GT_EQ() ||
        expr.NOT_EQ1() ||
        expr.NOT_EQ2()) {
        const exprLeft = expr.expr(0);
        const exprRight = expr.expr(1);
        const typeLeft = traverse_expr(exprLeft, traverseContext);
        const typeRight = traverse_expr(exprRight, traverseContext);
        if (typeLeft.name === '?') {
            typeLeft.notNull = true;
        }
        if (typeRight.name === '?') {
            typeRight.notNull = true;
        }
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: typeLeft.type,
            type2: typeRight.type
        });
        const resultType = (0, collect_constraints_1.freshVar)(expr.getText(), 'INTEGER');
        return {
            name: resultType.name,
            type: resultType,
            notNull: true,
            table: resultType.table || ''
        };
    }
    if (expr.PIPE2()) {
        const exprLeft = expr.expr(0);
        const typeLeft = traverse_expr(exprLeft, traverseContext);
        const exprRight = expr.expr(1);
        const typeRight = traverse_expr(exprRight, traverseContext);
        if (typeLeft.name === '?') {
            typeLeft.type.type = 'TEXT';
        }
        if (typeRight.name === '?') {
            typeRight.type.type = 'TEXT';
        }
        return {
            name: expr.getText(),
            type: (0, collect_constraints_1.freshVar)(expr.getText(), 'TEXT'),
            notNull: typeLeft.notNull && typeRight.notNull,
            table: ''
        };
    }
    if (expr.IS_()) {
        //is null/is not null/is true, is false
        const exprLeft = expr.expr(0);
        const typeLeft = traverse_expr(exprLeft, traverseContext);
        const exprRight = expr.expr(1);
        const typeRight = traverse_expr(exprRight, traverseContext);
        typeLeft.notNull = typeRight.notNull;
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: typeLeft.type,
            type2: typeRight.type
        });
        const type = (0, collect_constraints_1.freshVar)(expr.getText(), 'INTEGER');
        return {
            name: type.name,
            type: type,
            notNull: true,
            table: type.table || ''
        };
    }
    if (expr.ASSIGN()) {
        //=
        const exprLeft = expr.expr(0);
        const exprRight = expr.expr(1);
        const typeLeft = traverse_expr(exprLeft, traverseContext);
        const typeRight = traverse_expr(exprRight, traverseContext);
        if (typeLeft.name === '?') {
            typeLeft.notNull = true;
        }
        if (typeRight.name === '?') {
            typeRight.notNull = true;
        }
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: typeLeft.type,
            type2: typeRight.type
        });
        const type = (0, collect_constraints_1.freshVar)(expr.getText(), '?');
        return {
            name: type.name,
            type: type,
            notNull: true,
            table: type.table || ''
        };
    }
    if (expr.BETWEEN_()) {
        const exprType = traverse_expr(expr.expr(0), traverseContext);
        const between1 = traverse_expr(expr.expr(1), traverseContext);
        const between2 = traverse_expr(expr.expr(2), traverseContext);
        if (between1.name === '?') {
            between1.notNull = true;
        }
        if (between2.name === '?') {
            between2.notNull = true;
        }
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: exprType.type,
            type2: between1.type
        });
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: exprType.type,
            type2: between2.type
        });
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: between1.type,
            type2: between2.type
        });
        return exprType;
    }
    if (expr.OR_() || expr.AND_()) {
        const expr1 = expr.expr(0);
        const expr2 = expr.expr(1);
        traverse_expr(expr1, traverseContext);
        return traverse_expr(expr2, traverseContext);
    }
    if (expr.IN_()) {
        const exprList = expr.expr_list();
        const inExprLeft = exprList[0];
        const typeLeft = traverse_expr(inExprLeft, traverseContext);
        if (typeLeft.name === '?') {
            typeLeft.notNull = true;
        }
        if (expr.NOT_()) {
            //NOT IN (SELECT...)
            const select_stmt = expr.select_stmt();
            if (select_stmt) {
                const select_stmt_type = traverse_select_stmt(select_stmt, traverseContext, true);
                const selectType = select_stmt_type.columns[0];
                traverseContext.constraints.push({
                    expression: expr.getText(),
                    type1: typeLeft.type,
                    type2: Object.assign(Object.assign({}, selectType.type), { list: true })
                });
            }
            //NOT IN (1, 2, 3)
            exprList.slice(1).forEach((inExpr) => {
                const typeRight = traverse_expr(inExpr, traverseContext);
                if (typeRight.name === '?') {
                    typeRight.notNull = true;
                }
                traverseContext.constraints.push({
                    expression: expr.getText(),
                    type1: typeLeft.type,
                    type2: Object.assign(Object.assign({}, typeRight.type), { list: true })
                });
            });
        }
        else {
            const rightExpr = exprList[1];
            //IN (SELECT...)
            const select_stmt2 = rightExpr.select_stmt();
            if (select_stmt2) {
                const select_stmt_type = traverse_select_stmt(select_stmt2, traverseContext, true);
                const selectType2 = select_stmt_type.columns[0];
                traverseContext.constraints.push({
                    expression: expr.getText(),
                    type1: typeLeft.type,
                    type2: Object.assign(Object.assign({}, selectType2.type), { list: true })
                });
            }
            //IN (1, 2, 3)
            rightExpr.expr_list().forEach((inExpr2) => {
                const typeRight = traverse_expr(inExpr2, traverseContext);
                if (typeRight.name === '?') {
                    typeRight.notNull = true;
                }
                traverseContext.constraints.push({
                    expression: expr.getText(),
                    type1: typeLeft.type,
                    type2: Object.assign(Object.assign({}, typeRight.type), { list: true })
                });
            });
        }
        const type = (0, collect_constraints_1.freshVar)(expr.getText(), '?');
        return {
            name: type.name,
            type: type,
            notNull: true,
            table: type.table || ''
        };
    }
    if (expr.LIKE_() || expr.GLOB_()) {
        const exprLeft = expr.expr(0);
        const exprRight = expr.expr(1);
        const typeLeft = traverse_expr(exprLeft, traverseContext);
        const typeRight = traverse_expr(exprRight, traverseContext);
        if (typeLeft.name === '?') {
            typeLeft.notNull = true;
        }
        if (typeRight.name === '?') {
            typeRight.notNull = true;
        }
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: typeLeft.type,
            type2: typeRight.type
        });
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: typeLeft.type,
            type2: (0, collect_constraints_1.freshVar)(expr.getText(), 'TEXT')
        });
        const type = (0, collect_constraints_1.freshVar)(expr.getText(), 'INTEGER');
        return {
            name: type.name,
            type: type,
            notNull: true,
            table: type.table || ''
        };
    }
    if (expr.MATCH_()) {
        const exprLeft = expr.expr(0);
        const exprRight = expr.expr(1);
        const typeRight = traverse_expr(exprRight, traverseContext);
        if (typeRight.name === '?') {
            typeRight.notNull = true;
            typeRight.type = (0, collect_constraints_1.freshVar)(exprRight.getText(), 'TEXT');
        }
        const type = (0, collect_constraints_1.freshVar)(expr.getText(), 'INTEGER');
        return {
            name: type.name,
            type: type,
            notNull: true,
            table: type.table || ''
        };
    }
    const select_stmt = expr.select_stmt();
    if (select_stmt) {
        const subQueryType = traverse_select_stmt(select_stmt, Object.assign(Object.assign({}, traverseContext), { subQuery: true }), true);
        const type = Object.assign(Object.assign({}, subQueryType.columns[0].type), { table: '' });
        return {
            name: type.name,
            type: type,
            notNull: expr.EXISTS_() ? true : false,
            table: type.table || ''
        };
    }
    if (expr.OPEN_PAR() && expr.CLOSE_PAR()) {
        const type = (0, collect_constraints_1.freshVar)(expr.getText(), '?');
        const exprTypes = expr.expr_list().map((innerExpr) => {
            const exprType = traverse_expr(innerExpr, traverseContext);
            traverseContext.constraints.push({
                expression: innerExpr.getText(),
                type1: exprType.type,
                type2: type
            });
            return exprType;
        });
        return {
            name: type.name,
            type: type,
            notNull: exprTypes.every((type) => type.notNull),
            table: type.table || ''
        };
    }
    if (expr.CASE_()) {
        const resultTypes = []; //then and else
        const whenTypes = [];
        expr.expr_list().forEach((expr_, index) => {
            const type = traverse_expr(expr_, traverseContext);
            if (index % 2 === 0 && (!expr.ELSE_() || index < expr.expr_list().length - 1)) {
                whenTypes.push(type);
            }
            else {
                resultTypes.push(type);
            }
        });
        resultTypes.forEach((resultType, index) => {
            if (index > 0) {
                traverseContext.constraints.push({
                    expression: expr.getText(),
                    type1: resultTypes[0].type,
                    type2: resultType.type
                });
            }
        });
        whenTypes.forEach((whenType) => {
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: (0, collect_constraints_1.freshVar)('INTEGER', 'INTEGER'),
                type2: whenType.type
            });
        });
        const type = resultTypes[0];
        return {
            name: extractOriginalSql(expr),
            type: type.type,
            notNull: expr.ELSE_() ? resultTypes.every((type) => type.notNull) : false,
            table: type.table || ''
        };
    }
    throw Error(`traverse_expr not supported:${expr.getText()}`);
}
function traverse_function(expr, function_name, traverseContext) {
    if (function_name === 'avg') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'REAL');
        const sumParamExpr = expr.expr(0);
        const paramType = traverse_expr(sumParamExpr, traverseContext);
        if (paramType.type.kind === 'TypeVar') {
            functionType.table = paramType.table;
        }
        return {
            name: functionType.name,
            type: functionType,
            notNull: paramType.notNull,
            table: functionType.table || ''
        };
    }
    if (function_name === 'sum') {
        const sumParamExpr = expr.expr(0);
        const paramType = traverse_expr(sumParamExpr, traverseContext);
        return {
            name: expr.getText(),
            type: paramType.type,
            notNull: false,
            table: paramType.table || ''
        };
    }
    if (function_name === 'min' || function_name === 'max') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), '?');
        let paramNotNull = false;
        const paramsTypes = expr.expr_list().map((exprParam, index, array) => {
            const paramType = traverse_expr(exprParam, traverseContext);
            // if (array.length == 1 && index == 0) {
            // 	paramNotNull = paramType.notNull;
            // }
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: functionType,
                type2: paramType.type
            });
            return paramType;
        });
        return {
            name: functionType.name,
            type: functionType,
            notNull: paramsTypes.every(param => param.notNull),
            table: functionType.table || ''
        };
    }
    if (function_name === 'count') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'INTEGER');
        if (expr.expr_list().length === 1) {
            const sumParamExpr = expr.expr(0);
            const paramType = traverse_expr(sumParamExpr, traverseContext);
            if (paramType.type.kind === 'TypeVar') {
                functionType.table = paramType.table;
            }
        }
        return {
            name: functionType.name,
            type: functionType,
            notNull: true,
            table: functionType.table || ''
        };
    }
    if (function_name === 'concat') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'TEXT');
        expr.expr_list().forEach((paramExpr) => {
            const paramType = traverse_expr(paramExpr, traverseContext);
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: functionType,
                type2: paramType.type
            });
            if (paramType.type.kind === 'TypeVar') {
                functionType.table = paramType.table;
            }
        });
        return {
            name: functionType.name,
            type: functionType,
            notNull: true,
            table: functionType.table || ''
        };
    }
    if (function_name === 'glob') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'TEXT');
        const exprTypes = expr.expr_list().map((paramExpr) => {
            const paramType = traverse_expr(paramExpr, traverseContext);
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: functionType,
                type2: paramType.type
            });
            if (paramType.type.kind === 'TypeVar') {
                functionType.table = paramType.table;
            }
            return paramType;
        });
        return {
            name: functionType.name,
            type: functionType,
            notNull: exprTypes.every(param => param.notNull),
            table: functionType.table || ''
        };
    }
    if (function_name === 'length') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'INTEGER');
        const paramExpr = expr.expr(0);
        const paramType = traverse_expr(paramExpr, traverseContext);
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: (0, collect_constraints_1.freshVar)(expr.getText(), '?'), //str or blob
            type2: paramType.type
        });
        if (paramType.type.kind === 'TypeVar') {
            functionType.table = paramType.table;
        }
        return {
            name: functionType.name,
            type: functionType,
            notNull: paramType.notNull,
            table: functionType.table || ''
        };
    }
    if (function_name === 'group_concat') {
        expr.expr_list().forEach((paramExpr) => {
            const param1Type = traverse_expr(paramExpr, traverseContext);
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: (0, collect_constraints_1.freshVar)(expr.getText(), 'TEXT'),
                type2: param1Type.type
            });
        });
        return {
            name: expr.getText(),
            type: (0, collect_constraints_1.freshVar)(expr.getText(), 'TEXT'),
            notNull: false,
            table: ''
        };
    }
    if (function_name === 'random') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'INTEGER');
        return {
            name: functionType.name,
            type: functionType,
            notNull: true,
            table: ''
        };
    }
    if (function_name === 'round') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'REAL');
        const param1Expr = expr.expr(0);
        const param1Type = traverse_expr(param1Expr, traverseContext);
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: functionType,
            type2: param1Type.type
        });
        const param2Expr = expr.expr(1);
        if (param2Expr) {
            const param2Type = traverse_expr(param2Expr, traverseContext);
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: (0, collect_constraints_1.freshVar)(expr.getText(), 'INTEGER'),
                type2: param2Type.type
            });
        }
        return {
            name: functionType.name,
            type: functionType,
            notNull: param1Type.notNull,
            table: param1Type.table || ''
        };
    }
    if (function_name === 'nullif') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), '?');
        expr.expr_list().forEach((paramExpr) => {
            const paramType = traverse_expr(paramExpr, traverseContext);
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: functionType,
                type2: paramType.type
            });
            return paramType;
        });
        return {
            name: functionType.name,
            type: functionType,
            notNull: false,
            table: functionType.table || ''
        };
    }
    if (function_name === 'coalesce') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), '?');
        const paramTypes = expr.expr_list().map((paramExpr) => {
            const paramType = traverse_expr(paramExpr, traverseContext);
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: functionType,
                type2: paramType.type
            });
            return paramType;
        });
        return {
            name: functionType.name,
            type: functionType,
            notNull: paramTypes.some((param) => param.notNull),
            table: functionType.table || ''
        };
    }
    if (function_name === 'strftime') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'TEXT');
        const paramExpr = expr.expr(1);
        const paramType = traverse_expr(paramExpr, traverseContext);
        paramType.notNull = true;
        traverseContext.constraints.push({
            expression: paramExpr.getText(),
            type1: (0, collect_constraints_1.freshVar)(paramExpr.getText(), 'DATE_TIME'),
            type2: paramType.type
        });
        return {
            name: functionType.name,
            type: functionType,
            notNull: false,
            table: functionType.table || ''
        };
    }
    if (function_name === 'date' || function_name === 'time' || function_name === 'datetime') {
        const dateType = function_name === 'date' ? 'DATE' : 'DATE_TIME';
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), dateType);
        const param1 = traverse_expr(expr.expr(0), traverseContext);
        param1.notNull = true;
        expr.expr_list().forEach((paramExpr, index, arr) => {
            if (index === 0 && arr.length === 1) {
                traverseContext.constraints.push({
                    expression: paramExpr.getText(),
                    type1: (0, collect_constraints_1.freshVar)(paramExpr.getText(), dateType),
                    type2: param1.type
                });
            }
            else if (index > 0) {
                const paramType = traverse_expr(paramExpr, traverseContext);
                if (index === 1) {
                    if (paramType.name === "'auto'" || paramType.name === "'unixepoch'") {
                        traverseContext.constraints.push({
                            expression: paramExpr.getText(),
                            type1: (0, collect_constraints_1.freshVar)(paramExpr.getText(), 'NUMERIC'),
                            type2: param1.type
                        });
                    }
                }
                traverseContext.constraints.push({
                    expression: paramExpr.getText(),
                    type1: (0, collect_constraints_1.freshVar)(paramExpr.getText(), 'TEXT'),
                    type2: paramType.type
                });
            }
        });
        return {
            name: functionType.name,
            type: functionType,
            notNull: false,
            table: functionType.table || ''
        };
    }
    if (function_name === 'julianday') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'REAL');
        const paramExpr = expr.expr(0);
        const notNull = paramExpr.getText().toLowerCase() === `'now'`;
        const paramType = traverse_expr(paramExpr, traverseContext);
        traverseContext.constraints.push({
            expression: paramExpr.getText(),
            type1: (0, collect_constraints_1.freshVar)(paramExpr.getText(), 'DATE'),
            type2: paramType.type
        });
        return {
            name: functionType.name,
            type: functionType,
            notNull: paramType.notNull,
            table: functionType.table || ''
        };
    }
    if (function_name === 'unixepoch') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'INTEGER');
        const paramExpr = expr.expr(0);
        const notNull = paramExpr.getText().toLowerCase() === `'now'`;
        const paramType = traverse_expr(paramExpr, traverseContext);
        traverseContext.constraints.push({
            expression: paramExpr.getText(),
            type1: (0, collect_constraints_1.freshVar)(paramExpr.getText(), 'DATE'),
            type2: paramType.type
        });
        return {
            name: functionType.name,
            type: functionType,
            notNull: paramType.notNull,
            table: functionType.table || ''
        };
    }
    if (function_name === 'ifnull') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), '?');
        const paramTypes = expr.expr_list().map((paramExpr) => {
            const paramType = traverse_expr(paramExpr, traverseContext);
            if (paramType.name === '?') {
                paramType.notNull = false;
            }
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: functionType,
                type2: paramType.type
            });
            return paramType;
        });
        return {
            name: functionType.name,
            type: functionType,
            notNull: paramTypes.every((param) => param.notNull),
            table: functionType.table || ''
        };
    }
    if (function_name === 'row_number' || function_name === 'rank' || function_name === 'dense_rank') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'INTEGER');
        return {
            name: functionType.name,
            type: functionType,
            notNull: true,
            table: functionType.table || ''
        };
    }
    if (function_name === 'first_value' || function_name === 'last_value') {
        const paramExpr = expr.expr(0);
        const paramType = traverse_expr(paramExpr, traverseContext);
        return paramType;
    }
    if (function_name === 'lead' || function_name === 'lag') {
        const paramExpr = expr.expr(0);
        const paramType = traverse_expr(paramExpr, traverseContext);
        return Object.assign(Object.assign({}, paramType), { notNull: false });
    }
    if (function_name === 'iif') {
        const expr1 = expr.expr(0);
        traverse_expr(expr1, traverseContext);
        const expr2 = expr.expr(1);
        const expr2Type = traverse_expr(expr2, traverseContext);
        const expr3 = expr.expr(2);
        const expr3Type = traverse_expr(expr3, traverseContext);
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: expr2Type.type,
            type2: expr3Type.type
        });
        return Object.assign(Object.assign({}, expr2Type), { name: expr.getText(), notNull: expr2Type.notNull && expr3Type.notNull });
    }
    if (function_name === 'vector') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'BLOB');
        const param1Expr = expr.expr(0);
        const param1Type = traverse_expr(param1Expr, traverseContext);
        param1Type.notNull = true;
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: (0, collect_constraints_1.freshVar)(expr.getText(), 'TEXT'),
            type2: param1Type.type
        });
        return {
            name: expr.getText(),
            type: functionType,
            notNull: true,
            table: ''
        };
    }
    if (function_name === 'highlight' || function_name === 'snippet') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'TEXT');
        const param0Expr = expr.expr(0);
        const param1Expr = expr.expr(1);
        const param1Type = traverse_expr(param1Expr, traverseContext);
        param1Type.notNull = true;
        traverseContext.constraints.push({
            expression: param1Expr.getText(),
            type1: (0, collect_constraints_1.freshVar)(param1Expr.getText(), 'INTEGER'),
            type2: param1Type.type
        });
        const param2Expr = expr.expr(2);
        const param2Type = traverse_expr(param2Expr, traverseContext);
        param2Type.notNull = true;
        traverseContext.constraints.push({
            expression: param2Expr.getText(),
            type1: (0, collect_constraints_1.freshVar)(param2Expr.getText(), 'TEXT'),
            type2: param2Type.type
        });
        const param3Expr = expr.expr(3);
        const param3Type = traverse_expr(param3Expr, traverseContext);
        param3Type.notNull = true;
        traverseContext.constraints.push({
            expression: param3Expr.getText(),
            type1: (0, collect_constraints_1.freshVar)(param3Expr.getText(), 'TEXT'),
            type2: param3Type.type
        });
        if (function_name === 'snippet') {
            const param4Expr = expr.expr(4);
            const param4Type = traverse_expr(param4Expr, traverseContext);
            param4Type.notNull = true;
            traverseContext.constraints.push({
                expression: param4Expr.getText(),
                type1: (0, collect_constraints_1.freshVar)(param4Expr.getText(), 'TEXT'),
                type2: param4Type.type
            });
            const param5Expr = expr.expr(5);
            const param5Type = traverse_expr(param5Expr, traverseContext);
            param5Type.notNull = true;
            traverseContext.constraints.push({
                expression: param5Expr.getText(),
                type1: (0, collect_constraints_1.freshVar)(param5Expr.getText(), 'INTEGER'),
                type2: param5Type.type
            });
        }
        return {
            name: expr.getText(),
            type: functionType,
            notNull: false,
            table: param0Expr.getText()
        };
    }
    if (function_name === 'vector_extract') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'TEXT');
        const param1Expr = expr.expr(0);
        const param1Type = traverse_expr(param1Expr, traverseContext);
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: (0, collect_constraints_1.freshVar)(expr.getText(), 'BLOB'),
            type2: param1Type.type
        });
        return {
            name: expr.getText(),
            type: functionType,
            notNull: true,
            table: ''
        };
    }
    if (function_name === 'vector_distance_cos') {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), 'REAL');
        const param1Expr = expr.expr(0);
        if (param1Expr) {
            const param1Type = traverse_expr(param1Expr, traverseContext);
            param1Type.notNull = true;
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: (0, collect_constraints_1.freshVar)(expr.getText(), 'BLOB'),
                type2: param1Type.type
            });
        }
        const param2Expr = expr.expr(1);
        if (param2Expr) {
            const param2Type = traverse_expr(param2Expr, traverseContext);
            param2Type.notNull = true;
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: (0, collect_constraints_1.freshVar)(expr.getText(), 'TEXT'),
                type2: param2Type.type
            });
        }
        return {
            name: expr.getText(),
            type: functionType,
            notNull: true,
            table: ''
        };
    }
    const functionsSpec = {
        'trim': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: false
                },
                {
                    type: 'TEXT',
                    notNull: true
                },
            ],
            returnType: {
                type: 'TEXT',
                notNull: 0
            }
        },
        'rtrim': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: false
                },
                {
                    type: 'TEXT',
                    notNull: true
                },
            ],
            returnType: {
                type: 'TEXT',
                notNull: 0
            }
        },
        'ltrim': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: false
                },
                {
                    type: 'TEXT',
                    notNull: true
                },
            ],
            returnType: {
                type: 'TEXT',
                notNull: 0
            }
        },
        'replace': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: false
                },
                {
                    type: 'TEXT',
                    notNull: true
                },
                {
                    type: 'TEXT',
                    notNull: true
                },
            ],
            returnType: {
                type: 'TEXT',
                notNull: 0
            }
        },
        'char': {
            paramsTypes: [
                {
                    type: 'INTEGER',
                    notNull: true
                }
            ],
            variableParameters: true,
            returnType: {
                type: 'TEXT',
                notNull: true
            }
        },
        'lower': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: true
                }
            ],
            returnType: {
                type: 'TEXT',
                notNull: 0
            }
        },
        'upper': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: true
                }
            ],
            returnType: {
                type: 'TEXT',
                notNull: 0
            }
        },
        'concat_ws': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: true
                }
            ],
            variableParameters: true,
            returnType: {
                type: 'TEXT',
                notNull: 0
            }
        },
        'likelihood': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: true
                },
                {
                    type: 'REAL',
                    notNull: true
                }
            ],
            returnType: {
                type: 'TEXT',
                notNull: 0
            }
        },
        'json': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: false
                }
            ],
            returnType: {
                type: 'TEXT',
                notNull: 0 //index of parameter
            }
        },
        'jsonb': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: false
                }
            ],
            returnType: {
                type: 'BLOB',
                notNull: 0
            }
        },
        'json_array': {
            paramsTypes: [
                {
                    type: 'any',
                    notNull: false
                }
            ],
            returnType: {
                type: 'TEXT',
                notNull: 0
            }
        },
        'jsonb_array': {
            paramsTypes: [
                {
                    type: 'any',
                    notNull: false
                }
            ],
            returnType: {
                type: 'BLOB',
                notNull: 0
            }
        },
        'json_array_length': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: false
                },
                {
                    type: 'TEXT',
                    notNull: false
                }
            ],
            returnType: {
                type: 'INTEGER',
                notNull: false
            }
        },
        'json_error_position': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: false
                }
            ],
            returnType: {
                type: 'INTEGER',
                notNull: 0
            }
        },
        'json_extract': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: false
                }
            ],
            variableParameters: true,
            returnType: {
                type: 'any',
                notNull: false
            }
        },
        'jsonb_extract': {
            paramsTypes: [
                {
                    type: 'TEXT',
                    notNull: false
                }
            ],
            variableParameters: true,
            returnType: {
                type: 'BLOB',
                notNull: false
            }
        }
    };
    const sqlean_uuid_functions = {
        'uuid4': {
            paramsTypes: [],
            returnType: {
                type: 'TEXT',
                notNull: true
            }
        },
        'uuid7': {
            paramsTypes: [],
            returnType: {
                type: 'TEXT',
                notNull: true
            }
        }
    };
    const allFunctions = Object.assign(Object.assign({}, functionsSpec), sqlean_uuid_functions);
    const functionCatalog = allFunctions[function_name];
    if (functionCatalog) {
        const functionType = (0, collect_constraints_1.freshVar)(expr.getText(), functionCatalog.returnType.type);
        const params = expr.expr_list().map((exprParam, index) => {
            const paramType = traverse_expr(exprParam, traverseContext);
            const catalogType = functionCatalog.variableParameters === true ? functionCatalog.paramsTypes[0] : functionCatalog.paramsTypes[index];
            if (catalogType) {
                if (paramType.name === '?') {
                    paramType.notNull = typeof (catalogType.notNull) === 'boolean' ? catalogType.notNull : false;
                }
                traverseContext.constraints.push({
                    expression: expr.getText(),
                    type1: (0, collect_constraints_1.freshVar)(expr.getText(), catalogType.type),
                    type2: paramType.type
                });
            }
            return paramType;
        });
        const isNotNull = typeof (functionCatalog.returnType.notNull) === 'number'
            ? params[functionCatalog.returnType.notNull].notNull || false
            : functionCatalog.returnType.notNull;
        return {
            name: expr.getText(),
            type: functionType,
            notNull: isNotNull,
            table: ''
        };
    }
    throw Error(`traverse_expr: function not supported:${function_name}`);
}
function extractOriginalSql(rule) {
    var _a, _b;
    const startIndex = rule.start.start;
    const stopIndex = ((_a = rule.stop) === null || _a === void 0 ? void 0 : _a.stop) || startIndex;
    const result = (_b = rule.start.getInputStream()) === null || _b === void 0 ? void 0 : _b.getText(startIndex, stopIndex);
    return result;
}
function traverse_column_name(column_name, table_name, fromColumns) {
    const fieldName = {
        name: removeDoubleQuotes(column_name.getText()),
        prefix: removeDoubleQuotes((table_name === null || table_name === void 0 ? void 0 : table_name.getText()) || '')
    };
    const column = (0, select_columns_1.findColumn)(fieldName, fromColumns);
    // const typeVar = freshVar(column.columnName, column.columnType.type, column.tableAlias || column.table);
    return column;
}
function getTableName(column_name, schema) {
    const fieldName = {
        name: removeDoubleQuotes(column_name.getText()),
        prefix: schema
    };
    return fieldName;
}
function removeDoubleQuotes(columnName) {
    return columnName.replace(/^"|"$/g, '');
}
function isNotNull(columnName, where) {
    if (where == null) {
        return false;
    }
    if (where.AND_()) {
        const ifNullList = where.expr_list().map((expr) => isNotNull(columnName, expr));
        const result = ifNullList.some((v) => v);
        return result;
    }
    if (where.OR_()) {
        const possibleNullList = where.expr_list().map((expr) => isNotNull(columnName, expr));
        const result = possibleNullList.every((v) => v);
        return result;
    }
    return isNotNullExpr(columnName, where);
}
function isNotNullExpr(columnName, expr) {
    var _a, _b;
    if (expr.OPEN_PAR() && expr.CLOSE_PAR()) {
        const innerExpr = expr.expr(0);
        return isNotNull(columnName, innerExpr);
    }
    if (expr.ASSIGN() ||
        expr.GT() ||
        expr.GT_EQ() ||
        expr.LT() ||
        expr.LT_EQ() ||
        (expr.IS_() && expr.expr_list().length === 2 && expr.expr(1).getText() === 'notnull')) {
        const exprLeft = expr.expr(0);
        const exprRight = expr.expr(1);
        const column_name_left = exprLeft.column_name();
        const column_name_right = exprRight.column_name();
        if (column_name_left || column_name_right) {
            const columnLeft = column_name_left === null || column_name_left === void 0 ? void 0 : column_name_left.getText();
            const tableNameLeft = ((_a = exprLeft.table_name()) === null || _a === void 0 ? void 0 : _a.getText()) || '';
            const tableNameRight = ((_b = exprRight.table_name()) === null || _b === void 0 ? void 0 : _b.getText()) || '';
            const columnRight = column_name_right === null || column_name_right === void 0 ? void 0 : column_name_right.getText();
            if ((columnLeft === columnName.name && (tableNameLeft === '' || tableNameLeft === columnName.table))
                || (columnRight === columnName.name && (tableNameRight === '' || tableNameRight === columnName.table))) {
                return true;
            }
        }
    }
    return false;
}
function isMultipleRowResult(select_stmt, dbSchema, fromColumns) {
    var _a, _b, _c;
    if (isLimitOne(select_stmt)) {
        return false;
    }
    if (select_stmt.select_core_list().length === 1) {
        //UNION queries are multipleRowsResult = true
        const select_core = select_stmt.select_core(0);
        const from = select_core.FROM_();
        if (!from) {
            return false;
        }
        const groupBy = select_stmt.select_core_list().some((select_core) => select_core.GROUP_() != null);
        if (groupBy) {
            return true;
        }
        const agreegateFunction = select_core.result_column_list().some((result_column) => isAgregateFunction(result_column));
        if (agreegateFunction) {
            return false;
        }
        const table_or_subquery_list = select_core.table_or_subquery_list();
        if (select_core.join_clause() != null || table_or_subquery_list.length > 1) {
            return true;
        }
        const tableName = (_a = table_or_subquery_list[0].table_name()) === null || _a === void 0 ? void 0 : _a.getText().toLowerCase();
        if (!tableName) {
            return true;
        }
        const _whereExpr = select_core._whereExpr;
        if (!_whereExpr) {
            return true;
        }
        const schema = ((_c = (_b = table_or_subquery_list[0].schema_name()) === null || _b === void 0 ? void 0 : _b.getText()) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || 'main';
        const uniqueKeys = dbSchema.filter(col => (col.table.toLowerCase() === tableName || `"${col.table.toLowerCase()}"` === tableName)
            && (col.schema === schema || `"${col.schema}"` === schema)
            && (col.columnKey === 'PRI' || col.columnKey === 'UNI'))
            .map(col => col.column.toLowerCase());
        const isSingleResult = where_is_single_result(_whereExpr, fromColumns, uniqueKeys);
        if (isSingleResult === true) {
            return false;
        }
    }
    return true;
}
function isAgregateFunction(result_column) {
    var _a;
    if (((_a = result_column.expr()) === null || _a === void 0 ? void 0 : _a.over_clause()) != null) {
        //window function isMultipleRow = true
        return false;
    }
    const expr = result_column.expr();
    const isAgreg = expr && isAgregateFunctionExpr(expr);
    return isAgreg;
}
function isAgregateFunctionExpr(expr) {
    var _a;
    //ex. min(value)/100, 100/min(value)
    const isAgrr = expr.expr_list().some((expr) => isAgregateFunctionExpr(expr));
    if (isAgrr) {
        return isAgrr;
    }
    const function_name = (_a = expr.function_name()) === null || _a === void 0 ? void 0 : _a.getText().toLowerCase();
    return (function_name === 'count' ||
        function_name === 'sum' ||
        function_name === 'avg' ||
        function_name === 'min' ||
        function_name === 'max' ||
        function_name === 'group_concat');
}
function isLimitOne(select_stmt) {
    const limit_stmt = select_stmt.limit_stmt();
    if (limit_stmt && limit_stmt.expr(0).getText() === '1') {
        return true;
    }
    return false;
}
function where_is_single_result(whereExpr, fromColumns, uniqueKeys) {
    //only one assign (=). ex. id = 1
    if (uniqueKeys.length === 0) {
        return false;
    }
    if (whereExpr.ASSIGN() && uniqueKeys.length === 1) {
        const assignResult = is_single_result(whereExpr, fromColumns);
        if (assignResult.isAssign && uniqueKeys[0] === assignResult.column.columnName.toLowerCase()) {
            return true;
        }
        return false;
    }
    const hasOr = whereExpr.OR_();
    if (hasOr) {
        return false;
    }
    const expr_list = whereExpr.expr_list();
    const assignColumnList = expr_list.map((expr) => is_single_result(expr, fromColumns))
        .filter(result => result.isAssign).map(assign => assign.column.columnName.toLowerCase());
    const includeAllKeys = uniqueKeys.every(key => assignColumnList.includes(key));
    return includeAllKeys;
}
function is_single_result(expr, fromColumns) {
    if (expr.expr_list().length != 2 || !expr.ASSIGN()) {
        return {
            isAssign: false
        };
    }
    const expr1 = expr.expr(0);
    const expr2 = expr.expr(1); //TODO: 1 = id
    const column_name = expr1 === null || expr1 === void 0 ? void 0 : expr1.column_name();
    if (column_name) {
        const column = traverse_column_name(column_name, null, fromColumns);
        return {
            isAssign: true,
            column,
        };
    }
    return {
        isAssign: false
    };
}
function traverse_insert_stmt(insert_stmt, traverseContext) {
    var _a;
    const table_name = insert_stmt.table_name();
    const fromColumns = (0, select_columns_1.filterColumns)(traverseContext.dbSchema, [], '', (0, select_columns_1.splitName)(table_name.getText()));
    const columns = insert_stmt.column_name_list().map((column_name) => {
        return traverse_column_name(column_name, null, fromColumns);
    });
    const insertColumns = [];
    const value_row_list = ((_a = insert_stmt.values_clause()) === null || _a === void 0 ? void 0 : _a.value_row_list()) || [];
    value_row_list.forEach((value_row) => {
        value_row.expr_list().forEach((expr, index) => {
            const numberParamsBefore = traverseContext.parameters.length;
            const exprType = traverse_expr(expr, traverseContext);
            traverseContext.parameters.slice(numberParamsBefore).forEach((param) => {
                const col = columns[index];
                traverseContext.constraints.unshift({
                    expression: expr.getText(),
                    type1: col.columnType,
                    type2: exprType.type
                });
                const notNullColumn = col.columnKey === 'PRI' && col.columnType.type === 'INTEGER' ? false : col.notNull;
                insertColumns.push(Object.assign(Object.assign({}, param), { notNull: exprType.name === '?' ? notNullColumn : param.notNull }));
            });
        });
    });
    const select_stmt = insert_stmt.select_stmt();
    if (select_stmt) {
        const columnNullability = new Map();
        const selectResult = traverse_select_stmt(select_stmt, traverseContext);
        selectResult.columns.forEach((selectColumn, index) => {
            const col = columns[index];
            traverseContext.constraints.unshift({
                expression: col.columnName,
                type1: col.columnType,
                type2: selectColumn.type
            });
            const notNullColumn = col.columnKey === 'PRI' && col.columnType.type === 'INTEGER' ? false : col.notNull;
            columnNullability.set(selectColumn.type.id, notNullColumn);
        });
        traverseContext.parameters.forEach((param) => {
            insertColumns.push(Object.assign(Object.assign({}, param), { notNull: columnNullability.get(param.type.id) != null ? columnNullability.get(param.type.id) : param.notNull }));
        });
    }
    const upsert_clause = insert_stmt.upsert_clause();
    if (upsert_clause) {
        const assign_list = upsert_clause.ASSIGN_list();
        assign_list.forEach((_, index) => {
            const paramsBefore = traverseContext.parameters.length;
            const column_name = upsert_clause.column_name(index);
            const col = traverse_column_name(column_name, null, fromColumns);
            const expr = upsert_clause.expr(index);
            const table_name = expr.table_name();
            const excludedColumns = table_name && table_name.getText() === 'excluded' ? fromColumns.map((col) => (Object.assign(Object.assign({}, col), { table: 'excluded' }))) : [];
            const exprType = traverse_expr(expr, Object.assign(Object.assign({}, traverseContext), { fromColumns: fromColumns.concat(excludedColumns) }));
            traverseContext.constraints.push({
                expression: column_name.getText(),
                type1: col.columnType,
                type2: exprType.type
            });
            traverseContext.parameters.slice(paramsBefore).forEach((param) => {
                insertColumns.push(Object.assign(Object.assign({}, param), { notNull: exprType.name === '?' ? col.notNull : param.notNull }));
            });
        });
    }
    const returning_clause = insert_stmt.returning_clause();
    const returninColumns = returning_clause ? traverse_returning_clause(returning_clause, Object.assign(Object.assign({}, traverseContext), { fromColumns })) : [];
    const queryResult = {
        queryType: 'Insert',
        constraints: traverseContext.constraints,
        parameters: insertColumns,
        columns: returninColumns,
        returing: returning_clause != null
    };
    return queryResult;
}
function traverse_returning_clause(returning_clause, traverseContext) {
    const { fromColumns } = traverseContext;
    const result_column_list = returning_clause.result_column_list();
    const result = result_column_list.flatMap((result_column) => {
        if (result_column.STAR()) {
            return fromColumns.map((col) => {
                const newCol = {
                    name: col.columnName,
                    type: col.columnType,
                    notNull: col.notNull,
                    table: col.table
                };
                return newCol;
            });
        }
        const expr = result_column.expr();
        if (expr) {
            const exprResult = traverse_expr(expr, traverseContext);
            return exprResult;
        }
        return [];
    });
    return result;
}
function traverse_update_stmt(update_stmt, traverseContext) {
    const table_name = update_stmt.qualified_table_name().getText();
    const fromColumns = (0, select_columns_1.filterColumns)(traverseContext.dbSchema, [], '', (0, select_columns_1.splitName)(table_name));
    const column_name_list = Array.from({
        length: update_stmt.ASSIGN_list().length
    }).map((_, i) => update_stmt.column_name(i));
    const columns = column_name_list.map((column_name) => {
        return traverse_column_name(column_name, null, fromColumns);
    });
    const updateColumns = [];
    const whereParams = [];
    const expr_list = update_stmt.expr_list();
    let paramsBefore = traverseContext.parameters.length;
    expr_list.forEach((expr, index) => {
        paramsBefore = traverseContext.parameters.length;
        const exprType = traverse_expr(expr, Object.assign(Object.assign({}, traverseContext), { fromColumns }));
        if (!update_stmt.WHERE_() || expr.start.start < update_stmt.WHERE_().symbol.start) {
            const col = columns[index];
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: col.columnType,
                type2: exprType.type
            });
            traverseContext.parameters.slice(paramsBefore).forEach((param, index) => {
                updateColumns.push(Object.assign(Object.assign({}, param), { notNull: param.notNull && col.notNull }));
            });
        }
        else {
            traverseContext.parameters.slice(paramsBefore).forEach((param, index) => {
                whereParams.push(param);
            });
        }
    });
    const returning_clause = update_stmt.returning_clause();
    const returningColumns = returning_clause ? traverse_returning_clause(returning_clause, Object.assign(Object.assign({}, traverseContext), { fromColumns })) : [];
    const queryResult = {
        queryType: 'Update',
        constraints: traverseContext.constraints,
        columns: updateColumns,
        whereParams: whereParams,
        parameters: traverseContext.parameters,
        returing: returning_clause != null,
        returningColumns
    };
    return queryResult;
}
function traverse_delete_stmt(delete_stmt, traverseContext) {
    const table_name = delete_stmt.qualified_table_name().getText();
    const fromColumns = (0, select_columns_1.filterColumns)(traverseContext.dbSchema, [], '', (0, select_columns_1.splitName)(table_name));
    const expr = delete_stmt.expr();
    traverse_expr(expr, Object.assign(Object.assign({}, traverseContext), { fromColumns }));
    const returning_clause = delete_stmt.returning_clause();
    const returningColumns = returning_clause ? traverse_returning_clause(returning_clause, Object.assign(Object.assign({}, traverseContext), { fromColumns })) : [];
    const queryResult = {
        queryType: 'Delete',
        constraints: traverseContext.constraints,
        parameters: traverseContext.parameters,
        returningColumns,
        returing: returning_clause != null
    };
    return queryResult;
}
function getAllColumns(expr) {
    const columns = [];
    if (expr.ASSIGN()) {
        const expr1 = expr.expr(0);
        const expr2 = expr.expr(1);
        columns.push((0, select_columns_1.splitName)(expr1.getText()));
        columns.push((0, select_columns_1.splitName)(expr2.getText()));
    }
    return columns;
}
function filterUsingFields(fields, usingFields) {
    const result = fields.filter((field) => !usingFields.includes(field.columnName));
    return result;
}
function getParamsIndexes(parameters, paramsIds) {
    const map = new Map();
    parameters.forEach((param, index) => {
        map.set(param.paramIndex, index);
    });
    return paramsIds.map((id) => map.get(id));
}
function getWhereFragmentExpressions(whereExpr) {
    const exprList = [];
    const likeExpr = whereExpr.LIKE_();
    if (likeExpr) {
        addExpr(exprList, likeExpr.parentCtx);
    }
    if (!whereExpr.LIKE_()) {
        exprList.push(...whereExpr.expr_list());
    }
    return exprList;
}
function addExpr(exprList, parentCtx) {
    if (parentCtx instanceof sqlite_1.ExprContext) {
        exprList.push(parentCtx);
    }
}
//# sourceMappingURL=traverse.js.map