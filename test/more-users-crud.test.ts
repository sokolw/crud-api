import { assert } from 'chai';
import request from 'supertest';
import { StatusCode } from '../src/app/status-code';
import { config } from "dotenv";

// set env
const setEnv = () : void => {
  config();

  if (!process.env.PORT) {
    process.exit(1);
  }
}

setEnv();
// set env

interface User {
  id? : string;
  username : string;
  age : number;
  hobbies : Array<string>;
}

const tempDataId : Array<string> = [];
const port: number = parseInt(process.env.PORT as string, 10);
const host: string = `http://localhost:${port}`;
const users : Array<User> = [
  <User>{ username : 'Solo', age : 32, hobbies: ['flying', 'binge'] },
  <User>{ username : 'Kira', age : 42, hobbies: ['flying', 'shopping'] },
  <User>{ username : 'Vel', age : 52, hobbies: ['flying', 'hunting'] },
  <User>{ username : 'L3-37', age : 321, hobbies: ['droid', 'follow'] },
  <User>{ username : 'Molox', age : 32, hobbies: ['flying', 'eating'] },
];


describe('Start: Test more users crud!', () => {
  
  describe('1. Check users:', () => {
    it('responds with an empty array', (done) => {
      request(host)
        .get('/api/users')
        .expect(StatusCode.OK)
        .expect(JSON.stringify([]), done);
    });
  });
  
  describe('2. Create more users:', () => {
    for (let index = 0; index < users.length; index++) {
      it(`User ${index + 1} create...`, (done) => {
        request(host)
          .post('/api/users')
          .send(JSON.stringify(users[index]))
          .expect(StatusCode.CREATED)
          .then(response => {
            const responseTestUser = JSON.parse(response.text);
            tempDataId.push(responseTestUser.id);
            assert.equal(responseTestUser.username, users[index].username);
            assert.equal(responseTestUser.age, users[index].age);
            assert.equal(responseTestUser.hobbies.join(''), users[index].hobbies.join(''));
            done();
          })
          .catch(err => done(err));
      });
    }
  });
  
  describe('3. Get more users:', () => {
    for (let index = 0; index < users.length; index++) {
      it(`User ${index + 1} is exist...`, (done) => {
        request(host)
          .get(`/api/users/${tempDataId[index]}`)
          .expect(StatusCode.OK)
          .then(response => {
            const responseTestUser = JSON.parse(response.text);
            assert.equal(responseTestUser.id, tempDataId[index]);
            done();
          })
          .catch(err => done(err));
      });
    }
  });
  
  describe('4. Modify more users:', () => {
    for (let index = 0; index < users.length; index++) {
      const modifiedUser : User = {
        username : users[index].username.concat('_modded'),
        age : users[index].age * (index + 1),
        hobbies : users[index].hobbies.concat('modded')
      }
      it(`Modify user ${index + 1}...`, (done) => {
        request(host)
          .put(`/api/users/${tempDataId[index]}`)
          .send(JSON.stringify(modifiedUser))
          .expect(StatusCode.OK)
          .then(response => {
            const responseTestUser = JSON.parse(response.text);
            assert.equal(responseTestUser.id, tempDataId[index]);
            assert.equal(responseTestUser.username, modifiedUser.username);
            assert.equal(responseTestUser.age, modifiedUser.age);
            assert.equal(responseTestUser.hobbies.join(''), modifiedUser.hobbies.join(''));
            done();
          })
          .catch(err => done(err));
      });
    }
  });
  
  describe('5. Delete all added users:', () => {
    for (let index = 0; index < users.length; index++) {
      it(`Delete user ${index + 1}...`, (done) => {
        request(host)
          .delete(`/api/users/${tempDataId[index]}`)
          .expect(StatusCode.NO_CONTENT, done);
      });
    }
  });
  
  describe('6. Сheck if users are deleted', () => {
    for (let index = 0; index < users.length; index++) {
      it(`Get the deleted user ${index + 1}...`, (done) => {
        request(host)
          .get(`/api/users/${tempDataId[index]}`)
          .expect(StatusCode.NOT_FOUND, done);
      });
    }
  });
});

