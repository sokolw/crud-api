import { IncomingMessage, ServerResponse } from 'http';

const PATH_PARAMS = `/:`;
const REGEXP_PATH_PARTS = /\/|\\/g;

export interface PathParams {
  [index: string]: string;
}

export type ReqWithParams = IncomingMessage & { params: PathParams };

export class Router {
  private _handlers = new Map<
    string,
    Map<string, (req: IncomingMessage | ReqWithParams, res: ServerResponse) => void>
  >();

  handle(path: string, method: string, handler: (req: IncomingMessage | ReqWithParams, res: ServerResponse) => void) {
    if (this.handlers.has(path)) {
      const pathHandlers = this.handlers.get(path);

      if (pathHandlers && !pathHandlers.has(method)) {
        pathHandlers.set(method, handler);
      }
    } else {
      this.handlers.set(path, new Map([[method, handler]]));
    }
  }

  get handlers() {
    return this._handlers;
  }

  checkPathParams(path: string): boolean {
    return path.indexOf(PATH_PARAMS) >= 0;
  }

  getPathParts(path: string): Array<string> {
    return path.split(REGEXP_PATH_PARTS).filter((item) => !!item);
  }

  comparePathParts(partsBase: Array<string>, partsRaw: Array<string>): PathParams | boolean {
    const result: PathParams = {};

    for (let i = 0; i < partsBase.length; i++) {
      if (partsBase[i].startsWith(':')) {
        result[partsBase[i].slice(1)] = partsRaw[i];
        continue;
      }

      if (partsBase[i] !== partsRaw[i]) {
        return false;
      }
    }
    return result;
  }

  trimLastSlash(path: string) {
    if (path.endsWith(`/`) || path.endsWith(`\\`)) {
      return `/${this.getPathParts(path).join('/')}`;
    }
    return path;
  }
}
