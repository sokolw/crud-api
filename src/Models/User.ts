import { v4 as randomId } from 'uuid';
import { IUser } from './IUser';

export class User implements IUser{
  public id : string;
  public username;
  public age;
  public hobbies;

  constructor(username : string, age : number,  hobbies : Array<string>) {
    this.id = randomId();
    this.username = username;
    this.age = age;
    this.hobbies = hobbies;
  }

  public toString() : string {
    return `Id: ${this.id}, Username: ${this.username}, Age: ${this.age}, Hobbies: ${this.hobbies}`;
  }
}