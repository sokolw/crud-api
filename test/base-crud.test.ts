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

interface TempData {
  id? : string;
}

interface User {
  id? : string;
  username : string;
  age : number;
  hobbies : Array<string>;
}

const tempData : TempData = {};
const port: number = parseInt(process.env.PORT as string, 10);
const host: string = `http://localhost:${port}`;


describe('Start: Test base crud!', () => {

  describe('1. GET /api/users', () => {
    it('responds with an empty array', (done) => {
      request(host)
        .get('/api/users')
        .expect(StatusCode.OK)
        .expect(JSON.stringify([]), done);
    });
  });
  
  describe('2. POST /api/users', () => {
    const testUser : User = {
      username: "Notch",
      age: 43,
      hobbies: ['fishing', 'programming'],
    };
    it('responds with created user', (done) => {
      request(host)
        .post('/api/users')
        .send(JSON.stringify(testUser))
        .expect(StatusCode.CREATED)
        .then(response => {
          const responseTestUser = JSON.parse(response.text);
          tempData.id = responseTestUser.id;
          assert.equal(responseTestUser.username, testUser.username);
          assert.equal(responseTestUser.age, testUser.age);
          assert.equal(responseTestUser.hobbies.join(''), testUser.hobbies.join(''));
          done();
        })
        .catch(err => done(err));
    });
  });
  
  describe('3. GET api/user/{userId}', () => {
    it('responds to user id', (done) => {
      request(host)
        .get(`/api/users/${tempData.id}`)
        .expect(StatusCode.OK)
        .then(response => {
          const responseTestUser = JSON.parse(response.text);
          assert.equal(responseTestUser.id, tempData.id);
          done();
        })
        .catch(err => done(err));
    });
  });
  
  describe('4. PUT api/users/{userId}', () => {
    const testUser = {
      username: "SokolW",
      age: 322,
      hobbies: ['chill', 'programming'],
    };
    it('responds to user id and updates', (done) => {
      request(host)
        .put(`/api/users/${tempData.id}`)
        .send(JSON.stringify(testUser))
        .expect(StatusCode.OK)
        .then(response => {
          const responseTestUser = JSON.parse(response.text);
          assert.equal(responseTestUser.id, tempData.id);
          assert.equal(responseTestUser.username, testUser.username);
          assert.equal(responseTestUser.age, testUser.age);
          assert.equal(responseTestUser.hobbies.join(''), testUser.hobbies.join(''));
          done();
        })
        .catch(err => done(err));
    });
  });
  
  describe('5. DELETE api/users/{userId}', () => {
    it('responds to user id and updates', (done) => {
      request(host)
        .delete(`/api/users/${tempData.id}`)
        .expect(StatusCode.NO_CONTENT, done);
    });
  });
  
  describe('6. GET api/users/{userId}', () => {
    it('get a non-existent user', (done) => {
      request(host)
        .get(`/api/users/${tempData.id}`)
        .expect(StatusCode.NOT_FOUND, done);
    });
  });
  
});

