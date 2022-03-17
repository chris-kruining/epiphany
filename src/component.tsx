import { useEffect } from 'react';
import { match } from 'ts-pattern';
import { expose, windowEndpoint } from 'comlink';
import { Bridge, Tag } from './types.js';

export function Epiphany()
{
    if (process.env.NODE_ENV !== 'development')
    {
        return <></>;
    }

    useEffect(() => {
        const bridge: Bridge = {
            getReactFiberTree: () => getFiberNodeFromElement(document.documentElement),
            getElementFromPoint: (x: number, y: number) => {
                const element = document.elementFromPoint(x, y);

                const { left = 0, top = 0, width = 0, height = 0 } = element?.getBoundingClientRect() ?? {};
                const rect = { insetInlineStart: left, insetBlockStart: top, inlineSize: width, blockSize: height };

                const { elementType, index, key, tag, type } = getFiberNodeFromElement(element!);

                return element
                    ? { type: element.localName, rect, fiber: { elementType, index, key, tag, type } }
                    : undefined;
            },
        };

        expose(bridge, windowEndpoint(window.parent));
    }, []);

    return <></>
}

type TransferableFiberNode = {

};

const getFiberNodeFromElement = (element: Element): any => (element as any)?.[Object.getOwnPropertyNames(element).find(n => n.startsWith('__reactFiber'))!];
function getTransferableFiber(node: any, recurse: boolean = false): TransferableFiberNode
{
    const { index, key, tag, type } = node;

    const details: Record<string, any> = {};

    switch(tag)
    {
        case Tag.Element:
        {
            const { left = 0, top = 0, width = 0, height = 0 } = node.stateNode.getBoundingClientRect();
            details.rect = { insetInlineStart: left, insetBlockStart: top, inlineSize: width, blockSize: height };

            break;
        }

        case Tag.Function:
        {
            if(type.name === 'Outlet')
            {
                const matches = node.child.child.memoizedProps.value.matches;
                const id = node.child.child.child.child.memoizedProps.value.id;

                details.route = {
                    matches: matches.map(({ pathname, route }: any) => ({
                        pathname: pathname,
                        id: route.id,
                        module: route.module,
                        path: route.path
                    })),
                    id,
                };
            }

            details.source = {};

            break;
        }
    }

    const children: TransferableFiberNode[] = [];
    if(recurse)
    {
        let current = node.child;
        while(current !== null)
        {
            children.push(getTransferableFiber(current, true));

            current = current.sibling;
        }
    }

    const actualType: string = match(tag)
        .with(Tag.Element, () => type)
        .with(Tag.Class, () => type.constructor.name)
        .with(Tag.Function, () => type.name)
        .with(Tag.Text, () => 'TEXT_NODE')
        .with(Tag.ContextProvider, () => 'Context.Provider')
        .with(Tag.Forward, () => 'FORWARD')
        .otherwise(() => 'COMPLEX_TYPE')

    return {
        ...details,
        type: actualType,
        index,
        key,
        tag,
        children,
    };
}