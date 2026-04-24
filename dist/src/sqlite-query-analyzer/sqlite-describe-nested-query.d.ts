import { type Either } from 'fp-ts/lib/Either';
import type { Cardinality } from '../describe-nested-query';
import type { TypeSqlError } from '../types';
export type Relation2 = {
    name: string;
    alias: string;
    renameAs: boolean;
    joinColumn: string;
    parentRelation: string;
    cardinality: Cardinality;
    parentCardinality: Cardinality;
};
export type RelationInfo2 = {
    name: string;
    alias: string;
    fields: Field2[];
    groupIndex: number;
    relations: RelationField2[];
};
export type Field2 = {
    name: string;
    index: number;
};
export type RelationField2 = {
    name: string;
    alias: string;
    notNull: boolean;
    cardinality: Cardinality;
};
export type NestedRelation = {
    name: string;
    alias: string;
    fields: Field2[];
    relations?: NestedRelation[];
};
export type ColumnDescription = {
    name: string;
    notNull: boolean;
    intrinsicNotNull?: boolean;
    table?: string;
};
export declare function describeNestedQuery(columns: ColumnDescription[], relations: Relation2[]): Either<TypeSqlError, RelationInfo2[]>;
//# sourceMappingURL=sqlite-describe-nested-query.d.ts.map