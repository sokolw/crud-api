import { v4 as randomId } from 'uuid';

export interface IUser {
  username: string;
  age: number;
  hobbies: Array<string>;
}

export class User implements IUser {
  public id: string;
  public username;
  public age;
  public hobbies;

  constructor(username: string, age: number, hobbies: Array<string>) {
    this.id = randomId();
    this.username = username;
    this.age = age;
    this.hobbies = hobbies;
  }

  public toString(): string {
    return `Id: ${this.id}, Username: ${this.username}, Age: ${this.age}, Hobbies: ${this.hobbies}`;
  }

  public static isValidUser(obj: unknown): boolean {
    const rawUser: IUser = <IUser>obj;
    if ('username' in rawUser && 'age' in rawUser && 'hobbies' in rawUser) {
      const validTypes: boolean =
        typeof rawUser.username === 'string' && typeof rawUser.age === 'number' && Array.isArray(rawUser.hobbies);

      if (validTypes) {
        return true;
      }
    }

    return false;
  }
}
