import { useEffect } from 'react';
import { expose, windowEndpoint } from 'comlink';
import { Bridge, Framework, Flavor } from './types.js';
import { FiberNode, getNodeFromElement } from './framework/react.js';
import { getDetails } from './flavor/remix.js';
import React from 'react';

const framework: Framework<FiberNode> = {
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
        const bridge: Bridge = {
            // initialize: (framework: string, flavor: string) => {
            //
            // },
            getTree: () => framework.getNodeFromElement(document.documentElement, flavor),
            getElementFromPoint: (x: number, y: number) => {
                const element = document.elementFromPoint(x, y);

                return element
                    ? framework.getNodeFromElement(element, flavor)
                    : undefined;
            },
        };

        expose(bridge, windowEndpoint(window.parent));
    }, []);

    return <></>
}