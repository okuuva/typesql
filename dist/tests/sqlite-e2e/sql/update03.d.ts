import type { Database } from 'better-sqlite3';
export type Update03Data = {
    param1: number | null;
};
export type Update03Params = {
    param1: number;
};
export type Update03Result = {
    id: number;
    value?: number;
};
export declare function update03(db: Database, data: Update03Data, params: Update03Params): Update03Result;
//# sourceMappingURL=update03.d.ts.map