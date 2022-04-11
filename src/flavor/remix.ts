import { FiberNode, Tag } from '../framework/react.js';
import { SourceMapConsumer } from 'source-map';
import * as Path from 'path';

export async function getDetails(node: FiberNode): Promise<object>
{
    switch (node.tag)
    {
        case Tag.Element:
        {
            const { left = 0, top = 0, width = 0, height = 0 } = node.stateNode?.getBoundingClientRect() ?? {};

            return {
                rect: { insetInlineStart: left, insetBlockStart: top, inlineSize: width, blockSize: height },
            };
        }

        case Tag.Function:
        {
            const details: Record<string, any> = {};

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

                details.route = {
                    pathname: pathname,
                    id: route.id,
                    module: route.module,
                    path: route.path,
                    source,
                    params: Object.fromEntries(
                        Array.from(Object.entries(params)).filter(([ k ]) => vars.includes(k))
                    ),
                };
            }

            return {
                ...details,
                source: {}
            };
        }
    }

    return {};
}