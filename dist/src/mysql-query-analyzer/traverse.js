"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traverseQueryContext = traverseQueryContext;
exports.traverseInsertStatement = traverseInsertStatement;
exports.traverseDeleteStatement = traverseDeleteStatement;
exports.getUpdateColumns = getUpdateColumns;
exports.traverseQuerySpecification = traverseQuerySpecification;
exports.traverseWithClause = traverseWithClause;
exports.filterColumns = filterColumns;
exports.selectAllColumns = selectAllColumns;
exports.isMultipleRowResult = isMultipleRowResult;
exports.verifyMultipleResult2 = verifyMultipleResult2;
exports.getOrderByColumns = getOrderByColumns;
const MySQLParser_1 = require("@wsporto/typesql-parser/mysql/MySQLParser");
const describe_query_1 = require("../describe-query");
const parse_1 = require("./parse");
const collect_constraints_1 = require("./collect-constraints");
const select_columns_1 = require("./select-columns");
const infer_column_nullability_1 = require("./infer-column-nullability");
const infer_param_nullability_1 = require("./infer-param-nullability");
const util_1 = require("./util");
function traverseQueryContext(queryContext, dbSchema, namedParameters) {
    var _a, _b, _c, _d;
    const constraints = [];
    const parameters = [];
    const traverseContext = {
        constraints,
        dbSchema,
        parameters,
        fromColumns: [],
        subQueryColumns: [],
        subQuery: false,
        where: false,
        withSchema: [],
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
    const selectStatement = (_a = queryContext.simpleStatement()) === null || _a === void 0 ? void 0 : _a.selectStatement();
    if (selectStatement) {
        const typeInfer = traverseSelectStatement(selectStatement, traverseContext, namedParameters);
        return typeInfer;
    }
    const insertStatement = (_b = queryContext.simpleStatement()) === null || _b === void 0 ? void 0 : _b.insertStatement();
    if (insertStatement) {
        return traverseInsertStatement(insertStatement, traverseContext);
    }
    const updateStatement = (_c = queryContext.simpleStatement()) === null || _c === void 0 ? void 0 : _c.updateStatement();
    if (updateStatement) {
        const typeInfer = traverseUpdateStatement(updateStatement, traverseContext, namedParameters);
        return typeInfer;
    }
    const deleteStatement = (_d = queryContext.simpleStatement()) === null || _d === void 0 ? void 0 : _d.deleteStatement();
    if (deleteStatement) {
        const typeInfer = traverseDeleteStatement(deleteStatement, traverseContext);
        return typeInfer;
    }
    throw Error(`traverseSql - not supported: ${queryContext.constructor.name}`);
}
function traverseSelectStatement(selectStatement, traverseContext, namedParameters) {
    const queryExpression = selectStatement.queryExpression();
    if (queryExpression) {
        const result = traverseQueryExpression(queryExpression, traverseContext);
        const orderByParameters = (0, parse_1.extractOrderByParameters)(selectStatement);
        const limitParameters = (0, parse_1.extractLimitParameters)(selectStatement);
        const paramInference = (0, infer_param_nullability_1.inferParamNullabilityQueryExpression)(queryExpression);
        const allParameters = traverseContext.parameters.map((param, index) => {
            const param2 = Object.assign(Object.assign({}, param), { notNull: paramInference[index] });
            return param2;
        });
        const paramIndexes = (0, util_1.getParameterIndexes)(namedParameters.slice(0, allParameters.length)); //for [a, a, b, a] will return a: [0, 1, 3]; b: [2]
        paramIndexes.forEach((paramIndex) => {
            (0, util_1.getPairWise)(paramIndex.indexes, (cur, next) => {
                //for [0, 1, 3] will return [0, 1], [1, 3]
                traverseContext.constraints.push({
                    expression: paramIndex.paramName,
                    type1: allParameters[cur].type,
                    type2: allParameters[next].type
                });
            });
        });
        const isMultiRow = isMultipleRowResult(selectStatement, result.fromColumns);
        const traverseResult = {
            type: 'Select',
            constraints: traverseContext.constraints,
            columns: result.columns,
            parameters: allParameters,
            limitParameters,
            isMultiRow,
            dynamicSqlInfo: traverseContext.dynamicSqlInfo
        };
        const orderByColumns = orderByParameters.length > 0 ? getOrderByColumns(result.fromColumns, result.columns) : undefined;
        if (orderByColumns) {
            traverseResult.orderByColumns = orderByColumns;
        }
        return traverseResult;
    }
    throw Error(`traverseSelectStatement - not supported: ${selectStatement.getText()}`);
}
function traverseInsertStatement(insertStatement, traverseContext) {
    var _a, _b;
    const allParameters = [];
    const paramsNullability = {};
    let exprOrDefaultList = [];
    const valuesContext = (_a = insertStatement.insertFromConstructor()) === null || _a === void 0 ? void 0 : _a.insertValues().valueList().values_list();
    if (valuesContext) {
        exprOrDefaultList = valuesContext.map((valueContext) => {
            var _a;
            return ((_a = valueContext.children) === null || _a === void 0 ? void 0 : _a.filter((valueContext) => valueContext instanceof MySQLParser_1.ExprIsContext || valueContext.getText() === 'DEFAULT')) || [];
        });
    }
    const insertIntoTable = (0, collect_constraints_1.getInsertIntoTable)(insertStatement);
    const fromColumns = traverseContext.dbSchema
        .filter((c) => c.table === insertIntoTable)
        .map((c) => {
        const col = {
            table: c.table,
            columnName: c.column,
            columnType: (0, collect_constraints_1.freshVar)(c.column, c.column_type),
            columnKey: c.columnKey,
            notNull: c.notNull,
            hidden: c.hidden
        };
        return col;
    });
    const insertColumns = (0, collect_constraints_1.getInsertColumns)(insertStatement, fromColumns);
    traverseContext.fromColumns = insertColumns;
    exprOrDefaultList.forEach((exprOrDefault) => {
        exprOrDefault.forEach((expr, index) => {
            const column = insertColumns[index];
            if (expr instanceof MySQLParser_1.ExprContext) {
                const numberParamsBefore = traverseContext.parameters.length;
                const exprType = traverseExpr(expr, traverseContext);
                const paramNullabilityExpr = (0, infer_param_nullability_1.inferParamNullability)(expr);
                traverseContext.parameters.slice(numberParamsBefore).forEach((param) => {
                    paramsNullability[param.type.id] = paramNullabilityExpr.every((n) => n) && column.notNull === true;
                });
                traverseContext.constraints.push({
                    expression: expr.getText(),
                    //TODO - CHANGING ORDER SHOULDN'T AFFECT THE TYPE INFERENCE
                    type1: exprType.kind === 'TypeOperator' ? exprType.types[0] : exprType,
                    type2: (0, collect_constraints_1.freshVar)(column.columnName, column.columnType.type)
                });
            }
            else {
            }
        });
    });
    const updateList = ((_b = insertStatement.insertUpdateList()) === null || _b === void 0 ? void 0 : _b.updateList().updateElement_list()) || [];
    updateList.forEach((updateElement) => {
        const columnName = updateElement.columnRef().getText();
        const field = (0, select_columns_1.splitName)(columnName);
        const expr = updateElement.expr();
        if (expr) {
            const numberParamsBefore = traverseContext.parameters.length;
            const exprType = traverseExpr(expr, traverseContext);
            const column = (0, select_columns_1.findColumn)(field, fromColumns);
            traverseContext.parameters.slice(numberParamsBefore).forEach((param) => {
                paramsNullability[param.type.id] = column.notNull === true;
            });
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: exprType,
                type2: (0, collect_constraints_1.freshVar)(column.columnName, column.columnType.type)
            });
        }
    });
    const insertQueryExpression = insertStatement.insertQueryExpression();
    if (insertQueryExpression) {
        //TODO - REMOVE numberParamsBefore (walk first insertQueryExpression)
        const numberParamsBefore = traverseContext.parameters.length;
        const exprTypes = traverseInsertQueryExpression(insertQueryExpression, traverseContext);
        exprTypes.columns.forEach((type, index) => {
            const column = insertColumns[index];
            if (type.type.kind === 'TypeVar') {
                paramsNullability[type.type.id] = column.notNull === true;
            }
            traverseContext.constraints.push({
                expression: insertQueryExpression.getText(),
                type1: type.type,
                type2: (0, collect_constraints_1.freshVar)(column.columnName, column.columnType.type)
            });
        });
        const paramNullabilityExpr = (0, infer_param_nullability_1.inferParamNullabilityQuery)(insertQueryExpression);
        traverseContext.parameters.slice(numberParamsBefore).forEach((param, index) => {
            if (paramsNullability[param.type.id] == null) {
                paramsNullability[param.type.id] = paramNullabilityExpr[index];
            }
        });
    }
    const typeInfo = (0, collect_constraints_1.generateTypeInfo)(traverseContext.parameters, traverseContext.constraints);
    typeInfo.forEach((param, index) => {
        const paramId = traverseContext.parameters[index].type.id;
        allParameters.push({
            name: `param${allParameters.length + 1}`,
            columnType: (0, describe_query_1.verifyNotInferred)(param),
            notNull: paramsNullability[paramId]
        });
    });
    const typeInferenceResult = {
        type: 'Insert',
        constraints: traverseContext.constraints,
        parameters: allParameters
    };
    return typeInferenceResult;
}
function traverseUpdateStatement(updateStatement, traverseContext, namedParamters) {
    var _a;
    const updateElement = updateStatement.updateList().updateElement_list();
    const withClause = updateStatement.withClause();
    const withSchema = [];
    if (withClause) {
        traverseWithClause(withClause, traverseContext);
    }
    const updateColumns = getUpdateColumns(updateStatement, traverseContext);
    traverseContext.fromColumns = updateColumns;
    const dataTypes = [];
    const whereParameters = [];
    const paramsBefore = traverseContext.parameters.length;
    const whereExpr = (_a = updateStatement.whereClause()) === null || _a === void 0 ? void 0 : _a.expr();
    const paramNullability = (0, infer_param_nullability_1.inferParamNullability)(updateStatement);
    updateElement.forEach((updateElement) => {
        const expr = updateElement.expr();
        if (expr) {
            const paramBeforeExpr = traverseContext.parameters.length;
            const result = traverseExpr(expr, traverseContext);
            const columnName = updateElement.columnRef().getText();
            const field = (0, select_columns_1.splitName)(columnName);
            const column = (0, select_columns_1.findColumn)(field, updateColumns);
            traverseContext.constraints.push({
                expression: updateStatement.getText(),
                type1: result,
                type2: column.columnType //freshVar(column.columnName, )
            });
            traverseContext.parameters.slice(paramBeforeExpr, traverseContext.parameters.length).forEach((param, index) => {
                dataTypes.push({
                    name: namedParamters[paramBeforeExpr + index] || field.name,
                    type: param.type,
                    notNull: column.notNull && paramNullability[index],
                    table: ''
                });
            });
        }
    });
    const paramsAfter = traverseContext.parameters.length;
    if (whereExpr) {
        traverseExpr(whereExpr, traverseContext);
    }
    traverseContext.parameters.slice(0, paramsBefore).forEach((param, index) => {
        whereParameters.push({
            name: namedParamters[index] || `param${whereParameters.length + 1}`,
            type: param.type,
            notNull: paramNullability[index],
            table: ''
        });
    });
    traverseContext.parameters.slice(paramsAfter).forEach((param, index) => {
        whereParameters.push({
            name: namedParamters[paramsAfter + index] || `param${whereParameters.length + 1}`,
            type: param.type,
            notNull: paramNullability[paramsAfter + index],
            table: ''
        });
    });
    const typeInferenceResult = {
        type: 'Update',
        constraints: traverseContext.constraints,
        data: dataTypes,
        parameters: whereParameters
    };
    return typeInferenceResult;
}
function traverseDeleteStatement(deleteStatement, traverseContext) {
    var _a;
    const whereExpr = (_a = deleteStatement.whereClause()) === null || _a === void 0 ? void 0 : _a.expr();
    const deleteColumns = (0, collect_constraints_1.getDeleteColumns)(deleteStatement, traverseContext.dbSchema);
    traverseContext.fromColumns = deleteColumns;
    const allParameters = [];
    if (whereExpr) {
        traverseExpr(whereExpr, traverseContext);
        const typeInfo = (0, collect_constraints_1.generateTypeInfo)(traverseContext.parameters, traverseContext.constraints);
        const paramNullability = (0, infer_param_nullability_1.inferParamNullability)(whereExpr);
        typeInfo.forEach((param, paramIndex) => {
            allParameters.push({
                name: `param${allParameters.length + 1}`,
                columnType: (0, describe_query_1.verifyNotInferred)(param),
                notNull: paramNullability[paramIndex]
            });
        });
    }
    const typeInferenceResult = {
        type: 'Delete',
        constraints: traverseContext.constraints,
        parameters: allParameters
    };
    return typeInferenceResult;
}
function getUpdateColumns(updateStatement, traverseContext) {
    const tableReferences = updateStatement.tableReferenceList().tableReference_list();
    const columns = traverseTableReferenceList(tableReferences, traverseContext, null);
    return columns;
}
function traverseInsertQueryExpression(insertQueryExpression, traverseContext) {
    const queryExpressionOrParens = insertQueryExpression.queryExpressionOrParens();
    return traverseQueryExpressionOrParens(queryExpressionOrParens, traverseContext);
}
function traverseQueryExpressionOrParens(queryExpressionOrParens, traverseContext) {
    const queryExpression = queryExpressionOrParens.queryExpression();
    if (queryExpression) {
        return traverseQueryExpression(queryExpression, traverseContext);
    }
    const queryEpressionParens = queryExpressionOrParens.queryExpressionParens();
    if (queryEpressionParens) {
        return traverseQueryExpressionParens(queryEpressionParens, traverseContext);
    }
    throw Error('walkQueryExpressionOrParens');
}
function traverseQueryExpression(queryExpression, traverseContext, cte, recursiveNames) {
    const withClause = queryExpression.withClause();
    if (withClause) {
        traverseWithClause(withClause, traverseContext);
    }
    let exprResult;
    const queryExpressionBody = queryExpression.queryExpressionBody();
    if (queryExpressionBody) {
        exprResult = traverseQueryExpressionBody(queryExpressionBody, traverseContext, cte, recursiveNames);
    }
    const queryExpressionParens = queryExpression.queryExpressionParens();
    if (queryExpressionParens) {
        exprResult = traverseQueryExpressionParens(queryExpressionParens, traverseContext, cte, recursiveNames);
    }
    const orderByClause = queryExpression.orderClause();
    if (orderByClause) {
        if (orderByClause.getText().toLowerCase() !== 'orderby?') {
            orderByClause
                .orderList()
                .orderExpression_list()
                .forEach((orderByExpr) => {
                traverseExpr(orderByExpr.expr(), Object.assign(Object.assign({}, traverseContext), { fromColumns: exprResult.fromColumns || [] }));
            });
        }
    }
    return exprResult;
}
function traverseQueryExpressionParens(queryExpressionParens, traverseContext, cte, recursiveNames) {
    const queryExpression = queryExpressionParens.queryExpression();
    if (queryExpression) {
        return traverseQueryExpression(queryExpression, traverseContext, cte, recursiveNames);
    }
    const queryExpressionParens2 = queryExpressionParens.queryExpressionParens();
    if (queryExpressionParens2) {
        return traverseQueryExpressionParens(queryExpressionParens, traverseContext, cte, recursiveNames);
    }
    throw Error('walkQueryExpressionParens');
}
function createUnionVar(type, name) {
    const newVar = Object.assign(Object.assign({}, type), { name: name, table: '' });
    return newVar;
}
function traverseQueryExpressionBody(queryExpressionBody, traverseContext, cte, recursiveNames) {
    const allQueries = (0, parse_1.getAllQuerySpecificationsFromSelectStatement)(queryExpressionBody);
    const [first, ...unionQuerySpec] = allQueries;
    const mainQueryResult = traverseQuerySpecification(first, traverseContext);
    const resultTypes = mainQueryResult.columns.map((t, index) => unionQuerySpec.length === 0
        ? t.type
        : createUnionVar(t.type, recursiveNames && recursiveNames.length > 0 ? recursiveNames[index] : t.name)); //TODO mover para traversequeryspecificat?
    if (cte) {
        resultTypes.forEach((col, index) => {
            const withCol = {
                table: cte,
                columnName: col.name,
                columnType: col,
                columnKey: '',
                notNull: mainQueryResult.columns[index].notNull,
                hidden: 0
            };
            traverseContext.withSchema.push(withCol);
        });
    }
    for (let queryIndex = 0; queryIndex < unionQuerySpec.length; queryIndex++) {
        const columnNames = recursiveNames && recursiveNames.length > 0 ? recursiveNames : mainQueryResult.columns.map((col) => col.name);
        const newFromColumns = recursiveNames ? renameFromColumns(mainQueryResult.columns, columnNames) : [];
        const unionQuery = unionQuerySpec[queryIndex];
        const unionResult = traverseQuerySpecification(unionQuery, Object.assign(Object.assign({}, traverseContext), { fromColumns: newFromColumns }));
        resultTypes.forEach((t2, index) => {
            mainQueryResult.columns[index].notNull = mainQueryResult.columns[index].notNull && unionResult.columns[index].notNull;
            traverseContext.constraints.push({
                expression: 'union',
                coercionType: 'Union',
                mostGeneralType: true,
                type1: t2,
                type2: unionResult.columns[index].type
            });
        });
    }
    const resultTypeAndNotNull = resultTypes.map((c, index) => {
        const col = {
            name: resultTypes[index].name,
            type: resultTypes[index],
            notNull: mainQueryResult.columns[index].notNull,
            table: c.table || ''
        };
        return col;
    });
    const result = {
        columns: resultTypeAndNotNull,
        fromColumns: mainQueryResult.fromColumns
    };
    return result;
}
function renameFromColumns(fromColumns, recursiveNames) {
    const newFromColumns = fromColumns.map((col, index) => {
        const newCol = {
            table: '',
            columnName: recursiveNames[index],
            columnType: col.type,
            columnKey: '',
            notNull: col.notNull,
            hidden: col.hidden || 0
        };
        return newCol;
    });
    return newFromColumns;
}
function traverseQuerySpecification(querySpec, traverseContext) {
    const fromClause = querySpec.fromClause();
    const fromColumnsFrom = fromClause ? traverseFromClause(fromClause, traverseContext) : [];
    const allColumns = traverseContext.subQuery ? traverseContext.fromColumns.concat(fromColumnsFrom) : fromColumnsFrom; //(... where id = t1.id)
    const selectItemListResult = traverseSelectItemList(querySpec.selectItemList(), Object.assign(Object.assign({}, traverseContext), { fromColumns: allColumns, subQueryColumns: fromColumnsFrom }));
    const whereClause = querySpec.whereClause();
    //TODO - HAVING, BLAH
    if (whereClause) {
        const whereExpr = whereClause === null || whereClause === void 0 ? void 0 : whereClause.expr();
        traverseExpr(whereExpr, Object.assign(Object.assign({}, traverseContext), { fromColumns: allColumns, subQueryColumns: fromColumnsFrom, where: !traverseContext.subQuery }));
    }
    const columnNullability = (0, infer_column_nullability_1.inferNotNull)(querySpec, traverseContext.dbSchema, allColumns);
    const columns = selectItemListResult.types.map((t, index) => {
        const resultType = {
            name: t.name,
            type: t,
            notNull: columnNullability[index],
            table: t.table || ''
        };
        return resultType;
    });
    const havingClause = querySpec.havingClause();
    if (havingClause) {
        const selectColumns = columns.map((c) => {
            const col = {
                table: '',
                columnName: c.name,
                columnType: c.type,
                columnKey: '',
                notNull: c.notNull,
                hidden: c.hidden || 0
            };
            return col;
        });
        traverseHavingClause(havingClause, Object.assign(Object.assign({}, traverseContext), { fromColumns: selectColumns.concat(fromColumnsFrom) }));
    }
    return {
        columns,
        fromColumns: fromColumnsFrom
    };
}
function traverseWithClause(withClause, traverseContext) {
    //result1, result2
    withClause.commonTableExpression_list().forEach((commonTableExpression) => {
        var _a, _b;
        const cte = commonTableExpression.identifier().getText();
        const recursiveNames = withClause.RECURSIVE_SYMBOL()
            ? ((_a = commonTableExpression
                .columnInternalRefList()) === null || _a === void 0 ? void 0 : _a.columnInternalRef_list().map((t) => t.getText())) || []
            : undefined;
        const subQuery = commonTableExpression.subquery();
        traverseSubquery(subQuery, traverseContext, cte, recursiveNames); //recursive= true??
        (_b = traverseContext.dynamicSqlInfo.with) === null || _b === void 0 ? void 0 : _b.push({
            fragment: `${(0, select_columns_1.extractOriginalSql)(commonTableExpression)}`,
            relation: cte,
            fields: [],
            dependOnFields: [],
            dependOnParams: [],
            parameters: [], //Array.from({ length: paramsAfter - paramBefore }, (x, i) => i + paramBefore),
            dependOn: []
        });
    });
}
function traverseFromClause(fromClause, traverseContext) {
    var _a;
    const tableReferenceList = (_a = fromClause.tableReferenceList()) === null || _a === void 0 ? void 0 : _a.tableReference_list();
    const fromColumns = tableReferenceList ? traverseTableReferenceList(tableReferenceList, traverseContext, null) : [];
    return fromColumns;
}
function traverseTableReferenceList(tableReferenceList, traverseContext, currentFragment) {
    const result = [];
    const fragements = [];
    tableReferenceList.forEach((tab) => {
        const tableFactor = tab.tableFactor();
        if (tableFactor) {
            const paramBefore = traverseContext.parameters.length;
            const fields = traverseTableFactor(tableFactor, traverseContext, currentFragment);
            const paramsAfter = traverseContext.parameters.length;
            result.push(...fields);
            fragements.push({
                fragment: `FROM ${(0, select_columns_1.extractOriginalSql)(tableFactor)}`,
                fields: [], //fields.map(field => ({ field: field.columnName, name: field.columnName, table: field.table })),
                dependOnFields: [],
                dependOnParams: [],
                parameters: Array.from({ length: paramsAfter - paramBefore }, (x, i) => i + paramBefore),
                dependOn: []
            });
        }
        const allJoinedColumns = [];
        let firstLeftJoinIndex = -1;
        tab.joinedTable_list().forEach((joined, index) => {
            var _a, _b;
            if (((_a = joined.innerJoinType()) === null || _a === void 0 ? void 0 : _a.INNER_SYMBOL()) || ((_b = joined.innerJoinType()) === null || _b === void 0 ? void 0 : _b.JOIN_SYMBOL())) {
                firstLeftJoinIndex = -1; //dont need to add notNull = false to joins
            }
            else if (firstLeftJoinIndex === -1) {
                firstLeftJoinIndex = index; //add notNull = false to all joins after the first left join
            }
            const tableReferences = joined.tableReference();
            if (tableReferences) {
                const innerJoinFragment = {
                    fragment: `${(0, select_columns_1.extractOriginalSql)(joined)}`,
                    fields: [],
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: [],
                    dependOn: []
                };
                const usingFields = (0, select_columns_1.extractFieldsFromUsingClause)(joined);
                const paramsBefore = traverseContext.parameters.length;
                const joinedFields = traverseTableReferenceList([tableReferences], traverseContext, innerJoinFragment);
                const paramsAfter = traverseContext.parameters.length;
                //doesn't duplicate the fields of the USING clause. Ex. INNER JOIN mytable2 USING(id);
                const joinedFieldsFiltered = usingFields.length > 0 ? filterUsingFields(joinedFields, usingFields) : joinedFields;
                allJoinedColumns.push(joinedFieldsFiltered);
                innerJoinFragment.fields = [
                    ...joinedFieldsFiltered.map((f) => ({
                        field: f.columnName,
                        table: f.tableAlias || f.table,
                        name: f.columnName
                    }))
                ];
                innerJoinFragment.parameters = Array.from({ length: paramsAfter - paramsBefore }, (x, i) => i + paramsAfter - 1);
                fragements.push(innerJoinFragment);
                const onClause = joined.expr(); //ON expr
                if (onClause) {
                    joinedFieldsFiltered.forEach((field) => {
                        const fieldName = {
                            name: field.columnName,
                            prefix: field.tableAlias || ''
                        };
                        field.notNull = field.notNull || !(0, infer_column_nullability_1.possibleNull)(fieldName, onClause);
                    });
                    //apply inference to the parent join too
                    result.forEach((field) => {
                        const fieldName = {
                            name: field.columnName,
                            prefix: field.tableAlias || ''
                        };
                        field.notNull = field.notNull || !(0, infer_column_nullability_1.possibleNull)(fieldName, onClause);
                    });
                    traverseExpr(onClause, Object.assign(Object.assign({}, traverseContext), { fromColumns: allJoinedColumns.flat().concat(result) }));
                    const columns = (0, select_columns_1.getExpressions)(onClause, MySQLParser_1.SimpleExprColumnRefContext);
                    columns.forEach((columnRef) => {
                        const fieldName = (0, select_columns_1.splitName)(columnRef.expr.getText());
                        if ((innerJoinFragment === null || innerJoinFragment === void 0 ? void 0 : innerJoinFragment.relation) !== fieldName.prefix) {
                            innerJoinFragment.parentRelation = fieldName.prefix;
                        }
                    });
                }
            }
        });
        allJoinedColumns.forEach((joinedColumns, index) => {
            joinedColumns.forEach((field) => {
                if (firstLeftJoinIndex !== -1 && index >= firstLeftJoinIndex) {
                    const newField = Object.assign(Object.assign({}, field), { notNull: false });
                    result.push(newField);
                }
                else {
                    result.push(field);
                }
            });
        });
    });
    if (!traverseContext.subQuery) {
        traverseContext.dynamicSqlInfo.from = fragements;
    }
    return result;
}
function traverseTableFactor(tableFactor, traverseContext, currentFragment) {
    var _a;
    const singleTable = tableFactor.singleTable();
    if (singleTable) {
        return traverseSingleTable(singleTable, traverseContext.dbSchema, traverseContext.withSchema, currentFragment, traverseContext.dynamicSqlInfo.with);
    }
    const derivadTable = tableFactor.derivedTable();
    if (derivadTable) {
        const tableAlias = (_a = derivadTable.tableAlias()) === null || _a === void 0 ? void 0 : _a.identifier().getText();
        if (currentFragment) {
            currentFragment.relation = tableAlias;
        }
        const subQuery = derivadTable.subquery();
        if (subQuery) {
            const subQueryResult = traverseSubquery(subQuery, traverseContext);
            const result = subQueryResult.columns.map((t) => {
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
            return result;
        }
    }
    const tableReferenceListParens = tableFactor.tableReferenceListParens();
    if (tableReferenceListParens) {
        const listParens = traverseTableReferenceListParens(tableReferenceListParens, traverseContext);
        return listParens;
    }
    throw Error(`traverseTableFactor - not supported: ${tableFactor.constructor.name}`);
}
//tableReferenceList | tableReferenceListParens
function traverseTableReferenceListParens(ctx, traverseContext) {
    const tableReferenceList = ctx.tableReferenceList();
    if (tableReferenceList) {
        return traverseTableReferenceList(tableReferenceList.tableReference_list(), traverseContext, null);
    }
    const tableReferenceListParens = ctx.tableReferenceListParens();
    if (tableReferenceListParens) {
        return traverseTableReferenceListParens(tableReferenceListParens, traverseContext);
    }
    throw Error(`traverseTableReferenceListParens - not supported: ${ctx.constructor.name}`);
}
function traverseSingleTable(singleTable, dbSchema, withSchema, currentFragment, withFragments) {
    var _a;
    const table = singleTable === null || singleTable === void 0 ? void 0 : singleTable.tableRef().getText();
    const tableAlias = (_a = singleTable === null || singleTable === void 0 ? void 0 : singleTable.tableAlias()) === null || _a === void 0 ? void 0 : _a.identifier().getText();
    const tableName = (0, select_columns_1.splitName)(table);
    if (currentFragment) {
        currentFragment.relation = tableAlias || tableName.name;
    }
    withFragments === null || withFragments === void 0 ? void 0 : withFragments.forEach((withFragment) => {
        if (withFragment.relation === table) {
            withFragment.parentRelation = tableAlias || tableName.name;
        }
    });
    const fields = filterColumns(dbSchema, withSchema, tableAlias, tableName);
    return fields;
}
function traverseSubquery(subQuery, traverseContext, cte, recursiveNames) {
    const queryExpressionParens = subQuery.queryExpressionParens();
    const queryExpression = queryExpressionParens.queryExpression();
    if (queryExpression) {
        return traverseQueryExpression(queryExpression, Object.assign(Object.assign({}, traverseContext), { subQuery: true }), cte, recursiveNames);
    }
    const queryExpressionParens2 = queryExpressionParens.queryExpressionParens();
    if (queryExpressionParens2) {
        return traverseQueryExpressionParens(queryExpressionParens2, traverseContext);
    }
    throw Error(`traverseSubquery - not expected: ${subQuery.constructor.name}`);
}
function traverseSelectItemList(selectItemList, traverseContext) {
    const listType = [];
    if (selectItemList.MULT_OPERATOR()) {
        traverseContext.fromColumns.forEach((col) => {
            // const columnType = createColumnType(col);
            const tableName = col.tableAlias || col.table;
            listType.push(Object.assign(Object.assign({}, col.columnType), { table: tableName }));
            const fieldFragment = {
                fragment: `${tableName}.${col.columnName}`,
                fragementWithoutAlias: `${tableName}.${col.columnName}`,
                fields: [
                    {
                        field: col.columnName,
                        name: col.columnName,
                        table: tableName
                    }
                ],
                dependOnFields: [],
                dependOnParams: [],
                parameters: [],
                dependOn: [tableName]
            };
            if (!traverseContext.subQuery) {
                traverseContext.dynamicSqlInfo.select.push(fieldFragment);
            }
        });
    }
    selectItemList.selectItem_list().forEach((selectItem) => {
        var _a;
        const tableWild = selectItem.tableWild();
        if (tableWild) {
            if (tableWild.MULT_OPERATOR()) {
                const itemName = (0, select_columns_1.splitName)(selectItem.getText());
                const allColumns = selectAllColumns(itemName.prefix, traverseContext.fromColumns);
                allColumns.forEach((col) => {
                    const columnType = (0, collect_constraints_1.createColumnType)(col);
                    listType.push(columnType);
                });
            }
        }
        const expr = selectItem.expr();
        if (expr) {
            const selectFragment = {
                fragment: `${(0, select_columns_1.extractOriginalSql)(selectItem)}`,
                fragementWithoutAlias: (0, select_columns_1.extractOriginalSql)(expr),
                fields: [],
                dependOnFields: [],
                dependOnParams: [],
                parameters: [],
                dependOn: []
            };
            const exprType = traverseExpr(expr, Object.assign(Object.assign({}, traverseContext), { currentFragement: traverseContext.subQuery ? traverseContext.currentFragement : selectFragment }));
            if (!traverseContext.subQuery) {
                (_a = traverseContext.dynamicSqlInfo.select) === null || _a === void 0 ? void 0 : _a.push(selectFragment);
            }
            // const fields = exprType.kind == 'TypeVar' ? [{ field: exprType.name, table: exprType.table + '', name: getColumnName(selectItem) }] : []
            if (exprType.kind === 'TypeOperator') {
                const subqueryType = exprType.types[0];
                subqueryType.name = (0, select_columns_1.getColumnName)(selectItem);
                listType.push(subqueryType);
            }
            else if (exprType.kind === 'TypeVar') {
                exprType.name = (0, select_columns_1.getColumnName)(selectItem);
                listType.push(Object.assign({}, exprType)); //clone
            }
        }
    });
    const result = {
        kind: 'TypeOperator',
        types: listType
    };
    return result;
}
function traverseHavingClause(havingClause, traverseContext) {
    const havingExpr = havingClause.expr();
    traverseExpr(havingExpr, traverseContext);
}
function traverseExpr(expr, traverseContext) {
    if (expr instanceof MySQLParser_1.ExprIsContext) {
        const boolPri = expr.boolPri();
        let paramsCount = traverseContext.parameters.length;
        const boolPriType = traverseBoolPri(boolPri, traverseContext);
        if (traverseContext.where) {
            const currentFragment = {
                fragment: `AND ${(0, select_columns_1.extractOriginalSql)(expr)}`,
                fields: [],
                dependOnFields: [],
                dependOnParams: [],
                parameters: [],
                dependOn: []
            };
            const paramsRight = (0, select_columns_1.getExpressions)(expr, MySQLParser_1.SimpleExprParamMarkerContext);
            paramsRight.forEach((_) => {
                currentFragment.dependOnParams.push(paramsCount);
                paramsCount++;
            });
            const columnsRef = (0, select_columns_1.getExpressions)(expr, MySQLParser_1.ColumnRefContext);
            columnsRef.forEach((colRef) => {
                const fileName = (0, select_columns_1.splitName)(colRef.expr.getText());
                currentFragment.fields.push({
                    field: fileName.name,
                    name: fileName.name,
                    table: fileName.prefix
                });
            });
            traverseContext.dynamicSqlInfo.where.push(currentFragment);
        }
        return boolPriType;
    }
    if (expr instanceof MySQLParser_1.ExprNotContext) {
        const expr2 = expr.expr();
        if (expr2) {
            return traverseExpr(expr2, traverseContext);
        }
        return (0, collect_constraints_1.freshVar)(expr.getText(), 'tinyint');
    }
    if (expr instanceof MySQLParser_1.ExprAndContext || expr instanceof MySQLParser_1.ExprXorContext || expr instanceof MySQLParser_1.ExprOrContext) {
        const all = [];
        (0, select_columns_1.getTopLevelAndExpr)(expr, all);
        all.forEach((andExpression) => {
            let paramsCount = traverseContext.parameters.length;
            traverseExpr(andExpression.expr, Object.assign(Object.assign({}, traverseContext), { where: false }));
            if (traverseContext.where) {
                const currentFragment = {
                    fragment: `${andExpression.operator} ${(0, select_columns_1.extractOriginalSql)(andExpression.expr)}`,
                    fields: [],
                    dependOnFields: [],
                    dependOnParams: [],
                    parameters: [],
                    dependOn: []
                };
                const paramsRight = (0, select_columns_1.getExpressions)(andExpression.expr, MySQLParser_1.SimpleExprParamMarkerContext);
                paramsRight.forEach((_) => {
                    currentFragment.dependOnParams.push(paramsCount);
                    paramsCount++;
                });
                const columnsRef = (0, select_columns_1.getExpressions)(andExpression.expr, MySQLParser_1.ColumnRefContext);
                columnsRef.forEach((colRef) => {
                    const fileName = (0, select_columns_1.splitName)(colRef.expr.getText());
                    currentFragment.fields.push({
                        field: fileName.name,
                        name: fileName.name,
                        table: fileName.prefix
                    });
                });
                traverseContext.dynamicSqlInfo.where.push(currentFragment);
            }
        });
        return (0, collect_constraints_1.freshVar)(expr.getText(), 'tinyint');
    }
    throw Error(`traverseExpr - not supported: ${expr.getText()}`);
}
function traverseBoolPri(boolPri, traverseContext) {
    if (boolPri instanceof MySQLParser_1.PrimaryExprPredicateContext) {
        const predicate = boolPri.predicate();
        const predicateType = traversePredicate(predicate, traverseContext);
        return predicateType;
    }
    if (boolPri instanceof MySQLParser_1.PrimaryExprIsNullContext) {
        const boolPri2 = boolPri.boolPri();
        traverseBoolPri(boolPri2, traverseContext);
        return (0, collect_constraints_1.freshVar)(boolPri.getText(), 'tinyint');
    }
    if (boolPri instanceof MySQLParser_1.PrimaryExprCompareContext) {
        const compareLeft = boolPri.boolPri();
        const compareRight = boolPri.predicate();
        // let paramsCount = traverseContext.parameters.length;
        const typeLeft = traverseBoolPri(compareLeft, traverseContext);
        const typeRight = traversePredicate(compareRight, traverseContext);
        traverseContext.constraints.push({
            expression: boolPri.getText(),
            type1: typeLeft,
            type2: typeRight
        });
        return (0, collect_constraints_1.freshVar)(boolPri.getText(), 'tinyint');
    }
    if (boolPri instanceof MySQLParser_1.PrimaryExprAllAnyContext) {
        const compareLeft = boolPri.boolPri();
        const compareRight = boolPri.subquery();
        const typeLeft = traverseBoolPri(compareLeft, traverseContext);
        const subQueryResult = traverseSubquery(compareRight, traverseContext);
        traverseContext.constraints.push({
            expression: boolPri.getText(),
            type1: typeLeft,
            type2: {
                kind: 'TypeOperator',
                types: subQueryResult.columns.map((t) => t.type)
            }
        });
        return (0, collect_constraints_1.freshVar)(boolPri.getText(), 'tinyint');
    }
    throw Error(`traverseExpr - not supported: ${boolPri.constructor.name}`);
}
function traversePredicate(predicate, traverseContext) {
    const bitExpr = predicate.bitExpr(0); //TODO - predicate length = 2? [1] == predicateOperations
    const bitExprType = traverseBitExpr(bitExpr, traverseContext);
    const predicateOperations = predicate.predicateOperations();
    if (predicateOperations) {
        const rightType = traversePredicateOperations(predicateOperations, bitExprType, traverseContext);
        if (bitExprType.kind === 'TypeOperator' && rightType.kind === 'TypeOperator') {
            rightType.types.forEach((t, i) => {
                traverseContext.constraints.push({
                    expression: predicateOperations.getText(),
                    type1: t, // ? array of id+id
                    type2: bitExprType.types[i],
                    mostGeneralType: true
                });
            });
        }
        if (bitExprType.kind === 'TypeVar' && rightType.kind === 'TypeOperator') {
            rightType.types.forEach((t, i) => {
                traverseContext.constraints.push({
                    expression: predicateOperations.getText(),
                    type1: bitExprType, // ? array of id+id
                    type2: Object.assign(Object.assign({}, t), { list: true }),
                    mostGeneralType: true
                });
            });
            // return rightType.types[0];
        }
        return bitExprType;
    }
    return bitExprType;
}
function traverseExprList(exprList, traverseContext) {
    const listType = exprList.expr_list().map((item) => {
        const exprType = traverseExpr(item, traverseContext);
        return exprType;
    });
    const type = {
        kind: 'TypeOperator',
        types: listType
    };
    return type;
}
function traverseBitExpr(bitExpr, traverseContext) {
    const simpleExpr = bitExpr.simpleExpr();
    if (simpleExpr) {
        return traverseSimpleExpr(simpleExpr, Object.assign(Object.assign({}, traverseContext), { where: false }));
    }
    if (bitExpr.bitExpr_list().length === 2) {
        const bitExprLeft = bitExpr.bitExpr(0);
        const typeLeftTemp = traverseBitExpr(bitExprLeft, traverseContext);
        const typeLeft = typeLeftTemp.kind === 'TypeOperator' ? typeLeftTemp.types[0] : typeLeftTemp;
        //const newTypeLeft = typeLeft.name == '?'? freshVar('?', 'bigint') : typeLeft;
        const bitExprRight = bitExpr.bitExpr(1);
        const typeRightTemp = traverseBitExpr(bitExprRight, traverseContext);
        //In the expression 'id + (value + 2) + ?' the '(value+2)' is treated as a SimpleExprListContext and return a TypeOperator
        const typeRight = typeRightTemp.kind === 'TypeOperator' ? typeRightTemp.types[0] : typeRightTemp;
        //const newTypeRight = typeRight.name == '?'? freshVar('?', 'bigint') : typeRight;
        const bitExprType = (0, collect_constraints_1.freshVar)(bitExpr.getText(), '?');
        if (typeLeftTemp.kind === 'TypeVar' && typeRightTemp.kind === 'TypeVar' && typeLeftTemp.table === typeRightTemp.table) {
            bitExprType.table = typeLeftTemp.table;
        }
        //PRECISA?
        // traverseContext.constraints.push({
        //     expression: bitExpr.text,
        //     type1: typeLeft,
        //     type2: typeRight,
        //     mostGeneralType: true,
        //     coercionType: 'Sum'
        // })
        // traverseContext.constraints.push({
        //     expression: bitExpr.text,
        //     type1: typeLeft,
        //     type2: typeRight,
        //     mostGeneralType: true,
        //     coercionType: 'Sum'
        // })
        // traverseContext.constraints.push({
        //     expression: bitExpr.text,
        //     type1: bitExprType,
        //     type2: typeRight,
        //     mostGeneralType: true,
        //     coercionType: 'Sum'
        // })
        traverseContext.constraints.push({
            expression: bitExprLeft.getText(),
            type1: bitExprType,
            type2: typeLeft,
            mostGeneralType: true,
            coercionType: 'Sum'
        });
        traverseContext.constraints.push({
            expression: bitExprRight.getText(),
            type1: bitExprType,
            type2: typeRight,
            mostGeneralType: true,
            coercionType: 'Sum'
        });
        // const resultType = freshVar(bitExprRight.text, 'number');
        // traverseContext.constraints.push({
        //     expression: bitExprRight.text,
        //     type1: resultType,
        //     type2: freshVar(bitExprRight.text, 'number'),
        //     mostGeneralType: true,
        //     coercionType: 'Sum'
        // })
        return bitExprType;
    }
    if (bitExpr.INTERVAL_SYMBOL()) {
        const bitExpr2 = bitExpr.bitExpr(0);
        const leftType = traverseBitExpr(bitExpr2, traverseContext);
        const expr = bitExpr.expr(); //expr interval
        traverseExpr(expr, traverseContext);
        traverseContext.constraints.push({
            expression: bitExpr.getText(),
            type1: leftType,
            type2: (0, collect_constraints_1.freshVar)('datetime', 'datetime')
        });
        return (0, collect_constraints_1.freshVar)('datetime', 'datetime');
    }
    throw Error(`traverseBitExpr - not supported: ${bitExpr.constructor.name}`);
}
function traversePredicateOperations(predicateOperations, parentType, traverseContext) {
    if (predicateOperations instanceof MySQLParser_1.PredicateExprInContext) {
        const subquery = predicateOperations.subquery();
        if (subquery) {
            const subQueryResult = traverseSubquery(subquery, traverseContext);
            return {
                kind: 'TypeOperator',
                types: subQueryResult.columns.map((t) => t.type)
            };
        }
        const exprList = predicateOperations.exprList();
        if (exprList) {
            const rightType = traverseExprList(exprList, Object.assign(Object.assign({}, traverseContext), { where: false }));
            return rightType;
        }
    }
    if (predicateOperations instanceof MySQLParser_1.PredicateExprLikeContext) {
        const simpleExpr = predicateOperations.simpleExpr(0);
        const rightType = traverseSimpleExpr(simpleExpr, Object.assign(Object.assign({}, traverseContext), { where: false }));
        traverseContext.constraints.push({
            expression: simpleExpr.getText(),
            type1: parentType,
            type2: rightType
        });
        return rightType;
    }
    if (predicateOperations instanceof MySQLParser_1.PredicateExprBetweenContext) {
        const bitExpr = predicateOperations.bitExpr();
        const predicate = predicateOperations.predicate();
        const bitExprType = traverseBitExpr(bitExpr, traverseContext);
        const predicateType = traversePredicate(predicate, traverseContext);
        traverseContext.constraints.push({
            expression: predicateOperations.getText(),
            type1: parentType,
            type2: bitExprType
        });
        traverseContext.constraints.push({
            expression: predicateOperations.getText(),
            type1: parentType,
            type2: predicateType
        });
        traverseContext.constraints.push({
            expression: predicateOperations.getText(),
            type1: bitExprType,
            type2: predicateType
        });
        return bitExprType;
    }
    throw Error(`Not supported: ${predicateOperations.constructor.name}`);
}
function traverseSimpleExpr(simpleExpr, traverseContext) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    if (simpleExpr instanceof MySQLParser_1.SimpleExprColumnRefContext) {
        const fieldName = (0, select_columns_1.splitName)(simpleExpr.getText());
        const column = (0, select_columns_1.findColumn)(fieldName, traverseContext.fromColumns);
        const typeVar = (0, collect_constraints_1.freshVar)(column.columnName, column.columnType.type, column.tableAlias || column.table);
        traverseContext.constraints.push({
            expression: simpleExpr.getText(),
            type1: typeVar,
            type2: column.columnType,
            mostGeneralType: true
        });
        if (traverseContext.currentFragement != null) {
            if (!traverseContext.subQuery) {
                traverseContext.currentFragement.dependOn.push(column.tableAlias || column.table);
            }
            else {
                const subQueryColumn = (0, select_columns_1.findColumnOrNull)(fieldName, traverseContext.subQueryColumns);
                if (subQueryColumn == null) {
                    traverseContext.currentFragement.dependOn.push(column.tableAlias || column.table);
                }
            }
        }
        return typeVar;
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprParamMarkerContext) {
        const param = (0, collect_constraints_1.freshVar)('?', '?');
        traverseContext.parameters.push({
            name: param.name,
            type: param,
            notNull: false,
            table: param.table || '',
            paramIndex: simpleExpr.start.start
        });
        return param;
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprLiteralContext) {
        const literal = simpleExpr.literal();
        if (literal.textLiteral()) {
            const text = ((_a = literal.textLiteral()) === null || _a === void 0 ? void 0 : _a.getText().slice(1, -1)) || ''; //remove quotes
            return (0, collect_constraints_1.freshVar)(text, 'varchar');
        }
        const numLiteral = literal.numLiteral();
        if (numLiteral) {
            return (0, collect_constraints_1.freshVar)(numLiteral.getText(), 'int');
            // addNamedNode(simpleExpr, freshVar('bigint', 'bigint'), namedNodes)
            // if(numLiteral.INT_NUMBER()) {
            //     const typeInt = freshVar('int', 'int');
            //     addNamedNode(simpleExpr, typeInt, namedNodes)
            // }
            // if(numLiteral.DECIMAL_NUMBER()) {
            //     const typeDecimal = freshVar('decimal', 'decimal');
            //     addNamedNode(simpleExpr, typeDecimal, namedNodes)
            // }
            // if(numLiteral.FLOAT_NUMBER()) {
            //     const typeFloat = freshVar('float', 'float');
            //     addNamedNode(simpleExpr, typeFloat, namedNodes)
            // }
        }
        const boolLiteral = literal.boolLiteral();
        if (boolLiteral) {
            return (0, collect_constraints_1.freshVar)(boolLiteral.getText(), 'bit');
        }
        const nullLiteral = literal.nullLiteral();
        if (nullLiteral) {
            return (0, collect_constraints_1.freshVar)(nullLiteral.getText(), '?');
        }
        throw Error(`literal not supported:${literal.getText()}`);
        //...
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprListContext) {
        const exprList = simpleExpr.exprList();
        const listType = exprList.expr_list().map((item) => {
            const exprType = traverseExpr(item, Object.assign(Object.assign({}, traverseContext), { where: false }));
            return exprType;
        });
        const resultType = {
            kind: 'TypeOperator',
            types: listType
        };
        return resultType;
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprSubQueryContext) {
        const subquery = simpleExpr.subquery();
        const subqueryResult = traverseSubquery(subquery, traverseContext);
        return {
            kind: 'TypeOperator',
            types: subqueryResult.columns.map((t) => (Object.assign(Object.assign({}, t.type), { table: '' })))
        };
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprCaseContext) {
        //case when expr then expr else expr
        const caseType = (0, collect_constraints_1.freshVar)(simpleExpr.getText(), '?');
        simpleExpr.whenExpression_list().forEach((whenExprCont) => {
            const whenExpr = whenExprCont.expr();
            const whenType = traverseExpr(whenExpr, traverseContext);
            traverseContext.constraints.push({
                expression: whenExpr.getText(),
                type1: whenType.kind === 'TypeOperator' ? whenType.types[0] : whenType,
                type2: (0, collect_constraints_1.freshVar)('tinyint', 'tinyint') //bool
            });
        });
        const thenTypes = simpleExpr.thenExpression_list().map((thenExprCtx) => {
            const thenExpr = thenExprCtx.expr();
            const thenType = traverseExpr(thenExpr, traverseContext);
            traverseContext.constraints.push({
                expression: thenExprCtx.getText(),
                type1: caseType,
                type2: thenType.kind === 'TypeOperator' ? thenType.types[0] : thenType,
                mostGeneralType: true
            });
            return thenType;
        });
        const elseExpr = (_b = simpleExpr.elseExpression()) === null || _b === void 0 ? void 0 : _b.expr();
        if (elseExpr) {
            const elseType = traverseExpr(elseExpr, traverseContext);
            traverseContext.constraints.push({
                expression: (_c = simpleExpr.elseExpression()) === null || _c === void 0 ? void 0 : _c.getText(),
                type1: caseType,
                type2: elseType.kind === 'TypeOperator' ? elseType.types[0] : elseType,
                mostGeneralType: true
            });
            thenTypes.forEach((thenType) => {
                var _a;
                traverseContext.constraints.push({
                    expression: (_a = simpleExpr.elseExpression()) === null || _a === void 0 ? void 0 : _a.getText(),
                    type1: thenType,
                    type2: elseType.kind === 'TypeOperator' ? elseType.types[0] : elseType,
                    mostGeneralType: true
                });
            });
        }
        return caseType;
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprIntervalContext) {
        const exprList = simpleExpr.expr_list();
        const exprLeft = exprList[0];
        const exprRight = exprList[1];
        const typeLeft = traverseExpr(exprLeft, traverseContext);
        const typeRight = traverseExpr(exprRight, traverseContext);
        traverseContext.constraints.push({
            expression: exprLeft.getText(),
            type1: typeLeft,
            type2: (0, collect_constraints_1.freshVar)('bigint', 'bigint')
        });
        if (typeRight.kind === 'TypeVar' && ((0, collect_constraints_1.isDateLiteral)(typeRight.name) || (0, collect_constraints_1.isDateTimeLiteral)(typeRight.name))) {
            typeRight.type = 'datetime';
        }
        traverseContext.constraints.push({
            expression: exprRight.getText(),
            type1: typeRight,
            type2: (0, collect_constraints_1.freshVar)('datetime', 'datetime')
        });
        return (0, collect_constraints_1.freshVar)('datetime', 'datetime');
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprSumContext) {
        const sumExpr = simpleExpr.sumExpr();
        if (sumExpr.MAX_SYMBOL() || sumExpr.MIN_SYMBOL()) {
            const functionType = (0, collect_constraints_1.freshVar)(simpleExpr.getText(), '?');
            const inSumExpr = (_d = sumExpr.inSumExpr()) === null || _d === void 0 ? void 0 : _d.expr();
            if (inSumExpr) {
                const inSumExprType = traverseExpr(inSumExpr, traverseContext);
                traverseContext.constraints.push({
                    expression: simpleExpr.getText(),
                    type1: functionType,
                    type2: inSumExprType,
                    mostGeneralType: true
                });
            }
            return functionType;
        }
        if (sumExpr.COUNT_SYMBOL()) {
            const functionType = (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'bigint');
            const inSumExpr = (_e = sumExpr.inSumExpr()) === null || _e === void 0 ? void 0 : _e.expr();
            if (inSumExpr) {
                traverseExpr(inSumExpr, traverseContext);
            }
            return functionType;
        }
        if (sumExpr.SUM_SYMBOL() || sumExpr.AVG_SYMBOL()) {
            const functionType = (0, collect_constraints_1.freshVar)(simpleExpr.getText(), '?');
            const inSumExpr = (_f = sumExpr.inSumExpr()) === null || _f === void 0 ? void 0 : _f.expr();
            if (inSumExpr) {
                const inSumExprType = traverseExpr(inSumExpr, traverseContext);
                traverseContext.constraints.push({
                    expression: simpleExpr.getText(),
                    type1: functionType,
                    type2: inSumExprType,
                    mostGeneralType: true,
                    coercionType: 'SumFunction'
                });
                if (inSumExprType.kind === 'TypeVar') {
                    functionType.table = inSumExprType.table;
                }
            }
            return functionType;
        }
        if (sumExpr.GROUP_CONCAT_SYMBOL()) {
            const exprList = sumExpr.exprList();
            if (exprList) {
                exprList.expr_list().map((item) => {
                    const exprType = traverseExpr(item, traverseContext);
                    return exprType;
                });
                /*
                The result type is TEXT or BLOB unless group_concat_max_len is less than or equal to 512,
                in which case the result type is VARCHAR or VARBINARY.
                */
                //TODO - Infer TEXT/BLOB or VARCHAR/VARBINARY
                return (0, collect_constraints_1.freshVar)(sumExpr.getText(), 'varchar');
            }
        }
        throw Error(`Expression not supported: ${sumExpr.constructor.name}`);
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprRuntimeFunctionContext) {
        const runtimeFunctionCall = simpleExpr.runtimeFunctionCall();
        if (runtimeFunctionCall.NOW_SYMBOL()) {
            return (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'datetime');
        }
        if (runtimeFunctionCall.CURDATE_SYMBOL()) {
            return (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'date');
        }
        if (runtimeFunctionCall.CURTIME_SYMBOL()) {
            return (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'time');
        }
        if (runtimeFunctionCall.REPLACE_SYMBOL()) {
            const exprList = runtimeFunctionCall.expr_list();
            exprList.forEach((expr) => {
                const exprType = traverseExpr(expr, traverseContext);
                traverseContext.constraints.push({
                    expression: expr.getText(),
                    type1: exprType,
                    type2: (0, collect_constraints_1.freshVar)('varchar', 'varchar')
                });
            });
            return (0, collect_constraints_1.freshVar)('varchar', 'varchar');
        }
        if (runtimeFunctionCall.YEAR_SYMBOL() || runtimeFunctionCall.MONTH_SYMBOL() || runtimeFunctionCall.DAY_SYMBOL()) {
            const expr = (_g = runtimeFunctionCall.exprWithParentheses()) === null || _g === void 0 ? void 0 : _g.expr();
            if (expr) {
                const paramType = traverseExpr(expr, traverseContext);
                if (paramType.kind === 'TypeVar' && (0, collect_constraints_1.isDateTimeLiteral)(paramType.name)) {
                    paramType.type = 'datetime';
                }
                if (paramType.kind === 'TypeVar' && (0, collect_constraints_1.isDateLiteral)(paramType.name)) {
                    paramType.type = 'date';
                }
                traverseContext.constraints.push({
                    expression: expr.getText(),
                    type1: paramType,
                    type2: (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'date')
                });
            }
            const returnType = runtimeFunctionCall.YEAR_SYMBOL() ? 'year' : 'tinyint';
            return (0, collect_constraints_1.freshVar)(simpleExpr.getText(), returnType);
        }
        if (runtimeFunctionCall.DATE_SYMBOL()) {
            const expr = (_h = runtimeFunctionCall.exprWithParentheses()) === null || _h === void 0 ? void 0 : _h.expr();
            if (expr) {
                const paramType = traverseExpr(expr, traverseContext);
                if (paramType.kind === 'TypeVar' && (0, collect_constraints_1.isDateTimeLiteral)(paramType.name)) {
                    paramType.type = 'datetime';
                }
                if (paramType.kind === 'TypeVar' && (0, collect_constraints_1.isDateLiteral)(paramType.name)) {
                    paramType.type = 'date';
                }
                traverseContext.constraints.push({
                    expression: expr.getText(),
                    type1: paramType,
                    type2: (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'date')
                });
            }
            return (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'date');
        }
        if (runtimeFunctionCall.HOUR_SYMBOL() || runtimeFunctionCall.MINUTE_SYMBOL() || runtimeFunctionCall.SECOND_SYMBOL()) {
            const expr = (_j = runtimeFunctionCall.exprWithParentheses()) === null || _j === void 0 ? void 0 : _j.expr();
            if (expr) {
                const paramType = traverseExpr(expr, traverseContext);
                if (paramType.kind === 'TypeVar' && (0, collect_constraints_1.isTimeLiteral)(paramType.name)) {
                    paramType.type = 'time';
                }
                if (paramType.kind === 'TypeVar' && (0, collect_constraints_1.isDateLiteral)(paramType.name)) {
                    paramType.type = 'date';
                }
                if (paramType.kind === 'TypeVar' && (0, collect_constraints_1.isDateTimeLiteral)(paramType.name)) {
                    paramType.type = 'datetime';
                }
                traverseContext.constraints.push({
                    expression: expr.getText(),
                    type1: paramType,
                    type2: (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'time')
                });
            }
            //HOUR can return values greater than 23. Ex.: SELECT HOUR('272:59:59');
            //https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html#function_hour
            const returnType = runtimeFunctionCall.HOUR_SYMBOL() ? 'int' : 'tinyint';
            return (0, collect_constraints_1.freshVar)(simpleExpr.getText(), returnType);
        }
        const trimFunction = runtimeFunctionCall.trimFunction();
        if (trimFunction) {
            const exprList = trimFunction.expr_list();
            if (exprList.length === 1) {
                const exprType = traverseExpr(exprList[0], traverseContext);
                traverseContext.constraints.push({
                    expression: exprList[0].getText(),
                    type1: exprType,
                    type2: (0, collect_constraints_1.freshVar)('varchar', 'varchar')
                });
            }
            if (exprList.length === 2) {
                const exprType = traverseExpr(exprList[0], traverseContext);
                const expr2Type = traverseExpr(exprList[1], traverseContext);
                traverseContext.constraints.push({
                    expression: exprList[0].getText(),
                    type1: exprType,
                    type2: (0, collect_constraints_1.freshVar)('varchar', 'varchar')
                });
                traverseContext.constraints.push({
                    expression: exprList[1].getText(),
                    type1: expr2Type,
                    type2: (0, collect_constraints_1.freshVar)('varchar', 'varchar')
                });
            }
            return (0, collect_constraints_1.freshVar)('varchar', 'varchar');
        }
        const substringFunction = runtimeFunctionCall.substringFunction();
        if (substringFunction) {
            const exprList = substringFunction.expr_list();
            const varcharParam = (0, collect_constraints_1.freshVar)('varchar', 'varchar');
            const intParam = (0, collect_constraints_1.freshVar)('int', 'int');
            const params = {
                kind: 'FixedLengthParams',
                paramsType: [varcharParam, intParam, intParam]
            };
            traverseExprListParameters(exprList, params, traverseContext);
            return varcharParam;
        }
        if (runtimeFunctionCall.ADDDATE_SYMBOL() ||
            runtimeFunctionCall.DATE_ADD_SYMBOL() ||
            runtimeFunctionCall.SUBDATE_SYMBOL() ||
            runtimeFunctionCall.DATE_SUB_SYMBOL()) {
            //SELECT ADDDATE('2008-01-02', INTERVAL 31 DAY)
            //SELECT ADDDATE('2008-01-02', 31)
            const expr1 = runtimeFunctionCall.expr(0);
            const expr2 = runtimeFunctionCall.expr(1);
            const typeExpr1 = traverseExpr(expr1, traverseContext);
            const typeExpr2 = traverseExpr(expr2, traverseContext);
            if (typeExpr1.kind === 'TypeVar' && ((0, collect_constraints_1.isDateLiteral)(typeExpr1.name) || (0, collect_constraints_1.isDateTimeLiteral)(typeExpr1.name))) {
                typeExpr1.type = 'datetime';
            }
            traverseContext.constraints.push({
                expression: expr1.getText(),
                type1: typeExpr1,
                type2: (0, collect_constraints_1.freshVar)('datetime', 'datetime')
            });
            traverseContext.constraints.push({
                expression: expr2.getText(),
                type1: typeExpr2,
                type2: (0, collect_constraints_1.freshVar)('bigint', 'bigint')
            });
            return (0, collect_constraints_1.freshVar)('datetime', 'datetime');
        }
        if (runtimeFunctionCall.COALESCE_SYMBOL()) {
            const exprList = (_k = runtimeFunctionCall.exprListWithParentheses()) === null || _k === void 0 ? void 0 : _k.exprList().expr_list();
            if (exprList) {
                const paramType = (0, collect_constraints_1.freshVar)('COALESCE', 'any');
                const params = {
                    kind: 'VariableLengthParams',
                    paramType: '?'
                };
                const paramsTypeList = traverseExprListParameters(exprList, params, traverseContext);
                paramsTypeList.forEach((typeVar, paramIndex) => {
                    traverseContext.constraints.push({
                        expression: `${runtimeFunctionCall.getText()}_param${paramIndex + 1}`,
                        type1: paramType,
                        type2: typeVar,
                        mostGeneralType: true,
                        coercionType: 'Coalesce'
                    });
                });
                return paramType;
            }
        }
        //MOD (number, number): number
        if (runtimeFunctionCall.MOD_SYMBOL()) {
            const functionType = (0, collect_constraints_1.freshVar)('number', 'number');
            const exprList = runtimeFunctionCall.expr_list();
            const param1 = traverseExpr(exprList[0], traverseContext);
            const param2 = traverseExpr(exprList[1], traverseContext);
            traverseContext.constraints.push({
                expression: simpleExpr.getText(),
                type1: (0, collect_constraints_1.freshVar)('number', 'number'),
                type2: param1,
                mostGeneralType: true,
                coercionType: 'Numeric'
            });
            traverseContext.constraints.push({
                expression: simpleExpr.getText(),
                type1: (0, collect_constraints_1.freshVar)('number', 'number'),
                type2: param2,
                mostGeneralType: true,
                coercionType: 'Numeric'
            });
            traverseContext.constraints.push({
                expression: simpleExpr.getText(),
                type1: functionType,
                type2: param1,
                mostGeneralType: true
            });
            traverseContext.constraints.push({
                expression: simpleExpr.getText(),
                type1: functionType,
                type2: param2,
                mostGeneralType: true
            });
            return functionType;
        }
        if (runtimeFunctionCall.IF_SYMBOL()) {
            const exprList = runtimeFunctionCall.expr_list();
            const expr1 = exprList[0];
            const expr2 = exprList[1];
            const expr3 = exprList[2];
            traverseExpr(expr1, traverseContext);
            const expr2Type = traverseExpr(expr2, traverseContext);
            const expr3Type = traverseExpr(expr3, traverseContext);
            traverseContext.constraints.push({
                expression: runtimeFunctionCall.getText(),
                type1: expr2Type,
                type2: expr3Type,
                mostGeneralType: true
            });
            return expr2Type;
        }
        throw Error(`Function not supported: ${runtimeFunctionCall.getText()}`);
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprFunctionContext) {
        const functionIdentifier = (0, collect_constraints_1.getFunctionName)(simpleExpr);
        if (functionIdentifier === 'concat_ws' || (functionIdentifier === null || functionIdentifier === void 0 ? void 0 : functionIdentifier.toLowerCase()) === 'concat') {
            const varcharType = (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'varchar');
            const params = {
                kind: 'VariableLengthParams',
                paramType: 'varchar'
            };
            walkFunctionParameters(simpleExpr, params, traverseContext);
            return varcharType;
        }
        if (functionIdentifier === 'avg') {
            const functionType = (0, collect_constraints_1.freshVar)(simpleExpr.getText(), '?');
            traverseContext.constraints.push({
                expression: simpleExpr.getText(),
                type1: functionType,
                type2: (0, collect_constraints_1.freshVar)('decimal', 'decimal'),
                mostGeneralType: true
            });
            const params = {
                kind: 'FixedLengthParams',
                paramsType: [functionType]
            };
            walkFunctionParameters(simpleExpr, params, traverseContext);
            return functionType;
        }
        if (functionIdentifier === 'round') {
            const functionType = (0, collect_constraints_1.freshVar)(simpleExpr.getText(), '?');
            const params = {
                kind: 'FixedLengthParams',
                paramsType: [functionType]
            };
            const paramsType = walkFunctionParameters(simpleExpr, params, traverseContext);
            //The return value has the same type as the first argument
            traverseContext.constraints.push({
                expression: simpleExpr.getText(),
                type1: functionType,
                type2: paramsType[0], //type of the first parameter
                mostGeneralType: true
            });
            return functionType;
        }
        if (functionIdentifier === 'floor') {
            const doubleParam = (0, collect_constraints_1.freshVar)('double', 'double');
            const params = {
                kind: 'FixedLengthParams',
                paramsType: [doubleParam, doubleParam]
            };
            walkFunctionParameters(simpleExpr, params, traverseContext);
            return (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'bigint');
        }
        if (functionIdentifier === 'str_to_date') {
            const varcharParam = (0, collect_constraints_1.freshVar)('varchar', 'varchar');
            const params = {
                kind: 'FixedLengthParams',
                paramsType: [varcharParam, varcharParam]
            };
            walkFunctionParameters(simpleExpr, params, traverseContext);
            return (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'date');
        }
        if (functionIdentifier === 'datediff') {
            const udfExprList = (_l = simpleExpr.functionCall().udfExprList()) === null || _l === void 0 ? void 0 : _l.udfExpr_list();
            if (udfExprList) {
                udfExprList.forEach((inExpr) => {
                    const expr = inExpr.expr();
                    const exprType = traverseExpr(expr, traverseContext);
                    const newType = (0, collect_constraints_1.verifyDateTypesCoercion)(exprType);
                    traverseContext.constraints.push({
                        expression: expr.getText(),
                        type1: newType,
                        type2: (0, collect_constraints_1.freshVar)('date', 'date'),
                        mostGeneralType: true
                    });
                });
            }
            return (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'bigint');
        }
        if (functionIdentifier === 'period_add' || functionIdentifier === 'period_diff') {
            const udfExprList = (_m = simpleExpr.functionCall().udfExprList()) === null || _m === void 0 ? void 0 : _m.udfExpr_list();
            if (udfExprList) {
                udfExprList.forEach((inExpr) => {
                    const expr = inExpr.expr();
                    const exprType = traverseExpr(expr, traverseContext);
                    traverseContext.constraints.push({
                        expression: expr.getText(),
                        type1: exprType,
                        type2: (0, collect_constraints_1.freshVar)('bigint', 'bigint'),
                        mostGeneralType: true
                    });
                });
            }
            return (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'bigint');
        }
        if (functionIdentifier === 'lpad' || functionIdentifier === 'rpad') {
            const varcharParam = (0, collect_constraints_1.freshVar)('varchar', 'varchar');
            const intParam = (0, collect_constraints_1.freshVar)('int', 'int');
            const params = {
                kind: 'FixedLengthParams',
                paramsType: [varcharParam, intParam, varcharParam]
            };
            walkFunctionParameters(simpleExpr, params, traverseContext);
            return varcharParam;
        }
        if (functionIdentifier === 'lower' ||
            functionIdentifier === 'lcase' ||
            functionIdentifier === 'upper' ||
            functionIdentifier === 'ucase' ||
            functionIdentifier === 'trim' ||
            functionIdentifier === 'ltrim' ||
            functionIdentifier === 'rtrim') {
            const varcharParam = (0, collect_constraints_1.freshVar)('varchar', 'varchar');
            const params = {
                kind: 'FixedLengthParams',
                paramsType: [varcharParam]
            };
            walkFunctionParameters(simpleExpr, params, traverseContext);
            return varcharParam;
        }
        if (functionIdentifier === 'length' || functionIdentifier === 'char_length') {
            const varcharParam = (0, collect_constraints_1.freshVar)('varchar', 'varchar');
            const params = {
                kind: 'FixedLengthParams',
                paramsType: [varcharParam]
            };
            walkFunctionParameters(simpleExpr, params, traverseContext);
            return (0, collect_constraints_1.freshVar)('int', 'int');
        }
        if (functionIdentifier === 'abs') {
            const functionType = (0, collect_constraints_1.freshVar)('number', 'number');
            const udfExprList = (_o = simpleExpr.functionCall().udfExprList()) === null || _o === void 0 ? void 0 : _o.udfExpr_list();
            udfExprList === null || udfExprList === void 0 ? void 0 : udfExprList.forEach((expr) => {
                const param1 = traverseExpr(expr.expr(), traverseContext);
                traverseContext.constraints.push({
                    expression: simpleExpr.getText(),
                    type1: functionType,
                    type2: param1,
                    mostGeneralType: true,
                    coercionType: 'Numeric'
                });
            });
            return functionType;
        }
        if (functionIdentifier === 'ceiling' || functionIdentifier === 'ceil') {
            const functionType = (0, collect_constraints_1.freshVar)('number', 'number');
            const udfExprList = (_p = simpleExpr.functionCall().udfExprList()) === null || _p === void 0 ? void 0 : _p.udfExpr_list();
            udfExprList === null || udfExprList === void 0 ? void 0 : udfExprList.forEach((expr) => {
                const param1 = traverseExpr(expr.expr(), traverseContext);
                traverseContext.constraints.push({
                    expression: simpleExpr.getText(),
                    type1: functionType,
                    type2: param1,
                    mostGeneralType: true,
                    coercionType: 'Ceiling'
                });
            });
            return functionType;
        }
        if (functionIdentifier === 'timestampdiff') {
            const udfExprList = (_q = simpleExpr.functionCall().udfExprList()) === null || _q === void 0 ? void 0 : _q.udfExpr_list();
            if (udfExprList) {
                const [first, ...rest] = udfExprList;
                const unit = first.getText().trim().toLowerCase();
                rest.forEach((inExpr) => {
                    const expr = inExpr.expr();
                    const exprType = traverseExpr(expr, traverseContext);
                    const newType = (0, collect_constraints_1.verifyDateTypesCoercion)(exprType);
                    //const expectedType = ['hour', 'minute', 'second'].includes(unit)? 'time' : 'datetime'
                    traverseContext.constraints.push({
                        expression: expr.getText(),
                        type1: newType,
                        type2: (0, collect_constraints_1.freshVar)('datetime', 'datetime'),
                        mostGeneralType: true
                    });
                });
            }
            return (0, collect_constraints_1.freshVar)('int', 'int');
        }
        if (functionIdentifier === 'ifnull' || functionIdentifier === 'nullif') {
            const functionType = (0, collect_constraints_1.freshVar)(simpleExpr.getText(), '?');
            const udfExprList = (_r = simpleExpr.functionCall().udfExprList()) === null || _r === void 0 ? void 0 : _r.udfExpr_list();
            if (udfExprList) {
                const [expr1, expr2] = udfExprList;
                const expr1Type = traverseExpr(expr1.expr(), traverseContext);
                traverseContext.constraints.push({
                    expression: expr1.getText(),
                    type1: functionType,
                    type2: expr1Type
                });
                const expr2Type = traverseExpr(expr2.expr(), traverseContext);
                traverseContext.constraints.push({
                    expression: expr2.getText(),
                    type1: functionType,
                    type2: expr2Type
                });
            }
            return functionType;
        }
        if (functionIdentifier === 'md5' || //md5(str) - TODO - have input constraint = string
            functionIdentifier === 'hex' || //md5(n or str)
            functionIdentifier === 'unhex') {
            //unhex (str) - TODO - have input constraint = string
            const functionType = (0, collect_constraints_1.freshVar)(simpleExpr.getText(), 'char');
            const udfExprList = (_s = simpleExpr.functionCall().udfExprList()) === null || _s === void 0 ? void 0 : _s.udfExpr_list();
            if (udfExprList) {
                const [expr1] = udfExprList;
                const paramType = traverseExpr(expr1.expr(), traverseContext);
                traverseContext.constraints.push({
                    expression: expr1.getText(),
                    type1: paramType,
                    type2: (0, collect_constraints_1.freshVar)(expr1.getText(), 'varchar')
                });
            }
            return functionType;
        }
        throw Error(`Function not supported: ${functionIdentifier}`);
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprWindowingFunctionContext) {
        const windowFunctionCall = simpleExpr.windowFunctionCall();
        return traverseWindowFunctionCall(windowFunctionCall, traverseContext);
    }
    if (simpleExpr instanceof MySQLParser_1.SimpleExprCastContext) {
        const castType = simpleExpr.castType();
        if (castType.CHAR_SYMBOL()) {
            return (0, collect_constraints_1.freshVar)(castType.getText(), 'char');
        }
    }
    throw Error(`traverseSimpleExpr - not supported: ${simpleExpr.constructor.name}`);
}
function traverseWindowFunctionCall(windowFunctionCall, traverseContext) {
    if (windowFunctionCall.ROW_NUMBER_SYMBOL() ||
        windowFunctionCall.RANK_SYMBOL() ||
        windowFunctionCall.DENSE_RANK_SYMBOL() ||
        windowFunctionCall.CUME_DIST_SYMBOL() ||
        windowFunctionCall.PERCENT_RANK_SYMBOL()) {
        return (0, collect_constraints_1.freshVar)(windowFunctionCall.getText(), 'bigint');
    }
    const expr = windowFunctionCall.expr();
    if (expr) {
        return traverseExpr(expr, traverseContext);
    }
    const exprWithParentheses = windowFunctionCall.exprWithParentheses();
    if (exprWithParentheses) {
        const expr = exprWithParentheses.expr();
        return traverseExpr(expr, traverseContext);
    }
    throw Error(`No support for expression${windowFunctionCall.constructor.name}`);
}
function traverseExprListParameters(exprList, params, traverseContext) {
    return exprList.map((expr, paramIndex) => {
        const exprType = traverseExpr(expr, traverseContext);
        const paramType = params.kind === 'FixedLengthParams' ? params.paramsType[paramIndex] : (0, collect_constraints_1.freshVar)(params.paramType, params.paramType);
        traverseContext.constraints.push({
            expression: expr.getText(),
            type1: exprType,
            type2: paramType,
            mostGeneralType: true
        });
        return paramType;
    });
}
function walkFunctionParameters(simpleExprFunction, params, traverseContext) {
    var _a, _b;
    const functionName = (0, collect_constraints_1.getFunctionName)(simpleExprFunction);
    const udfExprList = (_a = simpleExprFunction.functionCall().udfExprList()) === null || _a === void 0 ? void 0 : _a.udfExpr_list();
    if (udfExprList) {
        const paramTypes = udfExprList
            .filter((_, paramIndex) => {
            return functionName === 'timestampdiff' ? paramIndex !== 0 : true; //filter the first parameter of timestampdiff function
        })
            .map((inExpr, paramIndex) => {
            const expr = inExpr.expr();
            const exprType = traverseExpr(expr, traverseContext);
            traverseContext.constraints.push({
                expression: expr.getText(),
                type1: exprType,
                type2: params.kind === 'FixedLengthParams' ? params.paramsType[paramIndex] : (0, collect_constraints_1.freshVar)(params.paramType, params.paramType)
            });
            return exprType;
        });
        return paramTypes;
    }
    const exprList = (_b = simpleExprFunction.functionCall().exprList()) === null || _b === void 0 ? void 0 : _b.expr_list();
    if (exprList) {
        const paramTypes = exprList.map((inExpr, paramIndex) => {
            const inSumExprType = traverseExpr(inExpr, traverseContext);
            traverseContext.constraints.push({
                expression: inExpr.getText(),
                type1: params.kind === 'FixedLengthParams' ? params.paramsType[paramIndex] : (0, collect_constraints_1.freshVar)(params.paramType, params.paramType),
                type2: inSumExprType,
                mostGeneralType: true
            });
            return inSumExprType;
        });
        return paramTypes;
    }
    throw Error('Error in walkFunctionParameters');
}
function filterColumns(dbSchema, withSchema, tableAlias, table) {
    const withResult = withSchema
        .filter((t) => t.table.toLowerCase() === table.name.toLowerCase())
        .map((s) => (Object.assign(Object.assign({}, s), { tableAlias: tableAlias })));
    const tableColumns1 = dbSchema
        .filter((schema) => schema.table.toLowerCase() === table.name.toLowerCase() && (schema.schema === table.prefix || table.prefix === ''))
        .map((tableColumn) => {
        //name and colum are the same on the leaf table
        const r = {
            columnName: tableColumn.column,
            columnType: (0, collect_constraints_1.createColumnTypeFomColumnSchema)(tableColumn),
            notNull: tableColumn.notNull,
            table: table.name,
            tableAlias: tableAlias || '',
            columnKey: tableColumn.columnKey,
            hidden: tableColumn.hidden || 0
        };
        return r;
    });
    const result = tableColumns1.concat(withResult);
    return result;
}
function selectAllColumns(tablePrefix, fromColumns) {
    return fromColumns.filter((column) => {
        if (tablePrefix === '' || tablePrefix === column.tableAlias || tablePrefix === column.table) {
            return true;
        }
        return false;
    });
}
function filterUsingFields(joinedFields, usingFields) {
    return joinedFields.filter((joinedField) => {
        const isUsing = usingFields.includes(joinedField.columnName);
        if (!isUsing) {
            return true;
        }
        return false;
    });
}
function isMultipleRowResult(selectStatement, fromColumns) {
    var _a, _b;
    if (isLimitOne(selectStatement)) {
        return false;
    }
    const querySpecs = (0, parse_1.getAllQuerySpecificationsFromSelectStatement)(selectStatement);
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
                if (!groupBy && (0, parse_1.isSumExpressContext)(expr)) {
                    return false;
                }
            }
        }
        const joinedTable = (_a = fromClause.tableReferenceList()) === null || _a === void 0 ? void 0 : _a.tableReference(0).joinedTable_list();
        if (joinedTable && joinedTable.length > 0) {
            return true;
        }
        const whereClauseExpr = (_b = querySpecs[0].whereClause()) === null || _b === void 0 ? void 0 : _b.expr();
        const isMultipleRowResult = whereClauseExpr && verifyMultipleResult2(whereClauseExpr, fromColumns);
        if (isMultipleRowResult === false) {
            return false;
        }
    }
    return true;
}
function isLimitOne(selectStatement) {
    const limitOptions = (0, parse_1.getLimitOptions)(selectStatement);
    if (limitOptions.length === 1 && limitOptions[0].getText() === '1') {
        return true;
    }
    if (limitOptions.length === 2 && limitOptions[1].getText() === '1') {
        return true;
    }
    return false;
}
function verifyMultipleResult2(exprContext, fromColumns) {
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
        const oneIsSingleResult = exprContext.expr_list().some((expr) => verifyMultipleResult2(expr, fromColumns) === false);
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
function getOrderByColumns(fromColumns, selectColumns) {
    const orderByColumns = [];
    fromColumns.forEach((col) => {
        const ambiguous = isAmbiguous(fromColumns, col.columnName);
        if (!ambiguous) {
            const exists = orderByColumns.find((orderBy) => orderBy === col.columnName);
            if (!exists) {
                orderByColumns.push(col.columnName);
            }
        }
        if (col.tableAlias && col.table) {
            orderByColumns.push(`${col.tableAlias}.${col.columnName}`);
        }
        else if (col.table) {
            orderByColumns.push(`${col.table}.${col.columnName}`);
        }
    });
    selectColumns.forEach((col) => {
        const duplicated = selectColumns.filter((orderBy) => orderBy.name === col.name);
        if (duplicated.length <= 1) {
            const exists = orderByColumns.find((orderBy) => orderBy === col.name);
            if (!exists) {
                orderByColumns.push(col.name);
            }
        }
    });
    return orderByColumns;
}
function isAmbiguous(columns, columnName) {
    const filterByName = columns.filter((col) => col.columnName === columnName);
    return filterByName.length > 1;
}
//# sourceMappingURL=traverse.js.map