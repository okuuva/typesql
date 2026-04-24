"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeDynamicQuery = describeDynamicQuery;
exports.describeDynamicQuery2 = describeDynamicQuery2;
const select_columns_1 = require("./mysql-query-analyzer/select-columns");
function describeDynamicQuery(dynamicQueryInfo, namedParameters, orderBy) {
    const { with: withFragments, select, from, where } = dynamicQueryInfo;
    const selectFragments = select.map((fragment, index) => {
        const fragmentResult = {
            fragment: fragment.fragment,
            fragmentWitoutAlias: fragment.fragementWithoutAlias,
            dependOnFields: [index], //remove duplicated
            dependOnParams: [],
            parameters: []
        };
        return fragmentResult;
    });
    const withFragements = withFragments === null || withFragments === void 0 ? void 0 : withFragments.map((fragment) => transformFrom(fragment, withFragments, select, from, where, namedParameters, orderBy));
    const fromFragements = from.map((fragment) => transformFrom(fragment, undefined, select, from, where, namedParameters, orderBy));
    const whereFragements = where.map((fragment) => {
        const params = fragment.dependOnParams.map((paramIndex) => namedParameters[paramIndex]);
        const fragmentResult = {
            fragment: fragment.fragment,
            dependOnFields: [],
            dependOnParams: params,
            parameters: params
        };
        return fragmentResult;
    });
    const result = {
        select: selectFragments,
        from: fromFragements,
        where: whereFragements
    };
    if (withFragements != null && withFragements.length > 0) {
        result.with = withFragements;
    }
    return result;
}
function transformFrom(fragment, withFragments, select, from, where, namedParameters, orderByColumns) {
    if (fragment.relation) {
        addAllChildFields(fragment, from, withFragments);
    }
    const filteredWhere = where.filter((whereFragment) => includeAny(whereFragment.fields, fragment.fields));
    const hasUnconditional = filteredWhere.some((fragment) => fragment.dependOnParams.length === 0);
    if (hasUnconditional) {
        return {
            fragment: fragment.fragment,
            dependOnFields: [],
            dependOnParams: [],
            parameters: fragment.parameters.map((paramIndex) => namedParameters[paramIndex])
        };
    }
    const fieldIndex = select.flatMap((selectField, index) => {
        const found = selectField.dependOn.find((dependsOn) => fragment.dependOn.includes(dependsOn));
        if (found) {
            return index;
        }
        return [];
    });
    const orderBy = orderByColumns.flatMap((orderBy) => {
        const orderByField = (0, select_columns_1.splitName)(orderBy);
        const found = fragment.fields.find((field) => field.name === orderByField.name && (field.table === orderByField.prefix || orderByField.prefix === ''));
        if (found) {
            return orderBy;
        }
        return [];
    });
    const params = filteredWhere.flatMap((fragment) => fragment.dependOnParams).map((paramIndex) => namedParameters[paramIndex]);
    const fragmentResult = {
        fragment: fragment.fragment,
        dependOnFields: fieldIndex,
        dependOnParams: [...new Set(params)],
        parameters: fragment.parameters.map((paramIndex) => namedParameters[paramIndex])
    };
    if (orderBy.length > 0) {
        fragmentResult.dependOnOrderBy = orderBy;
    }
    return fragmentResult;
}
function includeAny(fields, fields2) {
    return fields.some((f) => fields2.find((f2) => f2.field === f.field && f2.table === f.table));
}
function addAllChildFields(currentRelation, select, withFragments) {
    currentRelation.dependOn.push(`${currentRelation.relation}`);
    select.forEach((fragment) => {
        if (fragment.parentRelation === currentRelation.relation) {
            currentRelation.fields.push(...fragment.fields);
            currentRelation.dependOn.push(`${fragment.relation}`);
        }
        withFragments === null || withFragments === void 0 ? void 0 : withFragments.forEach((withFragment) => {
            if (withFragment.parentRelation === fragment.relation) {
                withFragment.fields.push(...fragment.fields);
                withFragment.dependOn.push(`${fragment.relation}`);
            }
        });
    });
}
function describeDynamicQuery2(dynamicQueryInfo, namedParameters, orderByColumns) {
    const { with: withFragments, select, from, where, limitOffset } = dynamicQueryInfo;
    const fromResult = transformFromFragments(from, select, where, orderByColumns);
    const result = {
        with: transformWithFragmnts(withFragments, fromResult),
        select: transformSelectFragments(select, namedParameters),
        from: fromResult,
        where: transformWhereFragments(where)
    };
    if (limitOffset) {
        result.limitOffset = {
            fragment: limitOffset.fragment,
            parameters: limitOffset.parameters.map((paramIndex) => namedParameters[paramIndex])
        };
    }
    return result;
}
function transformSelectFragments(selectFragments, namedParameters) {
    return selectFragments.map((select) => ({
        fragment: select.fragment,
        fragmentWitoutAlias: select.fragmentWitoutAlias,
        parameters: select.parameters.map((paramIndex) => namedParameters[paramIndex])
    }));
}
function transformWithFragmnts(withFragments, fromFragments) {
    return withFragments.map((withFragment) => {
        const fromDependOn = fromFragments.filter((from) => from.relationName === withFragment.relationName);
        const dependOnFields = fromDependOn.flatMap((from) => from.dependOnFields);
        const dependOnOrderBy = fromDependOn.flatMap((from) => from.dependOnOrderBy);
        const fromFragmentResult = {
            fragment: withFragment.fragment,
            relationName: withFragment.relationName,
            dependOnFields,
            dependOnOrderBy,
            parameters: withFragment.parameters
        };
        return fromFragmentResult;
    });
}
function transformFromFragments(fromFragments, selectFragments, whereFragments, orderByColumns) {
    const fromResult = fromFragments.map((from) => {
        const orderBy = orderByColumns.flatMap((orderBy) => {
            const orderByField = (0, select_columns_1.splitName)(orderBy);
            const found = from.fields.find((field) => field === orderByField.name &&
                (from.relationAlias === orderByField.prefix || from.relationName === orderByField.prefix || orderByField.prefix === ''));
            if (found) {
                return orderBy;
            }
            return [];
        });
        const { relationName, relationAlias, parentRelation } = from;
        const fromFragmentResult = {
            fragment: from.fragment,
            relationName: from.relationName,
            relationAlias: from.relationAlias,
            parentRelation: from.parentRelation,
            dependOnFields: getDependOnFields({ relationName, relationAlias, parentRelation }, selectFragments, whereFragments),
            dependOnOrderBy: orderBy,
            parameters: from.parameters
        };
        return fromFragmentResult;
    });
    const withChildren = fromResult.map((parentFrom) => {
        const actualAndChildRelations = fromResult.filter((childFrom) => (childFrom.parentRelation === parentFrom.relationAlias && parentFrom.parentRelation !== '') ||
            childFrom.relationName === parentFrom.relationName);
        const dependOnFields = actualAndChildRelations.flatMap((from) => from.dependOnFields);
        const dependOnOrderBy = actualAndChildRelations.flatMap((from) => from.dependOnOrderBy);
        const result = {
            fragment: parentFrom.fragment,
            relationName: parentFrom.relationName,
            dependOnFields,
            dependOnOrderBy,
            parameters: parentFrom.parameters
        };
        return result;
    });
    return withChildren;
}
function transformWhereFragments(whereFragements) {
    return whereFragements.map((where) => {
        const whereFragmentResult = {
            fragment: where.fragment,
            parameters: where.parameters
        };
        return whereFragmentResult;
    });
}
function getDependOnFields(relationInfo, selectFragments, whereFragments) {
    if (relationInfo.parentRelation === '') {
        //from
        return [];
    }
    if (whereFragments.find(whereFrag => whereFrag.dependOnRelations.includes(relationInfo.relationName)
        || whereFrag.dependOnRelations.includes(relationInfo.relationAlias))) {
        return [];
    }
    const dependOnFields = selectFragments.flatMap((select, index) => {
        if (select.dependOnRelations.includes(relationInfo.relationAlias)) {
            return index;
        }
        return [];
    });
    return dependOnFields;
}
//# sourceMappingURL=describe-dynamic-query.js.map