import type { PostgresSimpleType, SQLiteType } from './sqlite-query-analyzer/types';
export declare enum FlagEnum {
    NOT_NULL = 1,
    PRI_KEY = 2,
    BINARY_FLAG = 128,
    ENUM_FLAG = 256,
    SET_FLAG = 2048
}
export type InferType = MySqlType | SQLiteType | PostgresSimpleType | '?' | 'number' | 'any';
export type DbType = MySqlType | SQLiteType | PostgresSimpleType;
export type MySqlType = 'decimal' | 'decimal[]' | 'tinyint' | 'tinyint[]' | 'smallint' | 'smallint[]' | 'int' | 'int[]' | 'float' | 'float[]' | 'double' | 'double[]' | 'null' | 'timestamp' | 'bigint' | 'bigint[]' | 'mediumint' | 'mediumint[]' | 'date' | 'time' | 'datetime' | 'year' | 'year[]' | 'newdate' | 'varchar' | 'varchar[]' | 'bit' | 'bit[]' | 'timestamp2' | 'datetime2' | 'time2' | 'json' | `enum(${string})` | 'set' | 'tinyblob' | 'mediumblob' | 'longblob' | 'blob' | 'tinytext' | 'mediumtext' | 'longtext' | 'text' | 'varbinary' | 'binary' | 'char' | 'char[]' | 'geometry';
export type TsType = 'string' | 'string[]' | 'number' | 'number[]' | 'boolean' | 'boolean[]' | 'Date' | 'Date[]' | 'Object' | 'Object[]' | 'Uint8Array' | 'ArrayBuffer' | 'ArrayBuffer[]' | 'any' | 'any[]' | 'null';
export declare function checkFlag(flags: number, flag: FlagEnum): boolean;
export declare function convertTypeCodeToMysqlType(typeCode: number, flags: FlagEnum, columnLength: number): MySqlType | string;
type MySqlTypeHash = {
    [a: number]: MySqlType | string;
};
export declare const typesMapping: MySqlTypeHash;
export type MySqlTypeMapper = {
    convertToTsType: (mySqlType: MySqlType | 'any') => TsType;
};
export declare const mapper: MySqlTypeMapper;
export {};
//# sourceMappingURL=mysql-mapping.d.ts.map