import * as TypeScript from "typescript";
import * as fs from "fs";
import * as path from "path";
import { ClassDeclaration, Node, Program, SourceFile } from "typescript";
import { AsynchronousImplementationGenerator } from "./asynchronousImplementationGenerator";
import { SynchronousImplementationGenerator } from "./synchronousImplementationGenerator";

const TEMPLATE_SOURCE_BASE = path.join(__dirname, "..", "template");
const GENERATED_SOURCE_BASE = path.join(__dirname, "..", "src");

const GENERATED_HEADER = `//***********************************//
//    GENERATED FILE. DO NOT EDIT!   //
//***********************************//

`;

function main() {
    const program = readProgram(TEMPLATE_SOURCE_BASE);

    const implClasses = readClasses(program, "implementationTemplate.ts");

    const generatedSyncSource = TypeScript.transform(
        readSource(program, "enumerable.ts"),
        [context => source => new SynchronousImplementationGenerator(source, implClasses, context).generate()]
    ).transformed[0];

    const generatedAsyncSource = TypeScript.transform(
        readSource(program, "asyncEnumerable.ts"),
        [context => source => new AsynchronousImplementationGenerator(source, implClasses, context).generate()]
    ).transformed[0];

    print(generatedSyncSource, generatedAsyncSource);

    return;
}

function readProgram(sourceBase: string): Program {
    const configFile = TypeScript.findConfigFile(sourceBase, TypeScript.sys.fileExists);

    if (!configFile) {
        throw new Error("tsconfig.json not found.");
    }

    const { config } = TypeScript.readConfigFile(configFile, TypeScript.sys.readFile);

    const { options, fileNames, errors } = TypeScript.parseJsonConfigFileContent(config, TypeScript.sys, sourceBase);

    return TypeScript.createProgram({ options, rootNames: fileNames, configFileParsingDiagnostics: errors });
}

function readSource(program: Program, sourceFile: string): SourceFile {
    const filePath = program.getRootFileNames().find(name => name.endsWith(sourceFile));

    if (!filePath) {
        throw new Error(`Source file ${sourceFile} not found.`);
    }

    const source = program.getSourceFile(filePath);

    if (!source) {
        throw new Error(`Source file ${filePath} not found.`);
    }

    return source;
}

function readClasses(program: Program, sourceFile: string): Map<string, ClassDeclaration> {
    const source = readSource(program, sourceFile);
    const classes = new Map<string, ClassDeclaration>();

    function readClassesFromNode(node: Node): void {
        if (TypeScript.isClassDeclaration(node)) {
            if (!node.name) {
                throw new Error("Template file should not contain anonymous classes.");
            }

            classes.set(node.name.text, node);

            return;
        }

        node.forEachChild(readClassesFromNode);
    }

    readClassesFromNode(source);

    return classes;
}

function print(...sources: SourceFile[]): void {
    const printer = TypeScript.createPrinter();

    for (const source of sources) {
        fs.writeFileSync(path.join(GENERATED_SOURCE_BASE, path.basename(source.fileName)), GENERATED_HEADER + printer.printFile(source));
    }
}

main();
