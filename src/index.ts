import { writeFile } from "node:fs/promises";
import path from "node:path";
import * as ts from "typescript";

const defaultCompilerOptions: ts.CompilerOptions = {
	target: ts.ScriptTarget.ES5,
	module: ts.ModuleKind.ES2022,
	moduleResolution: ts.ModuleResolutionKind.Node16,
};

/** Print out the source of the given node for debugging purposes */
function getNodeSource(program: ts.Program, node: ts.Node) {}

export async function createParsers(
	fileNames: string[],
	compilerOptions: ts.CompilerOptions = defaultCompilerOptions,
	compilerHost: ts.CompilerHost = ts.createCompilerHost(compilerOptions),
): Promise<string[]> {
	const program = ts.createProgram(fileNames, compilerOptions, compilerHost);
	const checker = program.getTypeChecker();

	// To print the AST, we'll use TypeScript's printer
	// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#creating-and-printing-a-typescript-ast
	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

	// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#type-checker-apis

	// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#traversing-the-ast-with-a-little-linter

	const outFiles: string[] = [];
	const sourceFiles = program
		.getSourceFiles()
		.filter((s) => fileNames.includes(path.resolve(s.fileName)));

	sourceFiles.forEach(async (sourceFile) => {
		if (!sourceFile.isDeclarationFile) {
			console.error(
				`Error: ${sourceFile.fileName} is not a declaration file. Skipping.`,
			);
		}

		// Walk the AST
		ts.forEachChild(sourceFile, visit);

		async function visit(node: ts.Node) {
			console.log(node.kind, ts.SyntaxKind[node.kind]);
			// if (ts.isTypeAliasDeclaration(node)) {
			// 	const symbol = checker.getSymbolAtLocation(node.name);
			// 	if (!symbol) {
			// 		throw new Error(`Could not find symbol for ${node.name.getText()}`);
			// 	}

			// 	const type = checker.getDeclaredTypeOfSymbol(symbol);
			// 	const properties = type.getProperties();

			// 	for (const property of properties) {
			// 		const propertyType = checker.getTypeOfSymbolAtLocation(
			// 			property,
			// 			node,
			// 		);
			// 		console.log(property.name, propertyType);
			// 	}
			// }

			ts.forEachChild(node, visit);
		}

		// Print the AST
		const outFile = sourceFile.fileName.replace(".d.ts", ".parser.ts");

		const result = printer.printNode(
			ts.EmitHint.Unspecified,
			sourceFile,
			sourceFile,
		);

		// Write the result to a file
		outFiles.push(outFile);
		await writeFile(outFile, result);
	});

	return outFiles;
}
