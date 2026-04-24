import type { ParameterNameAndPosition } from '../types';
export declare function replaceListParams(sql: string, listParamPositions: ParameterNameAndPosition[]): string;
export declare function replacePostgresParams(sql: string, paramsIndexes: boolean[], paramsNames: string[]): string;
//# sourceMappingURL=replace-list-params.d.ts.map