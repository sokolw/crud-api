import http, { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { RouteManager } from './RouteManager';
import { StatusCode } from './StatusCode';

export class Server {
  private unit : http.Server;
  private _routeManager : RouteManager;
  private readonly _port : number;

  constructor(port : number) {
    this._port = port;
    this._routeManager = new RouteManager();
    this.unit = createServer((request: IncomingMessage, response: ServerResponse) => {
      try {
        this._routeManager.updateRouteManager(request, response);
        this._routeManager.handleRequest();
      } catch {
        response.statusCode = StatusCode.InternalServerError;
        response.end('"Internal Server Error". The server has encountered a previous one that it does not know how to handle!');
      }
    });
    
    this.start();
  }

  private start() : void {
    this.unit.listen(this._port);
  }
}