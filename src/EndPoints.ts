import { Route } from './Route';
import { User } from './Models/User';

export class EndPoints {

  public readonly _methods: Array<string>;
  public readonly _users : Route;
  public readonly _userById : Route;
  
  constructor() {
    this._methods = ['GET', 'POST', 'PUT', 'DELETE'];
    this._users = new Route('/api/users');
    this._userById = new Route('/api/users/${userId}');
  }

  public parseRoute(route : string) : Array<string> {
    const routeParts: Array<string> = route.split(/\/|\\/g).slice(1);
    return routeParts;
  }
}


// this.mapEndPoints = new Map<string, Array<Route>>([
//   ['GET', [this.toUsers, this.toUserById]],
//   ['POST', [this.toUsers]],
//   ['PUT', [this.toUserById]],
//   ['DELETE', [this.toUserById]],
// ]);