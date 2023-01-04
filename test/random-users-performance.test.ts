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

const countUsers : number = 50;

const createRandomUser = () : User => {
  const randomNumber : number = Math.floor(Math.random() * 100);
  return <User>{
    username : `RandomUser#${randomNumber}`, 
    age : 99 * randomNumber, 
    hobbies: 'randoms '.repeat(randomNumber / 25).trim().split(' ')};
}


describe('Start: Test more users crud!', () => {
  
  describe('1. Check users:', () => {
    it('responds with an empty array', (done) => {
      request(host)
        .get('/api/users')
        .expect(StatusCode.OK)
        .expect(JSON.stringify([]), done);
    });
  });
  
  describe('2. Create very much random users:', () => {
    for (let index = 0; index < countUsers; index++) {
      const randomUser : User = createRandomUser();
      it(`User ${index + 1} create...`, (done) => {
        request(host)
          .post('/api/users')
          .send(JSON.stringify(randomUser))
          .expect(StatusCode.CREATED)
          .then(response => {
            const responseTestUser = JSON.parse(response.text);
            tempDataId.push(responseTestUser.id);
            assert.equal(responseTestUser.username, randomUser.username);
            assert.equal(responseTestUser.age, randomUser.age);
            assert.equal(responseTestUser.hobbies.join(''), randomUser.hobbies.join(''));
            done();
          })
          .catch(err => done(err));
      });
    }
  });
  
  describe('3. Get more users:', () => {
    for (let index = 0; index < countUsers; index++) {
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

  describe('4. Get more users:', () => {
    for (let index = 0; index < countUsers; index++) {
      it(`Delete user ${index + 1}...`, (done) => {
        request(host)
          .delete(`/api/users/${tempDataId[index]}`)
          .expect(StatusCode.NO_CONTENT, done);
      });
    }
  });

  describe('5. Сheck if users are deleted:', () => {
    for (let index = 0; index < countUsers; index++) {
      it(`User ${index + 1} deleted...`, (done) => {
        request(host)
          .delete(`/api/users/${tempDataId[index]}`)
          .expect(StatusCode.NOT_FOUND, done);
      });
    }
  });

});

