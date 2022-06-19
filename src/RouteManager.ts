import { Route } from './Route';
import { IncomingMessage, ServerResponse } from 'http';
import { EndPoints } from './EndPoints';
import { UserController } from './Controllers/UserController';
import { Application } from './Application';
import { StatusCode } from './StatusCode';

export class RouteManager {

  private _endPoints : EndPoints;
  private _userController : UserController | null;
  private _currentRequest : IncomingMessage | null;
  private _currentResponse : ServerResponse | null;
  
  constructor () {
    this._endPoints = new EndPoints();
    this._currentRequest = null;
    this._currentResponse = null;
    this._userController = null;
  }

  public updateRouteManager(request: IncomingMessage, response: ServerResponse) {
    this._currentRequest = request;
    this._currentResponse = response;
    this._userController = new UserController(Application.users, this._currentResponse);
  }

  public handleRequest () : void {
    if (this._currentRequest !== null && this._currentRequest.url !== undefined) {
      if (this._currentRequest.url === this._endPoints._users._url) {
        if (this._currentRequest.method !== undefined && this._endPoints._methods.includes(this._currentRequest.method)) {
          switch (this._currentRequest.method) {
            case 'GET':
              this._userController?.getAllUsers();
              return;
            case 'POST':
              this._userController?.createUser(this._currentRequest);
              return;
          }
        }
      } else if (this.checkRoute(this._currentRequest.url)) {
        const rawRouteParts : string[] = this._endPoints.parseRoute(this._currentRequest.url)
        const rawId : string = rawRouteParts[rawRouteParts.length - 1];
        switch (this._currentRequest.method) {
          case 'GET':
            this._userController?.getUserById(rawId);
            return;
          case 'PUT':
            this._userController?.updateUserById(rawId, this._currentRequest);
            return;
          case 'DELETE':
            this._userController?.deleteUserById(rawId);
            return;
        }
      }
    }

    if (this._currentResponse !== null) {
      this._currentResponse.statusCode = StatusCode.NotFound;
      this._currentResponse.end('No such path exists!');
    }
  }

  public checkRoute (rawRoute : string) : boolean {
    const srcRouteParts = this._endPoints.parseRoute(this._endPoints._userById._url);
    const rawRouteParts = this._endPoints.parseRoute(rawRoute);
    if (srcRouteParts.length === rawRouteParts.length &&
        srcRouteParts[0] === rawRouteParts[0] &&
        srcRouteParts[1] === rawRouteParts[1]) {
      return true;
    }
    return false;
  }
}