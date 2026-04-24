"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupBy = exports.indexGroupBy = void 0;
const indexGroupBy = (array, predicate) => {
    return array.reduce((map, value, index, array) => {
        var _a, _b;
        const key = predicate(value, index, array);
        (_b = (_a = map.get(key)) === null || _a === void 0 ? void 0 : _a.push(index)) !== null && _b !== void 0 ? _b : map.set(key, [index]);
        return map;
    }, new Map());
};
exports.indexGroupBy = indexGroupBy;
const groupBy = (array, predicate) => {
    return array.reduce((map, value, index, array) => {
        var _a, _b;
        const key = predicate(value, index, array);
        (_b = (_a = map.get(key)) === null || _a === void 0 ? void 0 : _a.push(value)) !== null && _b !== void 0 ? _b : map.set(key, [value]);
        return map;
    }, new Map());
};
exports.groupBy = groupBy;
//# sourceMappingURL=util.js.map