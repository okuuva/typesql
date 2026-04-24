import type { Database } from 'better-sqlite3';
export type Insert03Params = {
    param1: number | null;
};
export type Insert03Result = {
    id: number;
    value?: number;
};
export declare function insert03(db: Database, params: Insert03Params): Insert03Result;
//# sourceMappingURL=insert03.d.ts.map