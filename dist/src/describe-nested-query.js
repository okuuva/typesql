"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeNestedQuery = describeNestedQuery;
exports.generateNestedInfo = generateNestedInfo;
const MySQLParser_1 = require("@wsporto/typesql-parser/mysql/MySQLParser");
const parse_1 = require("./mysql-query-analyzer/parse");
const select_columns_1 = require("./mysql-query-analyzer/select-columns");
const describe_query_1 = require("./describe-query");
//utility for tests
function describeNestedQuery(sql, dbSchema) {
    const { sql: processedSql } = (0, describe_query_1.preprocessSql)(sql, 'mysql');
    const queryContext = (0, parse_1.parse)(processedSql);
    const queryInfo = (0, parse_1.extractQueryInfo)(sql, dbSchema);
    const columns = queryInfo.kind === 'Select' ? queryInfo.columns : [];
    return generateNestedInfo(queryContext, dbSchema, columns);
}
function generateNestedInfo(queryContext, dbSchema, columns) {
    var _a, _b;
    const selectStatement = (_a = queryContext.simpleStatement()) === null || _a === void 0 ? void 0 : _a.selectStatement();
    if (selectStatement) {
        const queryExpression = selectStatement.queryExpression();
        if (queryExpression) {
            const queryExpressionBody = queryExpression.queryExpressionBody();
            if (queryExpressionBody) {
                const querySpec = queryExpressionBody.querySpecification();
                if (querySpec) {
                    const fromClause = querySpec.fromClause();
                    if (fromClause) {
                        const tableReferences = ((_b = fromClause.tableReferenceList()) === null || _b === void 0 ? void 0 : _b.tableReference_list()) || [];
                        const modelColumns = tableReferences.map((tableRef) => {
                            const nestedResultInfo = {
                                relations: getResult(tableRef, dbSchema, columns)
                            };
                            return nestedResultInfo;
                        });
                        return modelColumns[0];
                    }
                }
            }
        }
    }
    throw Error('generateNestedInfo');
}
function getResult(tableRef, dbSchema, columns) {
    const relations = getRelations(tableRef, dbSchema, columns);
    return relations;
}
function getRelations(tableRef, dbSchema, columns) {
    const relations = [];
    const tableFactor = tableRef.tableFactor();
    const parentList = [];
    if (tableFactor != null) {
        //root
        const tableName = getTableInfoFromTableFactor(tableFactor);
        parentList.push(tableName);
    }
    const joinedTableList = tableRef.joinedTable_list();
    for (const joined of joinedTableList) {
        const onClause = joined.expr();
        const tableName = getTableInfoFromTableJoinedTable(joined);
        const parentRelations = onClause ? getParentRelations(onClause, tableName, parentList) : [];
        const cardinality = onClause ? verifyCardinality(onClause, dbSchema, tableName.name) : '';
        parentList.push(tableName);
        for (const parent of parentRelations) {
            relations.push({
                parent: parent,
                child: tableName,
                cardinality,
                isJunctionTable: false, //will be set later
                junctionChildTable: ''
            });
        }
    }
    for (let index = 0; index < relations.length; index++) {
        const relation = relations[index];
        const [isJunction, childRelationName] = isJunctionTable(relation, relations);
        if (isJunction) {
            relation.isJunctionTable = true;
            relation.junctionChildTable = childRelationName;
            const relationItem = parentList.find((r) => r.name === relation.child.name);
            relationItem.isJunctionTable = true;
        }
    }
    const result = parentList
        .map((r, index) => ({ r, index })) //keep index
        .filter(({ r }) => r.isJunctionTable === false)
        .map(({ r, index }) => {
        const relationFields = relations
            .filter((r2) => r2.parent.name === r.name || (r.alias !== '' && r2.parent.alias === r.alias))
            .map((relation) => {
            //relation many always have not null array (possible empty)
            const nullable = relation.cardinality === 'one' &&
                columns.some((c) => (c.table === relation.child.name || c.table === relation.child.alias) && c.notNull === false);
            const field = {
                type: 'relation',
                name: getRelationName(relation),
                cardinality: relation.cardinality,
                notNull: !nullable
            };
            return field;
        });
        const previousRelation = parentList[index - 1];
        const junctionRelation = (previousRelation === null || previousRelation === void 0 ? void 0 : previousRelation.isJunctionTable) ? previousRelation : undefined;
        const fields = columns
            .map((col, index) => ({ col, index })) //keep index
            .filter(({ col }) => col.table === r.name ||
            col.table === r.alias ||
            (junctionRelation != null && (col.table === (junctionRelation === null || junctionRelation === void 0 ? void 0 : junctionRelation.name) || col.table === (junctionRelation === null || junctionRelation === void 0 ? void 0 : junctionRelation.alias))))
            .map(({ col, index }) => {
            const f = {
                type: 'field',
                name: col.name,
                index: index
            };
            return f;
        });
        const relationInfo = {
            name: r.asSymbol ? r.alias : r.name,
            // tableName: r.name,
            // tableAlias: r.alias,
            groupKeyIndex: columns.findIndex((col) => col.table === r.name || col.table === r.alias),
            columns: fields.concat(relationFields)
        };
        return relationInfo;
    });
    return result;
}
function getRelationName(relation) {
    if (relation.isJunctionTable) {
        return relation.junctionChildTable;
    }
    if (relation.child.asSymbol) {
        return relation.child.alias;
    }
    return relation.child.name;
}
function getParentRelations(onExpr, currentRelation, parentList) {
    const result = [];
    const tokens = getOnClauseTokens(onExpr);
    for (const token of tokens) {
        if (token instanceof MySQLParser_1.SimpleExprColumnRefContext) {
            const fieldName = (0, select_columns_1.splitName)(token.getText());
            if (fieldName.prefix !== currentRelation.alias && fieldName.prefix !== currentRelation.name) {
                const ref = parentList.find((p) => p.name === fieldName.prefix || p.alias === fieldName.prefix);
                result.push(ref);
            }
        }
    }
    return result;
}
function getTableInfoFromTableJoinedTable(joinedTable) {
    const onClause = joinedTable.expr();
    const tableRef = joinedTable.tableReference();
    if (tableRef) {
        const tableFactor = tableRef.tableFactor();
        if (tableFactor) {
            const relationInfo = getTableInfoFromTableFactor(tableFactor);
            return relationInfo;
        }
    }
    throw Error('getTableInfoFromTableJoinedTable');
}
function getTableInfoFromTableFactor(tableFactor) {
    var _a, _b;
    const singleTable = tableFactor.singleTable();
    if (singleTable) {
        const table = singleTable.tableRef().getText();
        const tableAlias = ((_a = singleTable === null || singleTable === void 0 ? void 0 : singleTable.tableAlias()) === null || _a === void 0 ? void 0 : _a.identifier().getText()) || '';
        const asSymbol = ((_b = singleTable === null || singleTable === void 0 ? void 0 : singleTable.tableAlias()) === null || _b === void 0 ? void 0 : _b.AS_SYMBOL()) != null;
        const tableName = (0, select_columns_1.splitName)(table);
        const model = {
            name: tableName.name,
            alias: tableAlias,
            asSymbol,
            isJunctionTable: false //will be checked later
        };
        return model;
    }
    throw Error('createModelFromTableFactor');
}
function isJunctionTable(relation, relations) {
    const parentRelation = relations.find((r) => r.child === relation.parent);
    const childRelation = relations.find((r) => r.parent === relation.child);
    const childRelationCardinality = childRelation === null || childRelation === void 0 ? void 0 : childRelation.cardinality;
    const isJunctionTable = (parentRelation == null || parentRelation.cardinality === 'one') && childRelationCardinality === 'one';
    return [isJunctionTable, childRelation === null || childRelation === void 0 ? void 0 : childRelation.child.name];
}
function verifyCardinality(expr, dbSchema, tableName) {
    const tokens = getOnClauseTokens(expr);
    for (const token of tokens) {
        if (token instanceof MySQLParser_1.SimpleExprColumnRefContext) {
            const fieldName = (0, select_columns_1.splitName)(token.getText());
            const column = (0, select_columns_1.findColumnSchema)(tableName, fieldName.name, dbSchema);
            if (column != null && column.columnKey !== 'PRI' && column.columnKey !== 'UNI') {
                return 'many';
            }
        }
    }
    return 'one';
}
function getOnClauseTokens(expr) {
    const tokens = (0, select_columns_1.getSimpleExpressions)(expr);
    return tokens;
}
//# sourceMappingURL=describe-nested-query.js.map