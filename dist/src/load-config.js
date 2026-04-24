"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.resolveConfig = resolveConfig;
exports.resolveEnvVars = resolveEnvVars;
exports.resolveTsFilePath = resolveTsFilePath;
exports.buildExportMap = buildExportMap;
exports.buildExportList = buildExportList;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
function loadConfig(configPath) {
    const rawdata = node_fs_1.default.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(rawdata);
    const substitutedConfig = resolveEnvVars(config);
    return resolveConfig(configPath, substitutedConfig);
}
function resolveConfig(configPath, config) {
    const configDir = node_path_1.default.dirname(node_path_1.default.resolve(configPath));
    const resolvedDatabaseUri = isRelativeFilePath(config.databaseUri)
        ? node_path_1.default.resolve(configDir, config.databaseUri)
        : config.databaseUri;
    return Object.assign(Object.assign({}, config), { databaseUri: resolvedDatabaseUri, sqlDir: node_path_1.default.resolve(configDir, config.sqlDir) });
}
// Replaces ${ENV_VAR} with values from process.env
function resolveEnvVars(config) {
    const newConfig = Object.assign(Object.assign({}, config), { databaseUri: resolveEnvVar(config.databaseUri) });
    if (config.authToken != null) {
        newConfig.authToken = resolveEnvVar(config.authToken);
    }
    return newConfig;
}
function resolveEnvVar(rawValue) {
    return rawValue.replace(/\$\{([\w\d_]+)\}/g, (_, varName) => {
        const envVal = process.env[varName];
        if (envVal === undefined) {
            console.warn(`Warning: Environment variable ${varName} is not defined.`);
        }
        return envVal !== null && envVal !== void 0 ? envVal : '';
    });
}
function isRelativeFilePath(uri) {
    return typeof uri === 'string' && !uri.includes('://') && !node_path_1.default.isAbsolute(uri);
}
function resolveTsFilePath(sqlPath, sqlDir, outDir) {
    const outputBase = outDir || sqlDir;
    const relativeDir = node_path_1.default.relative(sqlDir, node_path_1.default.dirname(sqlPath));
    const fileNameWithoutExt = node_path_1.default.basename(sqlPath, '.sql');
    const tsFileName = `${fileNameWithoutExt}.ts`;
    const tsFilePath = node_path_1.default.join(outputBase, relativeDir, tsFileName);
    return tsFilePath;
}
function buildExportMap(rootDir) {
    const exportMap = new Map();
    function walk(dir) {
        const entries = node_fs_1.default.readdirSync(dir, { withFileTypes: true });
        const tsFiles = [];
        for (const entry of entries) {
            const fullPath = node_path_1.default.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            }
            else if (isExportableTsFile(entry)) {
                tsFiles.push(entry.name);
            }
        }
        if (tsFiles.length > 0) {
            exportMap.set(dir, tsFiles);
        }
    }
    walk(rootDir);
    return exportMap;
}
function buildExportList(dir) {
    const entries = node_fs_1.default.readdirSync(dir, { withFileTypes: true });
    const exports = entries
        .filter(isExportableTsFile)
        .map((entry) => entry.name);
    return exports;
}
function isExportableTsFile(entry) {
    return entry.isFile() &&
        entry.name.endsWith('.ts') &&
        entry.name !== 'index.ts' &&
        !entry.name.endsWith('.d.ts');
}
//# sourceMappingURL=load-config.js.map