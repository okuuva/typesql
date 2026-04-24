"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodeBlockWriter = createCodeBlockWriter;
exports.capitalize = capitalize;
exports.convertToCamelCaseName = convertToCamelCaseName;
exports.createTypeNames = createTypeNames;
exports.generateRelationType = generateRelationType;
exports.removeDuplicatedParameters2 = removeDuplicatedParameters2;
exports.renameInvalidNames = renameInvalidNames;
exports.escapeInvalidTsField = escapeInvalidTsField;
exports.hasStringColumn = hasStringColumn;
exports.writeBuildOrderByBlock = writeBuildOrderByBlock;
exports.writeDynamicQueryParamType = writeDynamicQueryParamType;
exports.writeSelectFragements = writeSelectFragements;
exports.writeDynamicQueryOperators = writeDynamicQueryOperators;
exports.writeWhereConditionFunction = writeWhereConditionFunction;
exports.writeWhereConditionsToObjectFunction = writeWhereConditionsToObjectFunction;
exports.writeBuildSqlFunction = writeBuildSqlFunction;
exports.writeMapToResultFunction = writeMapToResultFunction;
exports.writeOrderByToObjectFunction = writeOrderByToObjectFunction;
exports.writeResultType = writeResultType;
exports.writeNestedTypes = writeNestedTypes;
exports.writeCollectFunction = writeCollectFunction;
exports.writeGroupByFunction = writeGroupByFunction;
exports.writeSql = writeSql;
const code_block_writer_1 = __importDefault(require("code-block-writer"));
const camelcase_1 = __importDefault(require("camelcase"));
function createCodeBlockWriter() {
    const writer = new code_block_writer_1.default({
        useTabs: true,
        newLine: '\n'
    });
    return writer;
}
function capitalize(name) {
    return capitalizeStr(name);
}
function convertToCamelCaseName(name) {
    const camelCaseStr = (0, camelcase_1.default)(name);
    return camelCaseStr;
}
function createTypeNames(queryName) {
    const camelCaseName = convertToCamelCaseName(queryName);
    const capitalizedName = capitalize(camelCaseName);
    const dataTypeName = `${capitalizedName}Data`;
    const resultTypeName = `${capitalizedName}Result`;
    const paramsTypeName = `${capitalizedName}Params`;
    const orderByTypeName = `${capitalizedName}OrderBy`;
    const dynamicParamsTypeName = `${capitalizedName}DynamicParams`;
    const selectColumnsTypeName = `${capitalizedName}Select`;
    const whereTypeName = `${capitalizedName}Where`;
    return {
        camelCaseName,
        capitalizedName,
        dataTypeName,
        resultTypeName,
        paramsTypeName,
        orderByTypeName,
        dynamicParamsTypeName,
        selectColumnsTypeName,
        whereTypeName
    };
}
function generateRelationType(functionName, relationName) {
    return `${capitalizeStr(functionName)}Nested${capitalizeStr(relationName)}`;
}
function capitalizeStr(name) {
    if (name.length === 0)
        return name;
    return name.charAt(0).toUpperCase() + name.slice(1);
}
//TODO - remove duplicated code
function removeDuplicatedParameters2(parameters) {
    const columnsCount = new Map();
    parameters.forEach((param) => {
        const dupParam = columnsCount.get(param.name);
        if (dupParam != null) {
            //duplicated - two parameter null and notNull, resturn the null param (notNull == false)
            if (param.notNull === false) {
                columnsCount.set(param.name, param);
            }
            // return param;
        }
        else {
            columnsCount.set(param.name, param);
        }
    });
    return [...columnsCount.values()];
}
function renameInvalidNames(columnNames) {
    const columnsCount = new Map();
    return columnNames.map((columnName) => {
        if (columnsCount.has(columnName)) {
            const count = columnsCount.get(columnName) + 1;
            columnsCount.set(columnName, count);
            const newName = `${columnName}_${count}`;
            return escapeInvalidTsField(newName);
        }
        columnsCount.set(columnName, 1);
        return escapeInvalidTsField(columnName);
    });
}
function escapeInvalidTsField(columnName) {
    const validPattern = /^[a-zA-Z0-9_$]+$/g;
    if (!validPattern.test(columnName)) {
        return `"${columnName}"`;
    }
    return columnName;
}
function hasStringColumn(columns) {
    return columns.some((c) => c.tsType === 'string');
}
function writeBuildOrderByBlock(writer, orderByColumns, orderByTypeName) {
    writer.writeLine(`const orderByColumns = [${orderByColumns.map(col => `'${col}'`).join(', ')}] as const;`);
    writer.blankLine();
    writer.write(`export type ${orderByTypeName} =`).block(() => {
        writer.writeLine('column: typeof orderByColumns[number];');
        writer.writeLine(`direction: 'asc' | 'desc';`);
    });
    writer.blankLine();
    writer.write(`function buildOrderBy(orderBy: ${orderByTypeName}[]): string`).block(() => {
        writer.write('if (!Array.isArray(orderBy) || orderBy.length === 0)').block(() => {
            writer.writeLine(`throw new Error('orderBy must be a non-empty array');`);
        });
        writer.blankLine();
        writer.write('for (const { column, direction } of orderBy)').block(() => {
            writer.write('if (!orderByColumns.includes(column))').block(() => {
                writer.writeLine('throw new Error(`Invalid orderBy column: ${column}`);');
            });
            writer.write(`if (direction !== 'asc' && direction !== 'desc')`).block(() => {
                writer.writeLine('throw new Error(`Invalid orderBy direction: ${direction}`);');
            });
        });
        writer.blankLine();
        writer.writeLine('return orderBy');
        writer.indent().write('.map(({ column, direction }) => `"${column}" ${direction.toUpperCase()}`)').newLine();
        writer.indent().write(`.join(', ');`).newLine();
    });
}
function writeDynamicQueryParamType(writer, queryName, hasParams, orderByField) {
    const { dynamicParamsTypeName, selectColumnsTypeName, paramsTypeName, whereTypeName, orderByTypeName } = createTypeNames(queryName);
    writer.write(`export type ${dynamicParamsTypeName} = `).block(() => {
        writer.writeLine(`select?: ${selectColumnsTypeName};`);
        if (hasParams) {
            writer.writeLine(`params: ${paramsTypeName};`);
        }
        writer.writeLine(`where?: ${whereTypeName}[];`);
        if (orderByField) {
            writer.writeLine(`${orderByField}: ${orderByTypeName}[];`);
        }
    });
}
function writeSelectFragements(writer, selectFragements, columns) {
    writer.write('const selectFragments = ').inlineBlock(() => {
        selectFragements.forEach((fragment, index) => {
            const field = columns[index].name;
            writer.writeLine(`${field}: \`${fragment.fragmentWitoutAlias}\`,`);
        });
    });
    writer.write(' as const;');
}
function writeDynamicQueryOperators(writer, whereTypeName, columns) {
    writer.writeLine(`const NumericOperatorList = ['=', '<>', '>', '<', '>=', '<='] as const;`);
    writer.writeLine('type NumericOperator = typeof NumericOperatorList[number];');
    if (hasStringColumn(columns)) {
        writer.writeLine(`type StringOperator = '=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE';`);
    }
    writer.writeLine(`type SetOperator = 'IN' | 'NOT IN';`);
    writer.writeLine(`type BetweenOperator = 'BETWEEN';`);
    writer.blankLine();
    writer.write(`export type ${whereTypeName} =`).indent(() => {
        for (const col of columns) {
            if (col.tsType === 'string') {
                writer.writeLine(`| { column: '${col.name}'; op: StringOperator; value: ${col.tsType} | null }`);
            }
            else {
                writer.writeLine(`| { column: '${col.name}'; op: NumericOperator; value: ${col.tsType} | null }`);
            }
            writer.writeLine(`| { column: '${col.name}'; op: SetOperator; value: ${col.tsType}[] }`);
            writer.writeLine(`| { column: '${col.name}'; op: BetweenOperator; value: [${col.tsType} | null, ${col.tsType} | null] }`);
        }
    });
}
function writeWhereConditionFunction(writer, whereTypeName, columns) {
    writer.write(`function whereCondition(condition: ${whereTypeName}, placeholder: () => string): WhereConditionResult | null `).block(() => {
        writer.writeLine('const selectFragment = selectFragments[condition.column];');
        writer.writeLine('const { op, value } = condition;');
        writer.blankLine();
        if (hasStringColumn(columns)) {
            writer.write(`if (op === 'LIKE') `).block(() => {
                writer.write('return ').block(() => {
                    writer.writeLine("sql: `${selectFragment} LIKE ${placeholder()}`,");
                    writer.writeLine('hasValue: value != null,');
                    writer.writeLine('values: [value]');
                });
            });
        }
        writer.write(`if (op === 'BETWEEN') `).block(() => {
            writer.writeLine('const [from, to] = Array.isArray(value) ? value : [null, null];');
            writer.write('return ').block(() => {
                writer.writeLine('sql: `${selectFragment} BETWEEN ${placeholder()} AND ${placeholder()}`,');
                writer.writeLine('hasValue: from != null && to != null,');
                writer.writeLine('values: [from, to]');
            });
        });
        writer.write(`if (op === 'IN' || op === 'NOT IN') `).block(() => {
            writer.write('if (!Array.isArray(value) || value.length === 0)').block(() => {
                writer.writeLine(`return { sql: '', hasValue: false, values: [] };`);
            });
            writer.write('return ').block(() => {
                writer.writeLine("sql: `${selectFragment} ${op} (${value.map(() => placeholder()).join(', ')})`,");
                writer.writeLine('hasValue: true,');
                writer.writeLine('values: value');
            });
        });
        writer.write('if (NumericOperatorList.includes(op)) ').block(() => {
            writer.write('return ').block(() => {
                writer.writeLine('sql: `${selectFragment} ${op} ${placeholder()}`,');
                writer.writeLine('hasValue: value != null,');
                writer.writeLine('values: [value]');
            });
        });
        writer.writeLine('return null;');
    });
}
function writeWhereConditionsToObjectFunction(writer, whereTypeName) {
    writer.write(`function whereConditionsToObject(whereConditions?: ${whereTypeName}[])`).block(() => {
        writer.writeLine('const obj = {} as any;');
        writer.write('whereConditions?.forEach(condition => ').inlineBlock(() => {
            writer.writeLine('const where = whereCondition(condition);');
            writer.write('if (where?.hasValue) ').block(() => {
                writer.writeLine('obj[condition.column] = true;');
            });
        });
        writer.write(');');
        writer.writeLine('return obj;');
    });
}
function writeBuildSqlFunction(writer, params) {
    const { dynamicParamsTypeName, dynamicQueryInfo, columns, parameters, dialect, hasOrderBy, toDrive } = params;
    const optional = hasOrderBy ? '' : '?';
    const paramsVar = parameters.length > 0 ? ', params' : '';
    writer.write(`function buildSql(queryParams${optional}: ${dynamicParamsTypeName})`).block(() => {
        writer.writeLine(`const { select, where${paramsVar} } = queryParams || {};`);
        writer.blankLine();
        if (hasOrderBy) {
            writer.writeLine('const orderBy = orderByToObject(queryParams.orderBy);');
        }
        writer.writeLine('const selectedSqlFragments: string[] = [];');
        writer.writeLine('const paramsValues: any[] = [];');
        writer.blankLine();
        writer.writeLine('const whereColumns = new Set(where?.map(w => w.column) || []);');
        writer.blankLine();
        if (dynamicQueryInfo.with.length > 0) {
            writer.writeLine(`const withFragments: string[] = [];`);
            dynamicQueryInfo.with.forEach((withFragment) => {
                var _a;
                const selectConditions = withFragment.dependOnFields.map((fieldIndex) => `(!select || select.${columns[fieldIndex].name} === true)`);
                const whereConditions = withFragment.dependOnFields.map((fieldIndex) => `whereColumns.has('${columns[fieldIndex].name}')`);
                const orderByConditions = ((_a = withFragment.dependOnOrderBy) === null || _a === void 0 ? void 0 : _a.map((orderBy) => `orderBy['${orderBy}'] != null`)) || [];
                const allConditions = [...selectConditions, ...whereConditions, ...orderByConditions];
                const paramValues = withFragment.parameters.map((paramIndex) => {
                    const param = parameters[paramIndex];
                    return toDrive('params?', param);
                });
                if (allConditions.length > 0) {
                    writer.writeLine(`if (`);
                    writer.indent().write(`${allConditions.join(`\n\t|| `)}`).newLine();
                    writer.write(') ').inlineBlock(() => {
                        writer.write(`withFragments.push(\`${withFragment.fragment}\`);`);
                        paramValues.forEach((paramValues) => {
                            writer.writeLine(`paramsValues.push(${paramValues});`);
                        });
                    }).newLine();
                }
                else {
                    writer.writeLine(`withFragments.push(\`${withFragment.fragment}\`);`);
                    paramValues.forEach((paramValues) => {
                        writer.writeLine(`paramsValues.push(${paramValues});`);
                    });
                }
            });
        }
        dynamicQueryInfo.select.forEach((select, index) => {
            writer.write(`if (!select || select.${columns[index].name} === true)`).block(() => {
                writer.writeLine(`selectedSqlFragments.push(\`${select.fragment}\`);`);
                select.parameters.forEach((param) => {
                    writer.writeLine(`paramsValues.push(params?.${param} ?? null);`);
                });
            });
        });
        writer.blankLine();
        writer.writeLine('const fromSqlFragments: string[] = [];');
        dynamicQueryInfo.from.forEach((from, index) => {
            var _a;
            const selectConditions = from.dependOnFields.map((fieldIndex) => `(!select || select.${columns[fieldIndex].name} === true)`);
            const whereConditions = from.dependOnFields.map((fieldIndex) => `whereColumns.has('${columns[fieldIndex].name}')`);
            const orderByConditions = ((_a = from.dependOnOrderBy) === null || _a === void 0 ? void 0 : _a.map((orderBy) => `orderBy['${orderBy}'] != null`)) || [];
            const allConditions = [...selectConditions, ...whereConditions, ...orderByConditions];
            const paramValues = from.parameters.map((paramIndex) => {
                const param = parameters[paramIndex];
                return toDrive('params?', param);
            });
            if (index != 0 && allConditions.length > 0) {
                writer.blankLine();
                writer.writeLine(`if (`);
                writer.indent().write(`${allConditions.join(`\n\t|| `)}`).newLine();
                writer.write(') ').inlineBlock(() => {
                    writer.write(`fromSqlFragments.push(\`${from.fragment}\`);`);
                });
                paramValues.forEach((paramValues) => {
                    writer.writeLine(`paramsValues.push(${paramValues});`);
                });
            }
            else {
                writer.writeLine(`fromSqlFragments.push(\`${from.fragment}\`);`);
                paramValues.forEach((paramValues) => {
                    writer.writeLine(`paramsValues.push(${paramValues});`);
                });
            }
        });
        writer.blankLine();
        writer.writeLine('const whereSqlFragments: string[] = [];');
        writer.blankLine();
        dynamicQueryInfo.where.forEach((fragment) => {
            const paramValues = fragment.parameters.map((paramIndex) => {
                const param = parameters[paramIndex];
                return `${toDrive('params?', param)} ?? null`;
            });
            writer.writeLine(`whereSqlFragments.push(\`${fragment.fragment}\`);`);
            paramValues.forEach((paramValues) => {
                writer.writeLine(`paramsValues.push(${paramValues});`);
            });
        });
        if (dialect === 'postgres' && (dynamicQueryInfo === null || dynamicQueryInfo === void 0 ? void 0 : dynamicQueryInfo.limitOffset)) {
            dynamicQueryInfo === null || dynamicQueryInfo === void 0 ? void 0 : dynamicQueryInfo.limitOffset.parameters.forEach((param) => {
                writer.writeLine(`paramsValues.push(params?.${param} ?? null);`);
            });
            writer.blankLine();
        }
        if (dialect === 'sqlite') {
            writer.writeLine(`const placeholder = () => '?';`);
        }
        else if (dialect === 'postgres') {
            writer.writeLine(`let currentIndex = paramsValues.length;`);
            writer.writeLine('const placeholder = () => `$${++currentIndex}`;');
        }
        writer.blankLine();
        writer.write('where?.forEach(condition => ').inlineBlock(() => {
            writer.writeLine('const whereClause = whereCondition(condition, placeholder);');
            dynamicQueryInfo.select.forEach((select, index) => {
                if (select.parameters.length > 0) {
                    writer.write(`if (condition.column === '${columns[index].name}')`).block(() => {
                        select.parameters.forEach((param) => {
                            writer.writeLine(`paramsValues.push(params?.${param} ?? null);`);
                        });
                    });
                }
            });
            writer.write('if (whereClause?.hasValue)').block(() => {
                writer.writeLine(`whereSqlFragments.push(whereClause.sql);`);
                writer.write('paramsValues.push(...whereClause.values);');
            });
        });
        writer.write(');').newLine();
        if (dynamicQueryInfo.with.length > 0) {
            writer.blankLine();
            writer.writeLine('const withSql = withFragments.length > 0');
            writer.indent().write('? `WITH${EOL}${withFragments.join(`,${EOL}`)}${EOL}`').newLine();
            writer.indent().write(`: '';`).newLine();
        }
        writer.blankLine();
        writer.writeLine('const whereSql = whereSqlFragments.length > 0 ? `WHERE ${whereSqlFragments.join(\' AND \')}` : \'\';');
        writer.blankLine();
        if (dynamicQueryInfo.with.length > 0) {
            writer.writeLine('const sql = `${withSql}SELECT');
        }
        else {
            writer.writeLine('const sql = `SELECT');
        }
        writer.indent().write('${selectedSqlFragments.join(`,${EOL}`)}').newLine();
        writer.indent().write('${fromSqlFragments.join(EOL)}').newLine();
        ;
        writer.indent().write('${whereSql}');
        if (hasOrderBy) {
            writer.newLine();
            writer.indent().write('ORDER BY ${buildOrderBy(queryParams.orderBy)}');
        }
        const limitOffset = dynamicQueryInfo === null || dynamicQueryInfo === void 0 ? void 0 : dynamicQueryInfo.limitOffset;
        if (limitOffset) {
            writer.newLine();
            writer.indent().write(`${limitOffset.fragment}`);
        }
        writer.write('`;');
        if (dialect === 'sqlite' && (dynamicQueryInfo === null || dynamicQueryInfo === void 0 ? void 0 : dynamicQueryInfo.limitOffset)) {
            writer.blankLine();
            dynamicQueryInfo === null || dynamicQueryInfo === void 0 ? void 0 : dynamicQueryInfo.limitOffset.parameters.forEach((param) => {
                writer.writeLine(`paramsValues.push(params?.${param} ?? null);`);
            });
        }
        writer.blankLine();
        writer.writeLine('return { sql, paramsValues };');
    });
}
function writeMapToResultFunction(writer, params) {
    const { columns, resultTypeName, selectColumnsTypeName, fromDriver } = params;
    writer.write(`function mapArrayTo${resultTypeName}(data: any, select?: ${selectColumnsTypeName})`).block(() => {
        writer.writeLine(`const result = {} as ${resultTypeName};`);
        writer.writeLine('let rowIndex = -1;');
        columns.forEach((tsField) => {
            writer.write(`if (!select || select.${tsField.name} === true)`).block(() => {
                writer.writeLine('rowIndex++;');
                writer.writeLine(`result.${tsField.name} = ${fromDriver('data[rowIndex]', tsField)};`);
            });
        });
        writer.write('return result;');
    });
}
function writeOrderByToObjectFunction(writer, dynamicParamsTypeName) {
    writer.write(`function orderByToObject(orderBy: ${dynamicParamsTypeName}['orderBy'])`).block(() => {
        writer.writeLine('const obj = {} as any;');
        writer.write('orderBy?.forEach(order => ').inlineBlock(() => {
            writer.writeLine('obj[order.column] = true;');
        });
        writer.write(');');
        writer.writeLine('return obj;');
    });
}
function writeResultType(writer, resultTypeName, columns) {
    writer.write(`export type ${resultTypeName} =`).block(() => {
        columns.forEach((field) => {
            const optionalOp = field.optional ? '?' : '';
            const nullable = field.notNull ? '' : ' | null';
            writer.writeLine(`${field.name}${optionalOp}: ${field.tsType}${nullable};`);
        });
    });
}
function writeNestedTypes(writer, relations, captalizedName) {
    relations.forEach((relation) => {
        const relationType = generateRelationType(captalizedName, relation.name);
        writer.blankLine();
        writer.write(`export type ${relationType} = `).block(() => {
            const uniqueNameFields = renameInvalidNames(relation.fields.map((f) => f.name));
            relation.fields.forEach((field, index) => {
                const nullable = field.notNull ? '' : ' | null';
                writer.writeLine(`${uniqueNameFields[index]}: ${field.tsType}${nullable};`);
            });
            relation.relations.forEach((field) => {
                const nestedRelationType = generateRelationType(captalizedName, field.tsType);
                const nullable = field.notNull ? '' : ' | null';
                writer.writeLine(`${field.name}: ${nestedRelationType}${nullable};`);
            });
        });
    });
}
function writeCollectFunction(writer, relation, columns, capitalizedName, resultTypeName) {
    const relationType = generateRelationType(capitalizedName, relation.name);
    const collectFunctionName = `collect${relationType}`;
    writer.blankLine();
    writer.write(`function ${collectFunctionName}(selectResult: ${resultTypeName}[]): ${relationType}[]`).block(() => {
        const groupBy = columns[relation.groupIndex].name;
        writer.writeLine(`const grouped = groupBy(selectResult.filter(r => r.${groupBy} != null), r => r.${groupBy});`);
        writer
            .write('return [...grouped.values()].map(row => (')
            .inlineBlock(() => {
            relation.fields.forEach((field, index) => {
                const uniqueNameFields = renameInvalidNames(relation.fields.map((f) => f.name));
                const separator = ',';
                const fieldName = columns[field.index].name;
                writer.writeLine(`${uniqueNameFields[index]}: row[0].${fieldName}!${separator}`);
            });
            relation.relations.forEach((fieldRelation) => {
                const relationType = generateRelationType(capitalizedName, fieldRelation.name);
                const orNull = fieldRelation.notNull ? '' : ' ?? null';
                const cardinality = fieldRelation.list ? '' : `[0]${orNull}`;
                writer.writeLine(`${fieldRelation.name}: collect${relationType}(row)${cardinality},`);
            });
        })
            .write('))');
    });
}
function writeGroupByFunction(writer) {
    writer.write('const groupBy = <T, Q>(array: T[], predicate: (value: T, index: number, array: T[]) => Q) =>').block(() => {
        writer
            .write('return array.reduce((map, value, index, array) => ')
            .inlineBlock(() => {
            writer.writeLine('const key = predicate(value, index, array);');
            writer.writeLine('map.get(key)?.push(value) ?? map.set(key, [value]);');
            writer.writeLine('return map;');
        })
            .write(', new Map<Q, T[]>());');
    });
}
function writeSql(writer, sql) {
    const sqlSplit = sql.split('\n');
    writer.write('const sql = `').newLine();
    sqlSplit.forEach((sqlLine) => {
        writer.indent().write(sqlLine).newLine();
    });
    writer.indent().write('`').newLine();
}
//# sourceMappingURL=codegen-util.js.map