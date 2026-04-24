import { PostgresTypeHash } from '../drivers/types';
import { TsType } from '../mysql-mapping';
import { PostgresType } from '../sqlite-query-analyzer/types';
export declare const postgresTypes: PostgresTypeHash;
export declare function _mapColumnType(postgresType: PostgresType, json?: boolean): TsType;
export type PostgresTypeMapper = {
    mapColumnType: (postgresType: PostgresType, json?: boolean) => TsType;
};
export declare const mapper: PostgresTypeMapper;
//# sourceMappingURL=postgres.d.ts.map