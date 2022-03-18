// import { readConfig } from '@remix-run/dev/config';
// import { readFile } from 'fs/promises';
// import {
//     Statement,
//     VariableStatement,
//     ObjectLiteralExpression,
//     Identifier,
//     createSourceFile,
//     ScriptTarget,
//     SyntaxKind,
// } from 'typescript';
// import expressionToLiteral from 'ts-ast-to-literal';
// import { AssetsManifest } from '@remix-run/react/entry.js';
//
// export const getConfig = async (root: string) => readConfig(root);
//
// export async function getManifest(root: string)
// {
//     const conf = await getConfig(root);
//     const file = await readFile(conf.serverBuildPath);
//     const source = createSourceFile('temp.ts', file.toString(), ScriptTarget.ESNext);
//
//     const manifest = source.statements
//         .filter((s: Statement): s is VariableStatement => s.kind === SyntaxKind.VariableStatement)
//         .flatMap(s => s.declarationList.declarations)
//         .find(d => (d.name as Identifier).escapedText === 'assets_manifest_default')
//         ?.initializer as ObjectLiteralExpression|undefined;
//
//     if(manifest === undefined)
//     {
//         throw new Error(`Unable to locate the manifest`);
//     }
//
//     return expressionToLiteral<AssetsManifest>(manifest);
// }