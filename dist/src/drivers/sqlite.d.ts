import { TsType } from '../mysql-mapping';
import { SQLiteType } from '../sqlite-query-analyzer/types';
import { SQLiteClient } from '../types';
export type SQLiteTypeMapper = {
    mapColumnType: (sqliteType: SQLiteType, client: SQLiteClient) => TsType;
};
export declare const mapper: SQLiteTypeMapper;
//# sourceMappingURL=sqlite.d.ts.map