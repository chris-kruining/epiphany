import { FiberNode, Tag } from '../framework/react.js';
import { SourceMapConsumer } from 'source-map';

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
                // 5|                  |-> ErrorBoundary
                // 6|                      |-> CatchBoundary
                // 7|                          |-> Actual element

                const match = node.child.child!.memoizedProps.value.matches.at(-1);
                const { pathname, route, params } = match;

                const vars = Array.from<RegExpMatchArray, string>((route?.path?.matchAll(/:(\w+)/g) ?? []), m => m[1]!);

                const functionString = node.child!.child!.child!.child!.child!.child!.child!.type.toString();

                const code = await fetch(route.module).then(r => r.text());
                const sourceMap = await fetch(route.module + '.map').then(r => r.json());

                const offset = code.indexOf(functionString);
                const line = code.substring(0, offset).split('\n').length;
                const column = offset - code.substring(0, code.substring(0, offset).lastIndexOf('\n') + 1).length;

                const original = await SourceMapConsumer.with(sourceMap, null, consumer => {
                    return consumer.originalPositionFor({ line, column });
                });

                console.log(code, functionString, offset, line, column, sourceMap, original);

                details.route = {
                    pathname: pathname,
                    id: route.id,
                    module: route.module,
                    path: route.path,
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