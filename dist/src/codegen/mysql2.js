"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTsCodeForMySQL = generateTsCodeForMySQL;
exports.getOperator = getOperator;
exports.writeTypeBlock = writeTypeBlock;
exports.generateTsDescriptor = generateTsDescriptor;
exports.removeDuplicatedParameters = removeDuplicatedParameters;
exports.hasStringColumn = hasStringColumn;
exports.hasDateColumn = hasDateColumn;
exports.replaceOrderByParam = replaceOrderByParam;
exports.generateTsFileFromContent = generateTsFileFromContent;
const Either_1 = require("fp-ts/lib/Either");
const mysql_mapping_1 = require("../mysql-mapping");
const describe_query_1 = require("../describe-query");
const code_block_writer_1 = __importDefault(require("code-block-writer"));
const ts_nested_descriptor_1 = require("../ts-nested-descriptor");
const ts_dynamic_query_descriptor_1 = require("../ts-dynamic-query-descriptor");
const codegen_util_1 = require("./shared/codegen-util");
function generateTsCodeForMySQL(tsDescriptor, fileName, crud = false) {
    var _a;
    const writer = new code_block_writer_1.default();
    const camelCaseName = (0, codegen_util_1.convertToCamelCaseName)(fileName);
    const capitalizedName = (0, codegen_util_1.capitalize)(camelCaseName);
    const dataTypeName = `${capitalizedName}Data`;
    const paramsTypeName = `${capitalizedName}Params`;
    const resultTypeName = `${capitalizedName}Result`;
    const dynamicParamsTypeName = `${capitalizedName}DynamicParams`;
    const selectColumnsTypeName = `${capitalizedName}Select`;
    const whereTypeName = `${capitalizedName}Where`;
    const orderByTypeName = `${capitalizedName}OrderBy`;
    const generateOrderBy = tsDescriptor.orderByColumns != null && tsDescriptor.orderByColumns.length > 0;
    // Import declarations
    writer.writeLine(`import type { Connection } from 'mysql2/promise';`);
    if (tsDescriptor.dynamicQuery != null) {
        writer.writeLine(`import { EOL } from 'os';`);
    }
    writer.blankLine();
    if (tsDescriptor.data) {
        //update
        writeTypeBlock(writer, tsDescriptor.data, dataTypeName, crud);
    }
    const orderByField = generateOrderBy ? `orderBy: [${orderByTypeName}, ...${orderByTypeName}[]]` : undefined;
    const paramsTypes = tsDescriptor.dynamicQuery == null ? tsDescriptor.parameters : (0, ts_dynamic_query_descriptor_1.mapToDynamicParams)(tsDescriptor.parameters);
    if (tsDescriptor.dynamicQuery != null) {
        writer.write(`export type ${dynamicParamsTypeName} = `).block(() => {
            writer.writeLine(`select?: ${selectColumnsTypeName};`);
            if (paramsTypes.length > 0) {
                writer.writeLine(`params?: ${paramsTypeName};`);
            }
            writer.writeLine(`where?: ${whereTypeName}[];`);
            if (orderByField) {
                writer.writeLine(`${orderByField};`);
            }
        });
        writer.blankLine();
    }
    writeTypeBlock(writer, paramsTypes, paramsTypeName, false, tsDescriptor.dynamicQuery ? undefined : orderByField);
    const resultTypes = tsDescriptor.dynamicQuery == null
        ? tsDescriptor.columns
        : tsDescriptor.columns.map((c) => (Object.assign(Object.assign({}, c), { optional: true, notNull: true })));
    (0, codegen_util_1.writeResultType)(writer, resultTypeName, resultTypes);
    writer.blankLine();
    if (tsDescriptor.dynamicQuery) {
        const selectFields = (0, ts_dynamic_query_descriptor_1.mapToDynamicSelectColumns)(tsDescriptor.columns);
        writeTypeBlock(writer, selectFields, selectColumnsTypeName, false);
        writer.write('const selectFragments = ').inlineBlock(() => {
            var _a;
            (_a = tsDescriptor.dynamicQuery) === null || _a === void 0 ? void 0 : _a.select.forEach((fragment, index) => {
                const field = tsDescriptor.columns[index].name;
                writer.writeLine(`${field}: \`${fragment.fragmentWitoutAlias}\`,`);
            });
        });
        writer.write(' as const;');
        if (orderByField != null) {
            writer.blankLine();
            writer.write('const orderByFragments = ').inlineBlock(() => {
                for (const col of tsDescriptor.orderByColumns || []) {
                    writer.writeLine(`'${col}': \`${col}\`,`);
                }
            });
            writer.write(' as const;');
        }
        writer.blankLine();
        writer.writeLine(`const NumericOperatorList = ['=', '<>', '>', '<', '>=', '<='] as const;`);
        writer.writeLine('type NumericOperator = typeof NumericOperatorList[number];');
        if (hasStringColumn(tsDescriptor.columns)) {
            writer.writeLine(`type StringOperator = '=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE';`);
        }
        writer.writeLine(`type SetOperator = 'IN' | 'NOT IN';`);
        writer.writeLine(`type BetweenOperator = 'BETWEEN';`);
        writer.blankLine();
        writer.write(`export type ${whereTypeName} =`).indent(() => {
            for (const col of tsDescriptor.columns) {
                writer.writeLine(`| ['${col.name}', ${getOperator(col.tsType)}, ${col.tsType} | null]`);
                writer.writeLine(`| ['${col.name}', SetOperator, ${col.tsType}[]]`);
                writer.writeLine(`| ['${col.name}', BetweenOperator, ${col.tsType} | null, ${col.tsType} | null]`);
            }
        });
        writer.blankLine();
    }
    let functionReturnType = resultTypeName;
    functionReturnType += tsDescriptor.multipleRowsResult ? '[]' : tsDescriptor.queryType === 'Select' ? ' | null' : '';
    let functionArguments = 'connection: Connection';
    functionArguments += tsDescriptor.data && tsDescriptor.data.length > 0 ? `, data: ${dataTypeName}` : '';
    if (tsDescriptor.dynamicQuery == null) {
        functionArguments += tsDescriptor.parameters.length > 0 || generateOrderBy ? `, params: ${paramsTypeName}` : '';
    }
    else {
        functionArguments += `, ${orderByField ? 'params' : 'params?'}: ${dynamicParamsTypeName}`;
    }
    const allParameters = tsDescriptor.data
        ? tsDescriptor.data.map((field, index) => {
            //:nameIsSet, :name, :valueIsSet, :value....
            if (crud && index % 2 === 0) {
                const nextField = tsDescriptor.data[index + 1];
                return `data.${nextField.name} !== undefined`;
            }
            return `data.${field.name}`;
        })
        : [];
    allParameters.push(...tsDescriptor.parameterNames.map((paramName) => generateParam(paramName)));
    const queryParams = allParameters.length > 0 ? `, [${allParameters.join(', ')}]` : '';
    const escapedBackstick = scapeBackStick(tsDescriptor.sql);
    const processedSql = replaceOrderByParam(escapedBackstick);
    writer.write(`export async function ${camelCaseName}(${functionArguments}): Promise<${functionReturnType}>`).block(() => {
        if (tsDescriptor.dynamicQuery == null) {
            (0, codegen_util_1.writeSql)(writer, processedSql);
            writer.blankLine();
        }
        else {
            writer.writeLine('const where = whereConditionsToObject(params?.where);');
            if (orderByField != null) {
                writer.writeLine('const orderBy = orderByToObject(params.orderBy);');
            }
            writer.writeLine('const paramsValues: any = [];');
            if (tsDescriptor.dynamicQuery.with) {
                writer.writeLine(`let withClause = '';`);
                tsDescriptor.dynamicQuery.with.forEach((withFragment) => {
                    generateDynamicQueryFrom(writer, 'withClause', withFragment, tsDescriptor.columns);
                });
            }
            writer.writeLine(`let sql = 'SELECT';`);
            tsDescriptor.dynamicQuery.select.forEach((fragment) => {
                writer
                    .write(`if (params?.select == null || ${fragment.dependOnFields.map((fieldIndex) => `params.select.${tsDescriptor.columns[fieldIndex].name}`).join('&&')})`)
                    .block(() => {
                    writer.write(`sql = appendSelect(sql, \`${fragment.fragment}\`);`);
                });
            });
            tsDescriptor.dynamicQuery.from.forEach((fragment) => {
                generateDynamicQueryFrom(writer, 'sql', fragment, tsDescriptor.columns, tsDescriptor.orderByColumns != null);
            });
            writer.writeLine('sql += EOL + `WHERE 1 = 1`;');
            tsDescriptor.dynamicQuery.where.forEach((fragment) => {
                const ifParamConditions = fragment.dependOnParams.map((param) => `params?.params?.${param} != null`);
                const paramValues = fragment.parameters.map((param) => `params.params.${param}`);
                if (ifParamConditions.length > 0) {
                    writer.write(`if (${ifParamConditions.join(' || ')})`).block(() => {
                        writer.writeLine(`sql += EOL + \`${fragment.fragment}\`;`);
                        paramValues.forEach((paramValues) => {
                            writer.writeLine(`paramsValues.push(${paramValues});`);
                        });
                    });
                }
                else {
                    writer.writeLine(`sql += EOL + '${fragment.fragment}';`);
                }
            });
            if (tsDescriptor.dynamicQuery.with) {
                writer.write(`if (withClause != '') `).block(() => {
                    writer.writeLine(`sql = 'WITH ' + withClause + EOL + sql;`);
                });
            }
            writer.write('params?.where?.forEach(condition => ').inlineBlock(() => {
                writer.writeLine('const where = whereCondition(condition);');
                writer.write('if (where?.hasValue)').block(() => {
                    writer.writeLine(`sql += EOL + 'AND ' + where.sql;`);
                    writer.write('paramsValues.push(...where.values);');
                });
            });
            writer.write(');');
            if (tsDescriptor.orderByColumns) {
                writer.writeLine('sql += EOL + `ORDER BY ${buildOrderBy(params.orderBy)}`;');
            }
        }
        const singleRowSelect = tsDescriptor.queryType === 'Select' && tsDescriptor.multipleRowsResult === false;
        if (tsDescriptor.queryType === 'Select') {
            if (tsDescriptor.dynamicQuery == null) {
                writer.writeLine(`return connection.query({sql, rowsAsArray: true}${queryParams})`);
                writer.indent().write('.then(res => res[0] as any[])');
                writer.newLine().indent().write(`.then(res => res.map(data => mapArrayTo${resultTypeName}(data)))`);
            }
            else {
                writer.writeLine('return connection.query({ sql, rowsAsArray: true }, paramsValues)');
                writer.indent().write('.then(res => res[0] as any[])');
                writer.newLine().indent().write(`.then(res => res.map(data => mapArrayTo${resultTypeName}(data, params?.select)))`);
            }
        }
        else {
            writer.writeLine(`return connection.query(sql${queryParams})`);
            writer.indent().write(`.then(res => res[0] as ${resultTypeName})`);
        }
        if (tsDescriptor.queryType === 'Select' && tsDescriptor.multipleRowsResult === false) {
            writer.newLine().indent().write('.then(res => res[0]);');
        }
        else {
            writer.write(';');
        }
    });
    if (tsDescriptor.queryType === 'Select') {
        writer.blankLine();
        if (tsDescriptor.dynamicQuery == null) {
            writer.write(`function mapArrayTo${resultTypeName}(data: any)`).block(() => {
                writer.write(`const result: ${resultTypeName} =`).block(() => {
                    tsDescriptor.columns.forEach((tsField, index) => {
                        writer.writeLine(`${tsField.name}: data[${index}]${commaSeparator(tsDescriptor.columns.length, index)}`);
                    });
                });
                writer.write('return result;');
            });
        }
        else {
            writer.write(`function mapArrayTo${resultTypeName}(data: any, select?: ${selectColumnsTypeName})`).block(() => {
                writer.writeLine(`const result = {} as ${resultTypeName};`);
                writer.writeLine('let rowIndex = 0;');
                tsDescriptor.columns.forEach((tsField) => {
                    writer.write(`if (select == null || select.${tsField.name})`).block(() => {
                        writer.writeLine(`result.${tsField.name} = data[rowIndex++];`);
                    });
                });
                writer.write('return result;');
            });
            writer.blankLine();
            writer.write('function appendSelect(sql: string, selectField: string)').block(() => {
                writer.write(`if (sql == 'SELECT')`).block(() => {
                    writer.writeLine('return sql + EOL + selectField;');
                });
                writer.write('else').block(() => {
                    writer.writeLine(`return sql + ', ' + EOL + selectField;`);
                });
            });
            writer.blankLine();
            writer.write(`function whereConditionsToObject(whereConditions?: ${whereTypeName}[])`).block(() => {
                writer.writeLine('const obj = {} as any;');
                writer.write('whereConditions?.forEach(condition => ').inlineBlock(() => {
                    writer.writeLine('const where = whereCondition(condition);');
                    writer.write('if (where?.hasValue) ').block(() => {
                        writer.writeLine('obj[condition[0]] = true;');
                    });
                });
                writer.write(');');
                writer.writeLine('return obj;');
            });
            if (orderByField != null) {
                writer.blankLine();
                writer.write(`function orderByToObject(${orderByField})`).block(() => {
                    writer.writeLine('const obj = {} as any;');
                    writer.write('orderBy?.forEach(order => ').inlineBlock(() => {
                        writer.writeLine('obj[order.column] = true;');
                    });
                    writer.write(');');
                    writer.writeLine('return obj;');
                });
            }
            writer.blankLine();
            writer.write('type WhereConditionResult = ').block(() => {
                writer.writeLine('sql: string;');
                writer.writeLine('hasValue: boolean;');
                writer.writeLine('values: any[];');
            });
            writer.blankLine();
            writer.write(`function whereCondition(condition: ${whereTypeName}): WhereConditionResult | undefined `).block(() => {
                writer.blankLine();
                writer.writeLine('const selectFragment = selectFragments[condition[0]];');
                writer.writeLine('const operator = condition[1];');
                writer.blankLine();
                if (hasStringColumn(tsDescriptor.columns)) {
                    writer.write(`if (operator == 'LIKE') `).block(() => {
                        writer.write('return ').block(() => {
                            writer.writeLine("sql: `${selectFragment} LIKE concat('%', ?, '%')`,");
                            writer.writeLine('hasValue: condition[2] != null,');
                            writer.writeLine('values: [condition[2]]');
                        });
                    });
                }
                writer.write(`if (operator == 'BETWEEN') `).block(() => {
                    writer.write('return ').block(() => {
                        writer.writeLine('sql: `${selectFragment} BETWEEN ? AND ?`,');
                        writer.writeLine('hasValue: condition[2] != null && condition[3] != null,');
                        writer.writeLine('values: [condition[2], condition[3]]');
                    });
                });
                writer.write(`if (operator == 'IN' || operator == 'NOT IN') `).block(() => {
                    writer.write('return ').block(() => {
                        writer.writeLine('sql: `${selectFragment} ${operator} (?)`,');
                        writer.writeLine('hasValue: condition[2] != null && condition[2].length > 0,');
                        writer.writeLine('values: [condition[2]]');
                    });
                });
                writer.write('if (NumericOperatorList.includes(operator)) ').block(() => {
                    writer.write('return ').block(() => {
                        writer.writeLine('sql: `${selectFragment} ${operator} ?`,');
                        writer.writeLine('hasValue: condition[2] != null,');
                        writer.writeLine('values: [condition[2]]');
                    });
                });
            });
        }
    }
    if (generateOrderBy) {
        const orderByColumnsType = (_a = tsDescriptor.orderByColumns) === null || _a === void 0 ? void 0 : _a.map((col) => `'${col}'`).join(' | ');
        writer.blankLine();
        writer.write(`export type ${orderByTypeName} = `).block(() => {
            if (tsDescriptor.dynamicQuery == null) {
                writer.writeLine(`column: ${orderByColumnsType};`);
            }
            else {
                writer.writeLine('column: keyof typeof orderByFragments;');
            }
            writer.writeLine(`direction: 'asc' | 'desc';`);
        });
        writer.blankLine();
        writer.write(`function buildOrderBy(orderBy: ${orderByTypeName}[]): string`).block(() => {
            if (tsDescriptor.dynamicQuery == null) {
                writer.writeLine(`return orderBy.map(order => \`\\\`\${order.column}\\\` \${order.direction == 'desc' ? 'desc' : 'asc' }\`).join(', ');`);
            }
            else {
                writer.writeLine(`return orderBy.map(order => \`\${orderByFragments[order.column]} \${order.direction == 'desc' ? 'desc' : 'asc'}\`).join(', ');`);
            }
        });
    }
    if (tsDescriptor.nestedDescriptor) {
        const relations = tsDescriptor.nestedDescriptor.relations;
        relations.forEach((relation) => {
            const relationType = (0, codegen_util_1.generateRelationType)(capitalizedName, relation.name);
            writer.blankLine();
            writer.write(`export type ${relationType} = `).block(() => {
                const uniqueNameFields = (0, codegen_util_1.renameInvalidNames)(relation.fields.map((f) => f.name));
                relation.fields.forEach((field, index) => {
                    if (field.type === 'field') {
                        writer.writeLine(`${uniqueNameFields[index]}: ${field.tsType};`);
                    }
                    if (field.type === 'relation') {
                        const nestedRelationType = (0, codegen_util_1.generateRelationType)(capitalizedName, field.tsType);
                        const nullable = field.notNull ? '' : ' | null';
                        writer.writeLine(`${field.name}: ${nestedRelationType}${nullable};`);
                    }
                });
            });
        });
        relations.forEach((relation, index) => {
            const relationType = (0, codegen_util_1.generateRelationType)(capitalizedName, relation.name);
            if (index === 0) {
                //first
                writer.blankLine();
                writer.write(`export async function ${camelCaseName}Nested(${functionArguments}): Promise<${relationType}[]>`).block(() => {
                    const params = tsDescriptor.parameters.length > 0 ? ', params' : '';
                    writer.writeLine(`const selectResult = await ${camelCaseName}(connection${params});`);
                    writer.write('if (selectResult.length == 0)').block(() => {
                        writer.writeLine('return [];');
                    });
                    writer.writeLine(`return collect${relationType}(selectResult);`);
                });
            }
            const collectFunctionName = `collect${relationType}`;
            const mapFunctionName = `mapTo${relationType}`;
            writer.blankLine();
            writer.write(`function ${collectFunctionName}(selectResult: ${resultTypeName}[]): ${relationType}[]`).block(() => {
                const groupKey = tsDescriptor.columns[relation.groupKeyIndex].name;
                writer.writeLine(`const grouped = groupBy(selectResult.filter(r => r.${groupKey} != null), r => r.${groupKey});`);
                writer.writeLine(`return [...grouped.values()].map(r => ${mapFunctionName}(r))`);
            });
            writer.blankLine();
            writer.write(`function ${mapFunctionName}(selectResult: ${resultTypeName}[]): ${relationType}`).block(() => {
                writer.writeLine('const firstRow = selectResult[0];');
                writer.write(`const result: ${relationType} = `).block(() => {
                    const uniqueNameFields = (0, codegen_util_1.renameInvalidNames)(relation.fields.map((f) => f.name));
                    relation.fields.forEach((field, index) => {
                        const separator = commaSeparator(relation.fields.length, index);
                        if (field.type === 'field') {
                            const fieldName = tsDescriptor.columns[field.index].name;
                            writer.writeLine(`${uniqueNameFields[index]}: firstRow.${fieldName}!${separator}`);
                        }
                        if (field.type === 'relation') {
                            const nestedRelationType = (0, codegen_util_1.generateRelationType)(capitalizedName, field.name);
                            const cardinality = field.list ? '' : '[0]';
                            writer.writeLine(`${field.name}: collect${nestedRelationType}(selectResult)${cardinality}${separator}`);
                        }
                    });
                });
                writer.writeLine('return result;');
            });
        });
        writer.blankLine();
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
    return writer.toString();
}
function generateDynamicQueryFrom(writer, sqlVar, fragment, columns, includeOrderBy = false) {
    var _a;
    const selectConditions = fragment.dependOnFields.map((fieldIndex) => `params.select.${columns[fieldIndex].name}`);
    if (selectConditions.length > 0) {
        selectConditions.unshift('params?.select == null');
    }
    const paramConditions = fragment.dependOnParams.map((param) => `params.params?.${param} != null`);
    const whereConditions = fragment.dependOnFields.map((fieldIndex) => `where.${columns[fieldIndex].name} != null`);
    const orderByConditions = includeOrderBy ? ((_a = fragment.dependOnOrderBy) === null || _a === void 0 ? void 0 : _a.map((orderBy) => `orderBy['${orderBy}'] != null`)) || [] : [];
    const allConditions = [...selectConditions, ...paramConditions, ...whereConditions, ...orderByConditions];
    const paramValues = fragment.parameters.map((param) => `params?.params?.${param}`);
    if (allConditions.length > 0) {
        writer.write(`if (${allConditions.join(`\n    || `)})`).block(() => {
            writer.write(`${sqlVar} += EOL + \`${fragment.fragment}\`;`);
            for (const paramValue of paramValues) {
                writer.writeLine(`paramsValues.push(${paramValue});`);
            }
        });
    }
    else {
        writer.writeLine(`${sqlVar} += EOL + \`${fragment.fragment}\`;`);
        for (const paramValue of paramValues) {
            writer.writeLine(`paramsValues.push(${paramValue});`);
        }
    }
}
function getOperator(type) {
    if (type === 'number' || type === 'Date') {
        return 'NumericOperator';
    }
    return 'StringOperator';
}
function generateParam(param) {
    if (param.isList) {
        return `params.${param.name}.length == 0? null : params.${param.name}`;
    }
    return `params.${param.name}`;
}
function writeTypeBlock(writer, fields, typeName, updateCrud, extraField) {
    const writeBlockCond = fields.length > 0 || extraField != null;
    if (writeBlockCond) {
        writer.write(`export type ${typeName} =`).block(() => {
            fields.forEach((tsField, index) => {
                // :nameSet, :name, valueSet, :value...
                if (updateCrud && index % 2 !== 0) {
                    //only odd fields (:name, :value)
                    writer.writeLine(`${tsFieldToStr(tsField, true)};`);
                }
                else if (!updateCrud) {
                    writer.writeLine(`${tsFieldToStr(tsField, false)};`);
                }
            });
            if (extraField) {
                writer.write(`${extraField};`);
            }
        });
        writer.blankLine();
    }
}
function tsFieldToStr(tsField, isCrudUpdate) {
    if (isCrudUpdate) {
        //all fields are optionals
        return `${tsField.name}?: ${tsField.tsType}${tsField.notNull === false ? ' | null' : ''}`;
    }
    return tsField.name + (tsField.notNull ? ': ' : '?: ') + tsField.tsType;
}
function generateTsDescriptor(queryInfo) {
    var _a;
    const escapedColumnsNames = (0, codegen_util_1.renameInvalidNames)(queryInfo.columns.map((col) => col.name));
    const columns = queryInfo.columns.map((col, columnIndex) => {
        const tsDesc = {
            name: escapedColumnsNames[columnIndex],
            tsType: mapColumnType(col.type),
            notNull: col.notNull ? col.notNull : false
        };
        return tsDesc;
    });
    const parameterNames = queryInfo.parameters.map((p) => {
        const paramInfo = {
            name: p.name,
            isList: !!p.columnType.endsWith('[]')
        };
        return paramInfo;
    });
    const uniqueParams = removeDuplicatedParameters(queryInfo.parameters);
    const escapedParametersNames = (0, codegen_util_1.renameInvalidNames)(uniqueParams.map((col) => col.name));
    const parameters = uniqueParams.map((col, paramIndex) => {
        const arraySymbol = col.list ? '[]' : '';
        const tsDesc = {
            name: escapedParametersNames[paramIndex],
            tsType: mapColumnType(col.columnType) + arraySymbol,
            notNull: col.notNull ? col.notNull : false,
            toDriver: col.name,
            isArray: false
        };
        return tsDesc;
    });
    const escapedDataNames = queryInfo.data ? (0, codegen_util_1.renameInvalidNames)(queryInfo.data.map((col) => col.name)) : [];
    const data = (_a = queryInfo.data) === null || _a === void 0 ? void 0 : _a.map((col, dataIndex) => {
        const tsDesc = {
            name: escapedDataNames[dataIndex],
            tsType: mapColumnType(col.columnType),
            notNull: col.notNull ? col.notNull : false,
            toDriver: col.name,
            isArray: false
        };
        return tsDesc;
    });
    const result = {
        sql: queryInfo.sql,
        queryType: queryInfo.queryType,
        multipleRowsResult: queryInfo.multipleRowsResult,
        columns,
        orderByColumns: queryInfo.orderByColumns,
        parameterNames,
        parameters,
        data
    };
    if (queryInfo.nestedResultInfo) {
        const nestedDescriptor = (0, ts_nested_descriptor_1.createNestedTsDescriptor)(queryInfo.columns, queryInfo.nestedResultInfo);
        result.nestedDescriptor = nestedDescriptor;
    }
    if (queryInfo.dynamicSqlQuery) {
        const dynamicQueryDescriptor = queryInfo.dynamicSqlQuery;
        result.dynamicQuery = dynamicQueryDescriptor;
    }
    if (queryInfo.returning) {
        result.returning = queryInfo.returning;
    }
    return result;
}
function removeDuplicatedParameters(parameters) {
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
function scapeBackStick(sql) {
    const pattern = /`/g;
    return sql.replace(pattern, '\\`');
}
function mapColumnType(columnType) {
    if (columnType === 'any')
        return 'any';
    const types = [].concat(columnType);
    const mappedTypes = types.map((type) => mysql_mapping_1.mapper.convertToTsType(type));
    return mappedTypes.join(' | '); // number | string
}
function hasStringColumn(columns) {
    return columns.some((c) => c.tsType === 'string');
}
function hasDateColumn(columns) {
    return columns.some((c) => c.tsType === 'Date');
}
function replaceOrderByParam(sql) {
    const patern = /(.*order\s+by\s*)(\?)(.\n$)*/i;
    const newSql = sql.replace(patern, '$1${buildOrderBy(params.orderBy)}$3');
    return newSql;
}
function generateTsFileFromContent(client_1, queryName_1, sqlContent_1) {
    return __awaiter(this, arguments, void 0, function* (client, queryName, sqlContent, crud = false) {
        const queryInfoResult = yield (0, describe_query_1.parseSql)(client, sqlContent);
        if ((0, Either_1.isLeft)(queryInfoResult)) {
            return queryInfoResult;
        }
        const tsDescriptor = generateTsDescriptor(queryInfoResult.right);
        const tsContent = generateTsCodeForMySQL(tsDescriptor, queryName, crud);
        return (0, Either_1.right)(tsContent);
    });
}
function commaSeparator(length, index) {
    return length > 1 && index !== length - 1 ? ',' : '';
}
//# sourceMappingURL=mysql2.js.map