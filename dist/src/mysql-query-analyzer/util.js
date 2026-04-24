"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParameterIndexes = getParameterIndexes;
exports.getPairWise = getPairWise;
function getParameterIndexes(namedParameters) {
    const hashMap = new Map();
    namedParameters.forEach((param, index) => {
        if (hashMap.has(param)) {
            hashMap.get(param).push(index);
        }
        else {
            hashMap.set(param, [index]);
        }
    });
    const paramIndex = Array.from(hashMap.keys()).map((paramName) => {
        const paramIndexes = {
            paramName,
            indexes: hashMap.get(paramName)
        };
        return paramIndexes;
    });
    return paramIndex;
}
function getPairWise(indexes, func) {
    for (let i = 0; i < indexes.length - 1; i++) {
        func(indexes[i], indexes[i + 1]);
    }
}
//# sourceMappingURL=util.js.map