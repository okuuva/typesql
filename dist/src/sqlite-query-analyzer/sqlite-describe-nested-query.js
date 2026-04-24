"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeNestedQuery = describeNestedQuery;
const Either_1 = require("fp-ts/lib/Either");
function describeNestedQuery(columns, relations) {
    const isJunctionTableMap = new Map();
    const parentRef = new Map();
    for (const relation of relations) {
        const isJunctionTableResult = isJunctionTable(relation, relations, columns);
        const relationId = relation.alias || relation.name;
        isJunctionTableMap.set(relationId, isJunctionTableResult);
        parentRef.set(relationId, relation);
    }
    const filterJunctionTables = relations.filter((relation) => !isJunctionTableMap.get(relation.alias || relation.name));
    const result = [];
    for (const [index, relation] of filterJunctionTables.entries()) {
        const parent = isJunctionTableMap.get(relation.parentRelation) ? parentRef.get(relation.parentRelation) : undefined;
        const groupIndex = columns.findIndex((col) => col.name.toLowerCase() === relation.joinColumn.toLowerCase() && (col.table === relation.name || col.table === relation.alias));
        if (groupIndex === -1) {
            const error = {
                name: 'Error during nested result creation',
                description: `Must select the join column: ${relation.alias || relation.name}.${relation.joinColumn}`
            };
            return (0, Either_1.left)(error);
        }
        const relationInfo = {
            groupIndex: groupIndex,
            name: relation.renameAs ? relation.alias : relation.name,
            alias: relation.alias,
            fields: columns
                .map((item, index) => ({ item, index }))
                .filter((col) => (parent != null && (col.item.table === parent.name || col.item.table === parent.alias)) ||
                col.item.table === relation.name ||
                col.item.table === relation.alias ||
                (relation.parentRelation === '' && col.item.table === ''))
                .map((col) => ({ name: col.item.name, index: col.index })),
            relations: filterJunctionTables
                .slice(index + 1)
                .filter((child) => {
                const parent = isJunctionTableMap.get(child.parentRelation) ? parentRef.get(child.parentRelation) : relation;
                return child.parentRelation === parent.name || (child.alias !== '' && child.parentRelation === parent.alias);
            })
                .map((relation) => {
                const fields = columns.filter(col => col.table === relation.name || col.table === relation.alias);
                const relationField = {
                    name: relation.renameAs ? relation.alias : relation.name,
                    alias: relation.alias,
                    notNull: fields.some(field => field.notNull),
                    cardinality: isJunctionTableMap.get(relation.parentRelation) ? 'many' : relation.cardinality
                };
                return relationField;
            })
        };
        result.push(relationInfo);
    }
    return (0, Either_1.right)(result);
}
function isJunctionTable(relation, relations, columns) {
    const childRelation = relations.find((r) => r.parentRelation === relation.name || (r.alias !== '' && r.parentRelation === relation.alias));
    const isJunctionTable = relation.cardinality === 'many' && (childRelation === null || childRelation === void 0 ? void 0 : childRelation.parentCardinality) === 'many';
    return isJunctionTable && notIncludeRelationColumns(columns, relation);
}
function notIncludeRelationColumns(columns, relation) {
    const relationColumns = columns.filter(col => col.table === relation.name || col.table === relation.alias);
    return relationColumns.length === 0;
}
//# sourceMappingURL=sqlite-describe-nested-query.js.map