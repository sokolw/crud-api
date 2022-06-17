import { User } from './../Models/User';
import { ServerResponse, IncomingMessage } from 'http';
import { EOL, type } from 'os';
import { validate } from 'uuid';
import { StatusCode } from '../StatusCode';
import { IUser } from './../Models/IUser';

export class UserController {

  private readonly _virtualDb : Array<User>;
  private readonly _response : ServerResponse;

  constructor(virtualDb: Array<User>, response : ServerResponse) {
    this._virtualDb = virtualDb;
    this._response = response;
  }

  public getAllUsers () : void {
    // const result : string = `[${EOL}${this._virtualDb.map((item : User) => JSON.stringify(item, null, 3)).join(`,${EOL}`)}${EOL}]`;
    const result : string = JSON.stringify(this._virtualDb, null, 2);
    this._response.statusCode = StatusCode.Ok;
    this._response.end(result);
  }

  public getUserById (id : string) {
    if (validate(id)) {
      const user : User | undefined = this._virtualDb.find((item : User) => item.id === id);
      if (user instanceof User) {
        this._response.statusCode = StatusCode.Ok;
        this._response.end(JSON.stringify(user, null, 2));
      } else {
        this._response.statusCode = StatusCode.NotFound;
        this._response.end('This user does not exist!');
      }
    } else {
      this._response.statusCode = StatusCode.BadRequest;
      this._response.end('This user id is invalid!');
    }
  }

  public async createUser (request : IncomingMessage) : Promise<void> {
    const parsedObj : unknown = await this.parseJSON(request);

    if (parsedObj !== null && this.isValidUser(parsedObj)) {
      const validUser = parsedObj as IUser;
      this._virtualDb.push(new User(validUser.username, validUser.age, validUser.hobbies));

      this._response.statusCode = StatusCode.Created;
      this._response.end(JSON.stringify(this._virtualDb[this._virtualDb.length -1], null, 2));
    } else {
      this._response.statusCode = StatusCode.BadRequest;
      this._response.end('Incorrect request body or request body does not contain required fields!');
    }
  }

  public async updateUserById (id : string, request : IncomingMessage) : Promise<void> {
    if (validate(id)) {
      const user : User | undefined = this._virtualDb.find((item : User) => item.id === id);
      if (user instanceof User) {
        const parsedObj : unknown = await this.parseJSON(request);

        if (parsedObj !== null && this.isValidUser(parsedObj)) {
          const validUser = parsedObj as IUser;
          if (user.username !== validUser.username){
            user.username = validUser.username;
          }
          if (user.age !== validUser.age){
            user.age = validUser.age;
          }
          user.hobbies = validUser.hobbies;
    
          this._response.statusCode = StatusCode.Ok;
          this._response.end(JSON.stringify(user, null, 2));
        } else {
          this._response.statusCode = StatusCode.BadRequest;
          this._response.end('Incorrect request body or request body does not contain required fields!');
        }
      } else {
        this._response.statusCode = StatusCode.NotFound;
        this._response.end('This user does not exist!');
      }
    } else {
      this._response.statusCode = StatusCode.BadRequest;
      this._response.end('This user id is invalid!');
    }
  }

  public deleteUserById (id : string) {
    if (validate(id)) {
      type OrdinalId = { id: number };
      const ordinalId: OrdinalId = { id : 0 };
      const user : User | undefined = this._virtualDb.find((item : User, index : number) => {
        ordinalId.id = index;
        return item.id === id
      });

      if (user instanceof User) {
        this._virtualDb.splice(ordinalId.id, 1);
        this._response.statusCode = StatusCode.NoContent;
        this._response.end();
      } else {
        this._response.statusCode = StatusCode.NotFound;
        this._response.end('This user does not exist!');
      }
    } else {
      this._response.statusCode = StatusCode.BadRequest;
      this._response.end('This user id is invalid!');
    }
  }

  private isValidUser(obj : unknown) : boolean {
    const rawUser : IUser = <IUser>obj;
    if ('username' in rawUser && 'age' in rawUser && 'hobbies' in rawUser) {
      const validTypes : boolean = (
        typeof rawUser.username === 'string' &&
        typeof rawUser.age === 'number' &&
        Array.isArray(rawUser.hobbies)
      );
      
      if (validTypes){
        return true;
      }
    }

    return false;
  }

  private async parseJSON (request : IncomingMessage) : Promise<unknown> {
    return await new Promise(resolve => {
      request.setEncoding('utf-8');
      const chunks : Array<string> = [];
      request.on('data', (data) => {
        chunks.push(data);
      });
      request.on('end', () => {
        try {
          const result : unknown = JSON.parse(chunks.join(''));
          resolve(result);
        } catch {
          resolve(null);
        }
      });
    });
  }
}