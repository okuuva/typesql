import { NotNullInfo } from './traverse';
export declare function getOrderByColumns(fromColumns: NotNullInfo[], selectColumns: NotNullInfo[]): string[];
export type OrderByReplaceResult = {
    sql: string;
    replaced: boolean;
};
export declare function replaceOrderByParamWithPlaceholder(sql: string): OrderByReplaceResult;
export declare function replaceOrderByPlaceholderWithBuildOrderBy(sql: string): string;
//# sourceMappingURL=util.d.ts.map