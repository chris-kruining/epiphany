"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Epiphany = void 0;
function Epiphany() {
    if (process.env.NODE_ENV !== 'development') {
        return <></>;
    }
    useEffect(function () {
        // window.addEventListener('message', e => console.log(e.origin, e.data));
        // const oldPostMessage = window.parent.postMessage;
        // window.parent.postMessage = (...args) => {
        //     console.log('POST MESSAGE', ...args);
        //
        //     oldPostMessage(...args);
        // };
        // initialize(window);
        //
        // // Wait for the frontend to let us know that it's ready.
        // function onMessage({ data }: any) {
        //     switch (data.type) {
        //         case 'activate-backend':
        //             window.removeEventListener('message', onMessage);
        //
        //             activate(window);
        //
        //             break;
        //         default:
        //             break;
        //     }
        // }
        //
        // window.addEventListener('message', onMessage);
        window.addEventListener('message', function (_a) {
            var _b;
            var data = _a.data;
            switch (data.event) {
                case 'getReactFiberTree':
                    {
                        var root = getFiberNodeFromElement(document.documentElement);
                        console.log(root);
                        window.parent.postMessage({
                            event: 'reactFiberTree',
                            id: data.id,
                            tree: getTransferableFiber(root, true),
                        }, '*');
                        break;
                    }
                case 'getElementFromPoint':
                    {
                        var element = document.elementFromPoint(data.x, data.y);
                        var _c = (_b = element === null || element === void 0 ? void 0 : element.getBoundingClientRect()) !== null && _b !== void 0 ? _b : {}, _d = _c.left, left = _d === void 0 ? 0 : _d, _e = _c.top, top_1 = _e === void 0 ? 0 : _e, _f = _c.width, width = _f === void 0 ? 0 : _f, _g = _c.height, height = _g === void 0 ? 0 : _g;
                        var rect = { insetInlineStart: left, insetBlockStart: top_1, inlineSize: width, blockSize: height };
                        var _h = getFiberNodeFromElement(element), elementType = _h.elementType, index = _h.index, key = _h.key, tag = _h.tag, type = _h.type;
                        window.parent.postMessage({
                            event: 'elementFromPoint',
                            id: data.id,
                            element: element
                                ? { type: element.localName, rect: rect, fiber: { elementType: elementType, index: index, key: key, tag: tag, type: type } }
                                : undefined
                        }, '*');
                        break;
                    }
                default:
                    {
                        // console.log(data);
                        break;
                    }
            }
        });
    }, []);
    return <></>;
}
exports.Epiphany = Epiphany;
