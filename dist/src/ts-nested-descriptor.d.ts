import type { NestedResultInfo } from './describe-nested-query';
import { type TsType } from './mysql-mapping';
import type { ColumnInfo } from './mysql-query-analyzer/types';
import type { RelationField2 } from './sqlite-query-analyzer/sqlite-describe-nested-query';
export type TsField = {
    type: 'field';
    name: string;
    index: number;
    tsType: TsType;
    notNull: boolean;
};
export type TsField2 = {
    name: string;
    index: number;
    tsType: TsType;
    notNull: boolean;
};
export type TsRelationField = {
    type: 'relation';
    list: boolean;
    name: string;
    tsType: string;
    notNull: boolean;
};
export type TsRelationField2 = {
    list: boolean;
    name: string;
    tsType: string;
    notNull: boolean;
};
export type FieldType = TsField | TsRelationField;
export type RelationType = {
    name: string;
    groupKeyIndex: number;
    fields: FieldType[];
};
export type RelationType2 = {
    name: string;
    groupIndex: number;
    fields: TsField2[];
    relations: TsRelationField2[];
};
export type NestedTsDescriptor = {
    relations: RelationType[];
};
export type NestedTsDescriptor2 = {
    relations: RelationType2[];
};
export declare function createNestedTsDescriptor(columns: ColumnInfo[], nestedResultInfo: NestedResultInfo): NestedTsDescriptor;
export declare function mapToTsRelation2(relationField: RelationField2): TsRelationField2;
//# sourceMappingURL=ts-nested-descriptor.d.ts.map