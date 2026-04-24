import { TypeSqlConfig } from './types';
export declare function loadConfig(configPath: string): TypeSqlConfig;
export declare function resolveConfig(configPath: string, config: TypeSqlConfig): TypeSqlConfig;
export declare function resolveEnvVars(config: TypeSqlConfig): TypeSqlConfig;
export declare function resolveTsFilePath(sqlPath: string, sqlDir: string, outDir?: string): string;
type ExportMap = Map<string, string[]>;
export declare function buildExportMap(rootDir: string): ExportMap;
export declare function buildExportList(dir: string): string[];
export {};
//# sourceMappingURL=load-config.d.ts.map