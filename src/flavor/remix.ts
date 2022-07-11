import { FiberNode, Tag } from '../framework/react.js';
import { Context, SimplifiedAstNode } from '../types.js';
import { SourceMapConsumer } from 'source-map';
import * as Path from 'path';
import { createSourceFile, Node, ScriptTarget, SourceFile, SyntaxKind } from 'typescript';
import { match } from 'ts-pattern';

export async function getDetails(node: FiberNode, context?: Context): Promise<[ object, Context|undefined ]>
{
    return match<Tag, Promise<[ object, Context|undefined ]>>(node.tag)
        .with(Tag.Element, async () => {
            const { left = 0, top = 0, width = 0, height = 0 } = node.stateNode?.getBoundingClientRect() ?? {};
            let astNode: SimplifiedAstNode|undefined = context?.ast;
            const check = (n?: SimplifiedAstNode): boolean => {
                const realIndex = Array.from(node.stateNode?.parentNode?.children ?? []).findIndex(c => c === node.stateNode);
                const astIndex = n?.parent?.children.filter(c => c.kind === SyntaxKind.JsxElement).findIndex(c => c === n) ?? -1;

                return n?.original.openingElement.tagName.getText() === node.type && realIndex === astIndex;
            };

            if(astNode?.kind === SyntaxKind.SyntaxList)
            {
                astNode = astNode.children.find(n => n.kind === SyntaxKind.JsxElement && check(n));
            }

            if(check(astNode) === false)
            {
                astNode = undefined;
            }

            return [
                {
                    rect: { insetInlineStart: left, insetBlockStart: top, inlineSize: width, blockSize: height },
                    source: astNode
                        ? {
                            ...Object.fromEntries(Object.entries(astNode).filter(([ key ]) => [ 'original', 'parent', 'children' ].includes(key) === false)),
                            file: astNode?.original.getSourceFile().fileName,
                        }
                        : undefined,
                },
                astNode !== undefined
                    ? { ast: astNode.children.at(1) }
                    : undefined,
            ];
        })
        .with(Tag.Function, async () => {
            const details: Record<string, any> = {};
            let context: Context|undefined = undefined;

            if(node.type.name === 'Outlet' && node.child !== null)
            {
                // Structure =>
                // 0|  Outlet
                // 1|  |-> Context provider
                // 2|      |-> Context provider (get the route match from here)
                // 3|          |-> RemixRoute
                // 4|              |-> Context provider
                // 5|                  |-> ErrorBoundary (if set)
                // 6|                      |-> CatchBoundary (if set)
                // 7|                          |-> Actual element

                const match = node.child.child!.memoizedProps.value.matches.at(-1);
                const { pathname, route, params } = match;

                const vars = Array.from<RegExpMatchArray, string>((route?.path?.matchAll(/:(\w+)/g) ?? []), m => m[1]!);

                let element: FiberNode = node.child!.child!.child!.child!.child!;

                if(typeof element.type === 'function' && element.type.name === 'RemixErrorBoundary')
                {
                    element = element.child!;
                }

                if(typeof element.type === 'function' && element.type.name === 'RemixCatchBoundary')
                {
                    element = element.child!;
                }

                const functionString = element.type.toString();

                const code = await fetch(route.module).then(r => r.text());
                const sourceMap = await fetch(route.module + '.map').then(r => r.json());

                const offset = code.indexOf(functionString);
                const line = code.substring(0, offset).split('\n').length;
                const column = offset - code.substring(0, code.substring(0, offset).lastIndexOf('\n') + 1).length;

                const source = await SourceMapConsumer.with(sourceMap, null, consumer => {
                    const { source, ...args } = consumer.originalPositionFor({ line, column });
                    const content = consumer.sourceContentFor(source ?? '', true);
                    const file = Path.resolve(source ?? '');

                    return { file, content, ...args };
                });

                const ast = getSimplifiedAst(source.file, source.content ?? '');
                const rootNode = getNode(ast, source.line! - 1, source.column!)!.parent!;

                context = {
                    // make the return value the AST so that child components get a chance to read their source location from the ast.
                    // TODO(Chris Kruining) This is hacky af and I hate it, come up with a proper solution, or beg for PR's from smart people
                    ast: rootNode
                        .children.find((c: SimplifiedAstNode) => c.kind === SyntaxKind.Block)!
                        .children.find((c: SimplifiedAstNode) => c.kind === SyntaxKind.SyntaxList)!
                        .children.find((c: SimplifiedAstNode) => c.kind === SyntaxKind.ReturnStatement)!
                        .children.at(1)!,
                };

                details.route = {
                    pathname: pathname,
                    id: route.id,
                    module: route.module,
                    path: route.path,
                    source,
                    astNode: Object.fromEntries(Object.entries(ast).filter(([ key ]) => [ 'original', 'parent', 'children' ].includes(key) === false)),
                    params: Object.fromEntries(
                        Array.from(Object.entries(params)).filter(([ k ]) => vars.includes(k))
                    ),
                };
            }

            return [
                { ...details, source: {} },
                context
            ];
        })
        .otherwise(async () => [ {}, undefined ]);
}

function getSimplifiedAst(file: string, content: string)
{
    return recurse(createSourceFile(file, content, ScriptTarget.Latest, true));
}

const recurse = (ast: SourceFile, node?: Node, parent?: SimplifiedAstNode): SimplifiedAstNode => {
    node ??= ast;

    const n: SimplifiedAstNode = {
        start: { ...ast.getLineAndCharacterOfPosition(node.pos), index: node.pos },
        end: { ...ast.getLineAndCharacterOfPosition(node.end), index: node.end },
        kind: node.kind,
        type: SyntaxKind[node.kind],
        original: node,
        parent,
        children: []
    };

    n.children.push(...node.getChildren().map(c => recurse(ast, c, n)));

    return n;
}
const getNode = (node: SimplifiedAstNode, line: number, character: number): SimplifiedAstNode|undefined => {
    return (
        (node.start.line < line && node.end.line > line)
        || (node.start.line === line && node.start.character <= character)
        || (node.end.line === line && node.end.character > character)
    )
        ? node.children.map(c => getNode(c, line, character)).filter(c => c !== undefined).at(0) ?? node
        : undefined;
};