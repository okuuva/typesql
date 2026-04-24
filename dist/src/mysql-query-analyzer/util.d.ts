export type ParamIndexes = {
    paramName: string;
    indexes: number[];
};
export declare function getParameterIndexes(namedParameters: string[]): ParamIndexes[];
export declare function getPairWise(indexes: number[], func: (cur: number, next: number) => void): void;
//# sourceMappingURL=util.d.ts.map