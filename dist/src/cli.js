#!/usr/bin/env node
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
const node_fs_1 = __importDefault(require("node:fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_path_1 = __importDefault(require("node:path"));
const chokidar_1 = __importDefault(require("chokidar"));
const yargs_1 = __importDefault(require("yargs"));
const code_generator_1 = require("./codegen/code-generator");
const sql_generator_1 = require("./sql-generator");
const Either_1 = require("fp-ts/lib/Either");
const glob_1 = require("glob");
const schema_info_1 = require("./schema-info");
const sqlite_1 = require("./codegen/sqlite");
const pg_1 = require("./codegen/pg");
const lodash_uniqby_1 = __importDefault(require("lodash.uniqby"));
const load_config_1 = require("./load-config");
const codegen_util_1 = require("./codegen/shared/codegen-util");
const CRUD_FOLDER = 'crud';
function parseArgs() {
    return yargs_1.default
        .usage('Usage: $0 [options] DIRECTORY')
        .option('config', {
        describe: 'Path to the TypeSQL config file (e.g., ./src/sql/typesql.json)',
        type: 'string',
        default: './typesql.json'
    })
        .option('env-file', {
        describe: 'Path to the .env file to load',
        type: 'string'
    })
        .command('init', 'generate config file', () => {
        const config = {
            databaseUri: 'mysql://root:password@localhost/mydb',
            sqlDir: './sqls',
            client: 'mysql2',
            includeCrudTables: []
        };
        const configPath = './typesql.json';
        (0, code_generator_1.writeFile)(configPath, JSON.stringify(config, null, 4));
        console.log('Init file generated:', configPath);
    })
        .command(['compile [options]', 'c [options]'], 'Compile the queries and generate ts files', (yargs) => {
        return yargs.option('watch', {
            alias: 'w',
            describe: 'Watch for changes in the folders',
            type: 'boolean',
            default: false
        });
    }, (args) => {
        const envFile = args.envFile;
        if (envFile) {
            if (node_fs_1.default.existsSync(envFile)) {
                dotenv_1.default.config({ path: envFile, quiet: true });
            }
            else {
                console.warn(`Warning: .env file not found: ${envFile}`);
            }
        }
        const config = (0, load_config_1.loadConfig)(args.config);
        compile(args.watch, config);
    })
        .command(['generate <option> <sql-name>', 'g <option> <sql-name>'], 'generate sql queries', (yargs) => {
        return yargs
            .positional('option', {
            type: 'string',
            demandOption: true,
            choices: ['select', 'insert', 'update', 'delete', 's', 'i', 'u', 'd']
        })
            .positional('sql-name', {
            type: 'string',
            demandOption: true
        })
            .option('table', {
            alias: 't',
            type: 'string',
            demandOption: true
        })
            .strict();
    }, (args) => {
        const config = (0, load_config_1.loadConfig)(args.config);
        const genOption = args.option;
        writeSql(genOption, args.table, args['sql-name'], config);
    })
        .demand(1, 'Please specify one of the commands!')
        .wrap(null)
        .strict().argv;
}
function validateDirectories(dir) {
    if (!node_fs_1.default.statSync(dir).isDirectory()) {
        console.log(`The argument is not a directory: ${dir}`);
    }
}
function watchDirectories(client, sqlDir, outDir, dbSchema, config) {
    const dirGlob = `${sqlDir}/**/*.sql`;
    chokidar_1.default
        .watch(dirGlob, {
        awaitWriteFinish: {
            stabilityThreshold: 100
        }
    })
        .on('add', (path) => rewiteFiles(client, path, sqlDir, outDir, dbSchema, isCrudFile(sqlDir, path), config))
        .on('change', (path) => rewiteFiles(client, path, sqlDir, outDir, dbSchema, isCrudFile(sqlDir, path), config));
}
function rewiteFiles(client, sqlPath, sqlDir, outDir, schemaInfo, isCrudFile, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const tsFilePath = (0, load_config_1.resolveTsFilePath)(sqlPath, sqlDir, outDir);
        yield (0, code_generator_1.generateTsFile)(client, sqlPath, tsFilePath, schemaInfo, isCrudFile);
        const tsDir = node_path_1.default.dirname(tsFilePath);
        if (config.generateIndexFiles !== false) {
            writeIndexFileFor(tsDir, config);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        parseArgs();
    });
}
function compile(watch, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const { sqlDir, outDir = sqlDir, databaseUri, client: dialect, attach, loadExtensions, authToken } = config;
        validateDirectories(sqlDir);
        const databaseClientResult = yield (0, schema_info_1.createClient)(databaseUri, dialect, attach, loadExtensions, authToken);
        if (databaseClientResult.isErr()) {
            console.error(`Error: ${databaseClientResult.error.description}.`);
            return;
        }
        const includeCrudTables = config.includeCrudTables || [];
        const databaseClient = databaseClientResult.value;
        const dbSchema = yield (0, schema_info_1.loadSchemaInfo)(databaseClient, config.schemas);
        if (dbSchema.isErr()) {
            console.error(`Error: ${dbSchema.error.description}.`);
            return;
        }
        yield generateCrudTables(outDir, dbSchema.value, includeCrudTables);
        const dirGlob = `${sqlDir}/**/*.sql`;
        const sqlFiles = (0, glob_1.globSync)(dirGlob);
        const filesGeneration = sqlFiles.map((sqlPath) => (0, code_generator_1.generateTsFile)(databaseClient, sqlPath, (0, load_config_1.resolveTsFilePath)(sqlPath, sqlDir, outDir), dbSchema.value, isCrudFile(sqlDir, sqlPath)));
        yield Promise.all(filesGeneration);
        if (config.generateIndexFiles !== false) {
            writeIndexFile(outDir, config);
        }
        if (watch) {
            console.log('watching mode!');
            watchDirectories(databaseClient, sqlDir, outDir, dbSchema.value, config);
        }
        else {
            (0, schema_info_1.closeClient)(databaseClient);
        }
    });
}
function writeIndexFile(outDir, config) {
    const exportMap = (0, load_config_1.buildExportMap)(outDir);
    for (const [dir, files] of exportMap.entries()) {
        const indexContent = generateIndexContent(files, config.moduleExtension);
        const indexPath = node_path_1.default.join(dir, 'index.ts');
        (0, code_generator_1.writeFile)(indexPath, indexContent);
    }
}
function writeIndexFileFor(tsDir, config) {
    if (node_fs_1.default.existsSync(tsDir)) {
        const tsFiles = (0, load_config_1.buildExportList)(tsDir);
        const indexContent = generateIndexContent(tsFiles, config.moduleExtension);
        const tsPath = node_path_1.default.join(tsDir, 'index.ts');
        (0, code_generator_1.writeFile)(tsPath, indexContent);
    }
}
//Move to code-generator
function generateIndexContent(tsFiles, moduleExtension) {
    const writer = (0, codegen_util_1.createCodeBlockWriter)();
    for (const filePath of tsFiles) {
        const fileName = node_path_1.default.basename(filePath, '.ts'); //remove the ts extension
        const suffix = moduleExtension ? `.${moduleExtension}` : '.js';
        writer.writeLine(`export * from "./${fileName}${suffix}";`);
    }
    return writer.toString();
}
function writeSql(stmtType, tableName, queryName, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const { sqlDir, databaseUri, client: dialect } = config;
        const clientResult = yield (0, schema_info_1.createClient)(databaseUri, dialect);
        if (clientResult.isErr()) {
            console.error(clientResult.error.name);
            return false;
        }
        const client = clientResult.value;
        const columnsOption = yield (0, schema_info_1.loadTableSchema)(client, tableName);
        if (columnsOption.isErr()) {
            console.error(columnsOption.error.description);
            return false;
        }
        const columns = columnsOption.value;
        const filePath = `${sqlDir}/${queryName}`;
        const generatedOk = checkAndGenerateSql(client.type, filePath, stmtType, tableName, columns);
        return generatedOk;
    });
}
function checkAndGenerateSql(dialect, filePath, stmtType, tableName, columns) {
    if (columns.length === 0) {
        console.error(`Got no columns for table '${tableName}'. Did you type the table name correclty?`);
        return false;
    }
    const generatedSql = generateSql(dialect, stmtType, tableName, columns);
    (0, code_generator_1.writeFile)(filePath, generatedSql);
    console.log('Generated file:', filePath);
    return true;
}
function generateSql(dialect, stmtType, tableName, columns) {
    switch (stmtType) {
        case 'select':
        case 's':
            return (0, sql_generator_1.generateSelectStatement)(dialect, tableName, columns);
        case 'insert':
        case 'i':
            return (0, sql_generator_1.generateInsertStatement)(dialect, tableName, columns);
        case 'update':
        case 'u':
            return (0, sql_generator_1.generateUpdateStatement)(dialect, tableName, columns);
        case 'delete':
        case 'd':
            return (0, sql_generator_1.generateDeleteStatement)(dialect, tableName, columns);
    }
}
main().then(() => console.log('finished!'));
function _filterTables(schemaInfo, includeCrudTables) {
    const allTables = schemaInfo.columns.map(col => ({ schema: col.schema, table: col.table }));
    const uniqueTables = (0, lodash_uniqby_1.default)(allTables, (item) => `${item.schema}:${item.table}`);
    const filteredTables = filterTables(uniqueTables, includeCrudTables);
    return filteredTables;
}
function generateCrudTables(sqlFolderPath, schemaInfo, includeCrudTables) {
    return __awaiter(this, void 0, void 0, function* () {
        const filteredTables = _filterTables(schemaInfo, includeCrudTables);
        for (const tableInfo of filteredTables) {
            const tableName = tableInfo.table;
            const filePath = `${sqlFolderPath}/${CRUD_FOLDER}/${tableName}/`;
            if (schemaInfo.kind === 'mysql2') {
                const columns = schemaInfo.columns.filter((col) => col.table === tableName);
                checkAndGenerateSql(schemaInfo.kind, `${filePath}select-from-${tableName}.sql`, 'select', tableName, columns);
                checkAndGenerateSql(schemaInfo.kind, `${filePath}insert-into-${tableName}.sql`, 'insert', tableName, columns);
                checkAndGenerateSql(schemaInfo.kind, `${filePath}update-${tableName}.sql`, 'update', tableName, columns);
                checkAndGenerateSql(schemaInfo.kind, `${filePath}delete-from-${tableName}.sql`, 'delete', tableName, columns);
            }
            else {
                generateAndWriteCrud(schemaInfo.kind, `${filePath}select-from-${tableName}.ts`, 'Select', tableName, schemaInfo.columns);
                generateAndWriteCrud(schemaInfo.kind, `${filePath}insert-into-${tableName}.ts`, 'Insert', tableName, schemaInfo.columns);
                generateAndWriteCrud(schemaInfo.kind, `${filePath}update-${tableName}.ts`, 'Update', tableName, schemaInfo.columns);
                generateAndWriteCrud(schemaInfo.kind, `${filePath}delete-from-${tableName}.ts`, 'Delete', tableName, schemaInfo.columns);
            }
        }
    });
}
function generateAndWriteCrud(client, filePath, queryType, tableName, columns) {
    const content = client === 'pg' ? (0, pg_1.generateCrud)(queryType, tableName, columns) : (0, sqlite_1.generateCrud)(client, queryType, tableName, columns);
    (0, code_generator_1.writeFile)(filePath, content);
    console.log('Generated file:', filePath);
}
function filterTables(allTables, includeCrudTables) {
    const selectAll = includeCrudTables.find((filter) => filter === '*');
    return selectAll ? allTables : allTables.filter((t) => includeCrudTables.find((t2) => t.table === t2) != null);
}
function selectAllTables(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const selectTablesResult = yield (0, schema_info_1.selectTables)(client);
        if ((0, Either_1.isLeft)(selectTablesResult)) {
            return (0, Either_1.left)(`Error selecting table names: ${selectTablesResult.left.description}`);
        }
        return selectTablesResult;
    });
}
//https://stackoverflow.com/a/45242825
function isCrudFile(sqlDir, sqlFile) {
    const relative = node_path_1.default.relative(`${sqlDir}/${CRUD_FOLDER}`, sqlFile);
    const result = relative != null && !relative.startsWith('..') && !node_path_1.default.isAbsolute(relative);
    return result;
}
//# sourceMappingURL=cli.js.map