import { useEffect } from 'react';
import { expose, windowEndpoint } from 'comlink';
import { Bridge, Framework, Flavor } from './types.js';
import { FiberNode, getNodeFromElement, getNode } from './framework/react.js';
import { getDetails } from './flavor/remix.js';
import React from 'react';
import { SourceMapConsumer } from 'source-map';

const framework: Framework<FiberNode> = {
    getNode,
    getNodeFromElement,
};
const flavor: Flavor<FiberNode> = {
    getDetails,
};

export function Epiphany()
{
    if (process.env.NODE_ENV !== 'development')
    {
        return <></>;
    }

    useEffect(() => {
        (SourceMapConsumer as any).initialize({
            "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm",
        });

        const bridge: Bridge = {
            getTree: () => framework.getNodeFromElement(document.documentElement, flavor, true),
            getNode: (id: string) => framework.getNode(id, flavor),
            getNodeFromPoint: async (x: number, y: number) => {
                const element = document.elementFromPoint(x, y);

                return element
                    ? await framework.getNodeFromElement(element, flavor)
                    : undefined;
            },
        };

        expose(bridge, windowEndpoint(window.parent));
    }, []);

    return <></>
}