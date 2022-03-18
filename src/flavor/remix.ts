import { FiberNode, Tag } from '../framework/react.js';

export function getDetails(node: FiberNode): object
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
                const match = node.child.child!.memoizedProps.value.matches.at(-1);
                const { pathname, route, params } = match;

                const vars = Array.from<RegExpMatchArray, string>((route?.path?.matchAll(/:(\w+)/g) ?? []), m => m[1]!);

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