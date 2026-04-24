"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCode = generateCode;
exports.generateCrud = generateCrud;
const codegen_util_1 = require("./shared/codegen-util");
const describe_1 = require("../postgres-query-analyzer/describe");
const postgres_1 = require("../dialects/postgres");
const neverthrow_1 = require("neverthrow");
const sqlite_1 = require("./sqlite");
const ts_nested_descriptor_1 = require("../ts-nested-descriptor");
const codegen_util_2 = require("./shared/codegen-util");
function generateCode(client, sql, queryName, schemaInfo) {
    if (isEmptySql(sql)) {
        return (0, neverthrow_1.okAsync)('');
    }
    return _describeQuery(client, sql, schemaInfo)
        .map(schemaDef => generateTsCode(queryName, schemaDef, client.type));
}
function isEmptySql(sql) {
    if (sql.trim() === '') {
        return true;
    }
    const lines = sql.split('\n');
    return lines.every(line => line.trim() === '' || line.trim().startsWith('//'));
}
function _describeQuery(databaseClient, sql, dbSchema) {
    return (0, describe_1.describeQuery)(databaseClient.client, sql, dbSchema);
}
function generateTsCode(queryName, schemaDef, client) {
    const { sql } = schemaDef;
    const writer = (0, codegen_util_1.createCodeBlockWriter)();
    const { camelCaseName, capitalizedName, dataTypeName, resultTypeName, paramsTypeName, orderByTypeName, dynamicParamsTypeName, selectColumnsTypeName, whereTypeName } = (0, codegen_util_1.createTypeNames)(queryName);
    const tsDescriptor = createTsDescriptor(capitalizedName, schemaDef);
    const uniqueParams = (0, codegen_util_1.removeDuplicatedParameters2)(tsDescriptor.parameters);
    const generateOrderBy = tsDescriptor.orderByColumns != null && tsDescriptor.orderByColumns.length > 0;
    const codeWriter = getCodeWriter(client);
    codeWriter.writeImports(writer, schemaDef.queryType);
    if (tsDescriptor.dynamicQuery2) {
        writer.writeLine(`import { EOL } from 'os';`);
    }
    const uniqueDataParams = (0, codegen_util_1.removeDuplicatedParameters2)(tsDescriptor.data || []);
    if (uniqueDataParams.length > 0) {
        writer.blankLine();
        writeDataType(writer, dataTypeName, uniqueDataParams);
    }
    const dynamicQueryInfo = tsDescriptor.dynamicQuery2;
    const orderByField = tsDescriptor.orderByColumns != null && tsDescriptor.orderByColumns.length > 0 ? 'orderBy' : '';
    if (dynamicQueryInfo) {
        writer.blankLine();
        (0, codegen_util_1.writeDynamicQueryParamType)(writer, queryName, uniqueParams.length > 0, orderByField);
    }
    if (uniqueParams.length > 0 || (orderByField && !dynamicQueryInfo)) {
        writer.blankLine();
        writeParamsType(writer, paramsTypeName, uniqueParams, generateOrderBy, orderByTypeName);
    }
    if (schemaDef.queryType !== 'Copy') {
        writer.blankLine();
        writeResultType(writer, resultTypeName, tsDescriptor.columns);
        const flatten = schemaDef.columns.flatMap(col => flattenJsonTypes(createJsonType(capitalizedName, col.name), col.type));
        flatten.forEach(type => {
            writer.blankLine();
            writeJsonTypes(writer, type.typeName, type.type);
        });
    }
    if (dynamicQueryInfo) {
        writer.blankLine();
        writer.write(`export type ${selectColumnsTypeName} =`).block(() => {
            tsDescriptor.columns.forEach((tsField) => {
                writer.writeLine(`${tsField.name}?: boolean;`);
            });
        });
        writer.blankLine();
        (0, codegen_util_1.writeSelectFragements)(writer, dynamicQueryInfo.select, tsDescriptor.columns);
        writer.blankLine();
        (0, codegen_util_2.writeDynamicQueryOperators)(writer, whereTypeName, tsDescriptor.columns);
        writer.blankLine();
        let functionArguments = 'client: pg.Client | pg.Pool | pg.PoolClient';
        // if (params.data.length > 0) {
        // 	functionParams += `, data: ${dataType}`;
        // }
        const optional = uniqueDataParams.length > 0 || orderByField ? '' : '?';
        functionArguments += `, params${optional}: ${dynamicParamsTypeName}`;
        writer.write(`export async function ${camelCaseName}(${functionArguments}): Promise<${resultTypeName}[]>`).block(() => {
            writer.blankLine();
            writer.writeLine('const { sql, paramsValues } = buildSql(params);');
            writer.write(`return client.query({ text: sql, rowMode: 'array', values: paramsValues })`).newLine();
            writer.indent().write(`.then(res => res.rows.map(row => mapArrayTo${resultTypeName}(row, params?.select)));`);
        });
        writer.blankLine();
        (0, codegen_util_2.writeBuildSqlFunction)(writer, {
            dynamicParamsTypeName,
            columns: tsDescriptor.columns,
            parameters: tsDescriptor.parameters,
            dynamicQueryInfo,
            dialect: 'postgres',
            hasOrderBy: tsDescriptor.orderByColumns != null,
            toDrive: (variable, param) => `${variable}.${param.name}`
        });
        writer.blankLine();
        (0, codegen_util_2.writeMapToResultFunction)(writer, {
            columns: tsDescriptor.columns,
            resultTypeName,
            selectColumnsTypeName,
            fromDriver: (variable, _param) => variable
        });
        writer.blankLine();
        writer.write('type WhereConditionResult = ').block(() => {
            writer.writeLine('sql: string;');
            writer.writeLine('hasValue: boolean;');
            writer.writeLine('values: any[];');
        });
        writer.blankLine();
        (0, codegen_util_2.writeWhereConditionFunction)(writer, whereTypeName, tsDescriptor.columns);
        if (tsDescriptor.orderByColumns != null) {
            writer.blankLine();
            (0, codegen_util_2.writeOrderByToObjectFunction)(writer, dynamicParamsTypeName);
            writer.blankLine();
            (0, codegen_util_2.writeBuildOrderByBlock)(writer, tsDescriptor.orderByColumns, orderByTypeName);
        }
    }
    if (tsDescriptor.nestedDescriptor2) {
        const relations = tsDescriptor.nestedDescriptor2 || [];
        (0, codegen_util_1.writeNestedTypes)(writer, relations, capitalizedName);
    }
    if (!dynamicQueryInfo) {
        writer.blankLine();
        const execFunctionParams = {
            sql,
            queryType: tsDescriptor.queryType,
            multipleRowsResult: tsDescriptor.multipleRowsResult,
            functionName: queryName,
            paramsType: paramsTypeName,
            dataType: dataTypeName,
            returnType: resultTypeName,
            columns: tsDescriptor.columns,
            parameters: tsDescriptor.parameters,
            data: tsDescriptor.data || [],
            returning: schemaDef.returning || false,
            orderByTypeName: orderByTypeName,
            orderByColumns: tsDescriptor.orderByColumns || [],
            generateNested: tsDescriptor.nestedDescriptor2 != null,
            nestedType: tsDescriptor.nestedDescriptor2 ? tsDescriptor.nestedDescriptor2[0].name : '',
        };
        codeWriter.writeExecFunction(writer, execFunctionParams);
    }
    if (tsDescriptor.nestedDescriptor2) {
        const relations = tsDescriptor.nestedDescriptor2;
        relations.forEach((relation) => {
            (0, codegen_util_1.writeCollectFunction)(writer, relation, tsDescriptor.columns, capitalizedName, resultTypeName);
        });
        writer.blankLine();
        (0, codegen_util_1.writeGroupByFunction)(writer);
    }
    return writer.toString();
}
const isJsonType = (t) => {
    return typeof t === 'object' && t !== null && 'name' in t;
};
const isJsonObjType = (t) => t.name === 'json';
const isJsonMapType = (t) => t.name === 'json_map';
const isJsonArrayType = (t) => t.name === 'json[]';
const isJsonFieldType = (t) => t.name === 'json_field';
function flattenJsonTypes(parentName, type) {
    const result = [];
    const visit = (typeName, t) => {
        if (!isJsonType(t)) {
            return;
        }
        if (isJsonObjType(t)) {
            result.push({ typeName, type: t });
            for (const prop of t.properties) {
                visit(createJsonType(typeName, prop.key), prop.type);
            }
        }
        else if (isJsonMapType(t)) {
            visit(typeName, t.type);
        }
        else if (isJsonArrayType(t)) {
            for (const itemType of t.properties) {
                visit(typeName, itemType);
            }
        }
    };
    visit(parentName, type);
    return result;
}
function writeDataType(writer, dataTypeName, params) {
    writer.write(`export type ${dataTypeName} =`).block(() => {
        params.forEach((field) => {
            const optionalOp = field.optional ? '?' : '';
            const orNull = field.notNull ? '' : ' | null';
            writer.writeLine(`${field.name}${optionalOp}: ${field.tsType}${orNull};`);
        });
    });
}
function writeParamsType(writer, paramsTypeName, params, generateOrderBy, orderByTypeName) {
    writer.write(`export type ${paramsTypeName} =`).block(() => {
        params.forEach((field) => {
            const optionalOp = field.optional ? '?' : '';
            const orNull = field.notNull ? '' : ' | null';
            writer.writeLine(`${field.name}${optionalOp}: ${field.tsType}${orNull};`);
        });
        if (generateOrderBy) {
            writer.writeLine(`orderBy: ${orderByTypeName}[];`);
        }
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
function createJsonType(capitalizedName, columnName) {
    const jsonType = (0, codegen_util_1.capitalize)((0, codegen_util_1.convertToCamelCaseName)(columnName));
    const fullName = `${capitalizedName}${jsonType}`;
    return fullName;
}
function writeJsonTypes(writer, typeName, type) {
    writer.write(`export type ${typeName}Type =`).block(() => {
        type.properties.forEach((field) => {
            if (isJsonObjType(field.type)) {
                const nullable = field.type.notNull ? '' : ' | null';
                const jsonTypeName = createJsonType(typeName, field.key);
                writer.writeLine(`${field.key}: ${jsonTypeName}Type${nullable};`);
            }
            else if (isJsonArrayType(field.type)) {
                const jsonParentName = createJsonType(typeName, field.key);
                const jsonTypeName = createJsonArrayType(jsonParentName, field.type);
                writer.writeLine(`${field.key}: ${jsonTypeName};`);
            }
            else if (isJsonFieldType(field.type)) {
                const nullable = field.type.notNull ? '' : ' | null';
                writer.writeLine(`${field.key}: ${postgres_1.mapper.mapColumnType(field.type.type, true)}${nullable};`);
            }
        });
    });
}
function createTsDescriptor(capitalizedName, schemaDef) {
    var _a;
    const tsDescriptor = {
        columns: getColumnsForQuery(capitalizedName, schemaDef),
        parameters: schemaDef.parameters.map((param) => mapParameterToTsFieldDescriptor(param)),
        sql: '',
        queryType: schemaDef.queryType,
        multipleRowsResult: schemaDef.multipleRowsResult,
        parameterNames: [],
        data: (_a = schemaDef.data) === null || _a === void 0 ? void 0 : _a.map(param => mapParameterToTsFieldDescriptor(param))
    };
    if (schemaDef.orderByColumns) {
        tsDescriptor.orderByColumns = schemaDef.orderByColumns;
    }
    if (schemaDef.nestedInfo) {
        const nestedDescriptor2 = schemaDef.nestedInfo.map((relation) => {
            const tsRelation = {
                groupIndex: relation.groupIndex,
                name: relation.name,
                fields: relation.fields.map((field) => mapPostgrsFieldToTsField(schemaDef.columns, field)),
                relations: relation.relations.map((relation) => (0, ts_nested_descriptor_1.mapToTsRelation2)(relation))
            };
            return tsRelation;
        });
        tsDescriptor.nestedDescriptor2 = nestedDescriptor2;
    }
    if (schemaDef.dynamicSqlQuery2) {
        tsDescriptor.dynamicQuery2 = schemaDef.dynamicSqlQuery2;
    }
    return tsDescriptor;
}
function createJsonArrayType(name, type) {
    const typeNames = type.properties.flatMap(p => {
        if (isJsonFieldType(p)) {
            const baseType = postgres_1.mapper.mapColumnType(p.type, true);
            if (!p.notNull) {
                return [baseType, 'null'];
            }
            return [baseType];
        }
        return createTsType(name, p);
    });
    const uniqTypeNames = [...new Set(typeNames)];
    const unionTypes = uniqTypeNames.join(' | ');
    return uniqTypeNames.length === 1 ? `${unionTypes}[]` : `(${unionTypes})[]`;
}
function createJsonMapType(name, type) {
    const valueType = isJsonFieldType(type.type) ? postgres_1.mapper.mapColumnType(type.type.type, true) : `${name}Type`;
    return `Record<string, ${valueType} | undefined>`;
}
function createTsType(name, type) {
    if (isJsonType(type)) {
        if (isJsonObjType(type)) {
            return `${name}Type`;
        }
        else if (isJsonArrayType(type)) {
            return createJsonArrayType(name, type);
        }
        else if (isJsonMapType(type)) {
            return createJsonMapType(name, type);
        }
    }
    return postgres_1.mapper.mapColumnType(type);
}
function mapColumnInfoToTsFieldDescriptor(capitalizedName, col, dynamicQuery) {
    const typeName = createJsonType(capitalizedName, col.name);
    const tsField = {
        name: col.name,
        tsType: createTsType(typeName, col.type),
        optional: dynamicQuery ? true : false,
        notNull: dynamicQuery ? true : col.notNull
    };
    return tsField;
}
function mapParameterToTsFieldDescriptor(param) {
    const tsDesc = {
        name: param.name,
        tsType: postgres_1.mapper.mapColumnType(param.type),
        notNull: param.notNull ? param.notNull : false,
        toDriver: '',
        isArray: param.type.startsWith('_')
    };
    return tsDesc;
}
function getCodeWriter(client) {
    return postgresCodeWriter;
}
const postgresCodeWriter = {
    writeImports: function (writer, queryType) {
        writer.writeLine(`import pg from 'pg';`);
        if (queryType === 'Copy') {
            writer.writeLine(`import { from as copyFrom } from 'pg-copy-streams';`);
            writer.writeLine(`import { pipeline } from 'stream/promises';`);
            writer.writeLine(`import { Readable } from 'stream';`);
        }
    },
    writeExecFunction: function (writer, params) {
        if (params.queryType === 'Copy') {
            _writeCopyFunction(writer, params);
        }
        else {
            _writeExecFunction(writer, params);
        }
    }
};
function _writeCopyFunction(writer, params) {
    const { functionName, paramsType } = params;
    writer.writeLine(`const columns = [${params.parameters.map(param => `'${param.name}'`).join(', ')}] as const;`);
    writer.blankLine();
    let functionParams = `client: pg.Client | pg.PoolClient, values: ${paramsType}[]`;
    writer.write(`export async function ${functionName}(${functionParams}): Promise<void>`).block(() => {
        (0, codegen_util_1.writeSql)(writer, params.sql);
        writer.writeLine('const csv = jsonToCsv(values);');
        writer.blankLine();
        writer.writeLine('const sourceStream = Readable.from(csv);');
        writer.writeLine('const stream = client.query(copyFrom(sql));');
        writer.writeLine('await pipeline(sourceStream, stream)');
    });
    writer.blankLine();
    writer.write(`function jsonToCsv(values: ${paramsType}[]): string`).block(() => {
        writer.writeLine('return values');
        writer.indent().write('.map(value =>').newLine();
        writer.indent(2).write('columns.map(col => value[col])').newLine();
        writer.indent(3).write('.map(val => escapeValue(val))').newLine();
        writer.indent(3).write(`.join(',')`).newLine();
        writer.indent().write(')').newLine();
        writer.indent().write(`.join('\\n');`).newLine();
    });
    writer.blankLine();
    writer.write(`function escapeValue(val: any): string`).block(() => {
        writer.write('if (val == null)').block(() => {
            writer.writeLine(`return '';`);
        });
        writer.writeLine('const str = String(val);');
        writer.writeLine(`const escaped = str.replace(/"/g, '""');`);
        writer.writeLine('return `"${escaped}"`;');
    });
}
function _writeExecFunction(writer, params) {
    const { functionName, paramsType, dataType, returnType, parameters, orderByTypeName, orderByColumns, generateNested, nestedType } = params;
    let functionParams = params.queryType === 'Copy' ? 'client: pg.Client | pg.PoolClient' : 'client: pg.Client | pg.Pool | pg.PoolClient';
    if (params.data.length > 0) {
        functionParams += `, data: ${dataType}`;
    }
    if (parameters.length > 0 || orderByColumns.length > 0) {
        functionParams += `, params: ${paramsType}`;
    }
    const allParamters = [...params.data.map(param => paramToDriver(param, 'data')),
        ...parameters.map(param => paramToDriver(param, 'params')),
        ...parameters.filter(param => isList(param)).map(param => `...params.${param.name}.slice(1)`)];
    const paramValues = allParamters.length > 0 ? `, values: [${allParamters.join(', ')}]` : '';
    const orNull = params.queryType === 'Select' ? ' | null' : '';
    const functionReturnType = params.multipleRowsResult ? `${returnType}[]` : `${returnType}${orNull}`;
    const hasListParams = parameters.some(param => !param.isArray && param.tsType.endsWith('[]'));
    if (hasListParams) {
        writer.writeLine('let currentIndex: number;');
    }
    writer.write(`export async function ${functionName}(${functionParams}): Promise<${functionReturnType}>`).block(() => {
        if (hasListParams) {
            writer.writeLine(`currentIndex = ${params.data.length + params.parameters.length};`);
        }
        (0, codegen_util_1.writeSql)(writer, params.sql);
        if (params.queryType === 'Select' || params.returning) {
            writer.write(`return client.query({ text: sql, rowMode: 'array'${paramValues} })`).newLine();
            if (params.multipleRowsResult) {
                writer.indent().write(`.then(res => res.rows.map(row => mapArrayTo${returnType}(row)));`);
            }
            else if (params.returning) {
                writer.indent().write(`.then(res => mapArrayTo${returnType}(res.rows[0]));`);
            }
            else {
                writer.indent().write(`.then(res => res.rows.length > 0 ? mapArrayTo${returnType}(res.rows[0]) : null);`);
            }
        }
        else {
            writer.write(`return client.query({ text: sql${paramValues} })`).newLine();
            writer.indent().write(`.then(res => mapArrayTo${returnType}(res));`);
        }
    });
    if (hasListParams) {
        writer.blankLine();
        writer.write(`function generatePlaceholders(param: string, paramsArray: any[]): string`).block(() => {
            writer.write('return paramsArray').newLine();
            writer.indent().write('.map((_, index) => {').newLine();
            writer.indent(2).write(`if (index === 0) {`).newLine();
            writer.indent(3).write(`return param`).newLine();
            writer.indent(2).write(`}`).newLine();
            writer.indent(2).write('currentIndex++;').newLine();
            writer.indent(2).write('return `$${currentIndex}`;').newLine();
            writer.indent().write('})');
            writer.newLine();
            writer.indent().write(`.join(', ');`);
        });
    }
    writer.blankLine();
    writer.write(`function mapArrayTo${returnType}(data: any) `).block(() => {
        writer.write(`const result: ${returnType} = `).block(() => {
            params.columns.forEach((col, index) => {
                const separator = index < params.columns.length - 1 ? ',' : '';
                if (params.queryType === 'Select' || params.returning) {
                    writer.writeLine(`${col.name}: ${toDriver(`data[${index}]`, col)}${separator}`);
                }
                else {
                    writer.writeLine(`${col.name}: data.${col.name}${separator}`);
                }
            });
        });
        writer.writeLine('return result;');
    });
    if (orderByColumns.length > 0) {
        writer.blankLine();
        (0, codegen_util_2.writeBuildOrderByBlock)(writer, orderByColumns, orderByTypeName);
    }
    if (generateNested) {
        writer.blankLine();
        const relationType = (0, codegen_util_1.generateRelationType)(functionName, nestedType);
        writer.write(`export async function ${functionName}Nested(${functionParams}): Promise<${relationType}[]>`).block(() => {
            const params = parameters.length > 0 ? ', params' : '';
            writer.writeLine(`const selectResult = await ${functionName}(client${params});`);
            writer.write('if (selectResult.length == 0)').block(() => {
                writer.writeLine('return [];');
            });
            writer.writeLine(`return collect${relationType}(selectResult);`);
        });
    }
}
function getColumnsForQuery(capitalizedName, schemaDef) {
    if (schemaDef.queryType === 'Select' || schemaDef.returning) {
        const columns = schemaDef.columns.map(col => mapColumnInfoToTsFieldDescriptor(capitalizedName, col, schemaDef.dynamicSqlQuery2 != null));
        const escapedColumnsNames = (0, codegen_util_1.renameInvalidNames)(schemaDef.columns.map((col) => col.name));
        return columns.map((col, index) => (Object.assign(Object.assign({}, col), { name: escapedColumnsNames[index] })));
    }
    if (schemaDef.queryType === 'Copy') {
        return [];
    }
    const columns = [
        {
            name: 'rowCount',
            tsType: 'number',
            notNull: true
        }
    ];
    return columns;
}
function toDriver(variableData, param) {
    if (param.tsType === 'Date') {
        if (param.notNull && !param.optional) {
            return `new Date(${variableData})`;
        }
        return `${variableData} != null ? new Date(${variableData}) : ${variableData}`;
    }
    if (param.tsType === 'boolean') {
        return `${variableData} != null ? Boolean(${variableData}) : ${variableData}`;
    }
    return variableData;
}
function paramToDriver(param, objName) {
    if (!param.tsType.endsWith('[]')) {
        return `${objName}.${param.name}`;
    }
    return param.isArray ? `[...${objName}.${param.name}]` : `${objName}.${param.name}[0]`;
}
function isList(param) {
    return param.tsType.endsWith('[]') && !param.isArray;
}
function generateCrud(queryType, tableName, dbSchema) {
    const queryName = (0, sqlite_1.getQueryName)(queryType, tableName);
    const camelCaseName = (0, codegen_util_1.convertToCamelCaseName)(queryName);
    const capitalizedName = (0, codegen_util_1.capitalize)(camelCaseName);
    const dataTypeName = `${capitalizedName}Data`;
    const resultTypeName = `${capitalizedName}Result`;
    const paramsTypeName = `${capitalizedName}Params`;
    const writer = (0, codegen_util_1.createCodeBlockWriter)();
    const allColumns = dbSchema.filter((col) => col.table === tableName);
    const keyColumns = allColumns.filter((col) => col.column_key === 'PRI');
    if (keyColumns.length === 0) {
        keyColumns.push(...allColumns.filter((col) => col.column_key === 'UNI'));
    }
    const keys = keyColumns.map(col => (Object.assign(Object.assign({}, mapPostgresColumnSchemaToTsFieldDescriptor(col)), { optional: false })));
    const nonKeys = allColumns.filter(col => col.column_key !== 'PRI').map(col => mapPostgresColumnSchemaToTsFieldDescriptor(col));
    const codeWriter = getCodeWriter('pg');
    codeWriter.writeImports(writer, queryType);
    const uniqueDataParams = queryType === 'Update' ? nonKeys.map(col => (Object.assign(Object.assign({}, col), { optional: true }))) : [];
    if (uniqueDataParams.length > 0) {
        writer.blankLine();
        writeDataType(writer, dataTypeName, uniqueDataParams);
    }
    const uniqueParams = queryType === 'Insert' ? nonKeys : keys;
    if (uniqueParams.length > 0) {
        writer.blankLine();
        writeParamsType(writer, paramsTypeName, uniqueParams, false, '');
    }
    writer.blankLine();
    const columns = allColumns.map(col => (Object.assign(Object.assign({}, mapPostgresColumnSchemaToTsFieldDescriptor(col)), { optional: false })));
    writeResultType(writer, resultTypeName, columns);
    writer.blankLine();
    const crudParameters = {
        queryType,
        tableName,
        queryName,
        dataTypeName,
        paramsTypeName,
        resultTypeName,
        columns,
        nonKeys: nonKeys,
        keys: keys.map(col => col.name)
    };
    const result = writeCrud(writer, crudParameters);
    return result;
}
function writeCrud(writer, crudParamters) {
    const { queryType } = crudParamters;
    switch (queryType) {
        case 'Select':
            return writeCrudSelect(writer, crudParamters);
        case 'Insert':
            return writeCrudInsert(writer, crudParamters);
        case 'Update':
            return writeCrudUpdate(writer, crudParamters);
        case 'Delete':
            return writeCrudDelete(writer, crudParamters);
    }
}
function writeCrudSelect(writer, crudParamters) {
    const { tableName, queryName, paramsTypeName, resultTypeName, columns, keys } = crudParamters;
    writer.write(`export async function ${queryName}(client: pg.Client | pg.Pool | pg.PoolClient, params: ${paramsTypeName}): Promise<${resultTypeName} | null>`).block(() => {
        writer.writeLine('const sql = `');
        writer.indent().write('SELECT').newLine();
        columns.forEach((col, columnIndex) => {
            writer.indent(2).write(col.name);
            writer.conditionalWrite(columnIndex < columns.length - 1, ',');
            writer.newLine();
        });
        writer.indent().write(`FROM ${tableName}`).newLine();
        const keyName = keys[0];
        writer.indent().write(`WHERE ${keyName} = $1`).newLine();
        writer.indent().write('`').newLine();
        writer.writeLine(`return client.query({ text: sql, rowMode: 'array', values: [params.${keyName}] })`);
        writer.indent(1).write(`.then(res => res.rows.length > 0 ? mapArrayTo${resultTypeName}(res.rows[0]) : null);`).newLine();
    });
    writer.blankLine();
    writer.write(`function mapArrayTo${resultTypeName}(data: any) `).block(() => {
        writer.write(`const result: ${resultTypeName} = `).block(() => {
            columns.forEach((col, index) => {
                const separator = index < columns.length - 1 ? ',' : '';
                writer.writeLine(`${col.name}: ${toDriver(`data[${index}]`, col)}${separator}`);
            });
        });
        writer.writeLine('return result;');
    });
    return writer.toString();
}
function writeCrudInsert(writer, crudParamters) {
    const { tableName, queryName, paramsTypeName, resultTypeName, nonKeys } = crudParamters;
    writer.write(`export async function ${queryName}(client: pg.Client | pg.Pool | pg.PoolClient, params: ${paramsTypeName}): Promise<${resultTypeName} | null>`).block(() => {
        const hasOptional = nonKeys.some(field => field.optional);
        if (hasOptional) {
            writer.writeLine(`const insertColumns = [${nonKeys.map(col => `'${col.name}'`).join(', ')}] as const;`);
            writer.writeLine('const columns: string[] = [];');
            writer.writeLine('const placeholders: string[] = [];');
            writer.writeLine('const values: unknown[] = [];');
            writer.blankLine();
            writer.writeLine('let parameterNumber = 1;');
            writer.blankLine();
            writer.write('for (const column of insertColumns)').block(() => {
                writer.writeLine('const value = params[column];');
                writer.write('if (value !== undefined)').block(() => {
                    writer.writeLine('columns.push(column);');
                    writer.writeLine('placeholders.push(`$${parameterNumber++}`);');
                    writer.writeLine('values.push(value);');
                });
            });
            writer.blankLine();
            writer.writeLine('const sql = columns.length === 0');
            writer.indent().write('? `INSERT INTO roles DEFAULT VALUES RETURNING *`').newLine();
            writer.indent().write(': `INSERT INTO roles (${columns.join(\', \')})').newLine();
            writer.indent().write(`VALUES(\${placeholders.join(', ')})`).newLine();
            writer.indent().write('RETURNING *`').newLine();
            writer.blankLine();
            writer.writeLine(`return client.query({ text: sql, values })`);
        }
        else {
            writer.writeLine('const sql = `');
            writer.indent().write(`INSERT INTO ${tableName} (${nonKeys.map(field => field.name).join(',')})`).newLine();
            writer.indent().write(`VALUES (${nonKeys.map((_, index) => `$${index + 1}`).join(',')})`).newLine();
            writer.indent().write('RETURNING *').newLine();
            writer.indent().write('`').newLine();
            writer.writeLine(`return client.query({ text: sql, values: [${nonKeys.map(col => `params.${col.name}`)}] })`);
        }
        writer.indent().write(`.then(res => res.rows[0] ?? null);`);
    });
    return writer.toString();
}
function writeCrudUpdate(writer, crudParamters) {
    const { tableName, queryName, dataTypeName, paramsTypeName, resultTypeName, nonKeys, keys } = crudParamters;
    writer.write(`export async function ${queryName}(client: pg.Client | pg.Pool | pg.PoolClient, data: ${dataTypeName}, params: ${paramsTypeName}): Promise<${resultTypeName} | null>`).block(() => {
        writer.writeLine(`const updateColumns = [${nonKeys.map(col => `'${col.name}'`).join(', ')}] as const;`);
        writer.writeLine('const updates: string[] = [];');
        writer.writeLine('const values: unknown[] = [];');
        writer.writeLine('let parameterNumber = 1;');
        writer.blankLine();
        writer.write('for (const column of updateColumns)').block(() => {
            writer.writeLine('const value = data[column];');
            writer.write('if (value !== undefined)').block(() => {
                writer.writeLine('updates.push(`${column} = $${parameterNumber++}`);');
                writer.writeLine('values.push(value);');
            });
        });
        writer.writeLine('if (updates.length === 0) return null;');
        const keyName = keys[0];
        writer.writeLine(`values.push(params.${keyName});`);
        writer.blankLine();
        writer.writeLine(`const sql = \`UPDATE ${tableName} SET \${updates.join(', ')} WHERE ${keyName} = \$\${parameterNumber} RETURNING *\`;`);
        writer.writeLine('return client.query({ text: sql, values })');
        writer.indent().write('.then(res => res.rows[0] ?? null);');
    });
    return writer.toString();
}
function writeCrudDelete(writer, crudParamters) {
    const { tableName, queryName, paramsTypeName, resultTypeName, columns, keys } = crudParamters;
    const keyName = keys[0];
    writer.write(`export async function ${queryName}(client: pg.Client | pg.Pool | pg.PoolClient, params: ${paramsTypeName}): Promise<${resultTypeName} | null>`).block(() => {
        writer.writeLine('const sql = `');
        writer.indent().write(`DELETE FROM ${tableName} WHERE ${keyName} = $1`).newLine();
        writer.indent().write('`').newLine();
        writer.writeLine(`return client.query({ text: sql, rowMode: 'array', values: [params.${keyName}] })`);
        writer.indent(1).write(`.then(res => res.rows.length > 0 ? mapArrayTo${resultTypeName}(res.rows[0]) : null);`).newLine();
    });
    writer.blankLine();
    writer.write(`function mapArrayTo${resultTypeName}(data: any) `).block(() => {
        writer.write(`const result: ${resultTypeName} = `).block(() => {
            columns.forEach((col, index) => {
                const separator = index < columns.length - 1 ? ',' : '';
                writer.writeLine(`${col.name}: ${toDriver(`data[${index}]`, col)}${separator}`);
            });
        });
        writer.writeLine('return result;');
    });
    return writer.toString();
}
function mapPostgrsFieldToTsField(columns, field) {
    const tsField = {
        name: field.name,
        index: field.index,
        tsType: postgres_1.mapper.mapColumnType(columns[field.index].type),
        notNull: columns[field.index].intrinsicNotNull
    };
    return tsField;
}
function mapPostgresColumnSchemaToTsFieldDescriptor(col) {
    return {
        name: col.column_name,
        notNull: !col.is_nullable,
        optional: col.column_default,
        tsType: postgres_1.mapper.mapColumnType(col.type),
    };
}
//# sourceMappingURL=pg.js.map