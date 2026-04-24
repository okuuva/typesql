import { SchemaDef, TsFieldDescriptor, ParameterDef, MySqlDialect, TypeSqlError } from '../types';
import { type Either } from 'fp-ts/lib/Either';
import CodeBlockWriter from 'code-block-writer';
import { TsDescriptor } from './shared/codegen-util';
export declare function generateTsCodeForMySQL(tsDescriptor: TsDescriptor, fileName: string, crud?: boolean): string;
export declare function getOperator(type: string): "NumericOperator" | "StringOperator";
export declare function writeTypeBlock(writer: CodeBlockWriter, fields: TsFieldDescriptor[], typeName: string, updateCrud: boolean, extraField?: string): void;
export declare function generateTsDescriptor(queryInfo: SchemaDef): TsDescriptor;
export declare function removeDuplicatedParameters(parameters: ParameterDef[]): ParameterDef[];
export declare function hasStringColumn(columns: TsFieldDescriptor[]): boolean;
export declare function hasDateColumn(columns: TsFieldDescriptor[]): boolean;
export declare function replaceOrderByParam(sql: string): string;
export declare function generateTsFileFromContent(client: MySqlDialect, queryName: string, sqlContent: string, crud?: boolean): Promise<Either<TypeSqlError, string>>;
//# sourceMappingURL=mysql2.d.ts.map