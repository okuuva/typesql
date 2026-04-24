"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNestedTsDescriptor = createNestedTsDescriptor;
exports.mapToTsRelation2 = mapToTsRelation2;
const mysql_mapping_1 = require("./mysql-mapping");
function createNestedTsDescriptor(columns, nestedResultInfo) {
    const result = {
        relations: nestedResultInfo.relations.map((r) => mapColumnToNestedField(columns, r))
    };
    return result;
}
function mapColumnToNestedField(columns, modelColumn) {
    const relation = {
        name: modelColumn.name,
        groupKeyIndex: modelColumn.groupKeyIndex,
        fields: modelColumn.columns.map((c) => mapToField(columns, c))
    };
    return relation;
}
function mapToField(columns, field) {
    const fieldType = field.type;
    if (fieldType === 'field') {
        return mapModelColumnToTsField(columns, field);
    }
    if (fieldType === 'relation') {
        return mapModelColumnToTsRelation(field);
    }
    return fieldType;
}
function mapModelColumnToTsField(columns, modelColumn) {
    const column = columns.find((col) => col.name === modelColumn.name);
    const tsType = mysql_mapping_1.mapper.convertToTsType(column.type);
    const field = {
        type: 'field',
        name: modelColumn.name,
        index: modelColumn.index,
        tsType: tsType,
        notNull: column.notNull
    };
    return field;
}
function mapModelColumnToTsRelation(modelColumn) {
    const field = {
        type: 'relation',
        list: modelColumn.cardinality === 'many',
        name: modelColumn.name,
        tsType: modelColumn.name + (modelColumn.cardinality === 'many' ? '[]' : ''),
        notNull: modelColumn.notNull
    };
    return field;
}
function mapToTsRelation2(relationField) {
    const field = {
        list: relationField.cardinality === 'many',
        name: relationField.name,
        tsType: relationField.name + (relationField.cardinality === 'many' ? '[]' : ''),
        notNull: relationField.notNull
    };
    return field;
}
// function mapToRelationList(columnsInfo: ColumnInfo[], columns: ModelColumn[]): RelationType[] {
//     const allRelations = flattenRelations(columns);
//     return allRelations.filter(r => r.columns.length > 0).map(relation => {
//         const type: RelationType = {
//             name: relation.name,
//             //https://stackoverflow.com/a/54317362
//             fields: relation.columns.filter((c): c is Field => c.type == 'field').map(c => {
//                 return mapModelColumnToTsField(columnsInfo, c)
//             })
//         }
//         return type;
//     });
// }
// //https://stackoverflow.com/a/34757676
// function flattenRelations(columns: ModelColumn[], ret: Model[] = []) {
//     for (const column of columns) {
//         if (column.type == 'relation') {
//             flattenRelations(column.columns, ret);
//             ret.push(column);
//         }
//     }
//     return ret;
// }
//# sourceMappingURL=ts-nested-descriptor.js.map