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

const port: number = parseInt(process.env.PORT as string, 10);
const host: string = `http://localhost:${port}`;

const invalidUuid : string = '8038923b-adb6-4f2b-8d0f';
const unExistUuid : string = '8038923b-adb6-4f2b-8d0f-8c6040e93ea6';
const invalidUser = { username : 'Inv', age : 'nine', hobbies : [] }

describe('Start: Test wrong requests crud!', () => {

  describe('1. Get user by invalid uuid', () => {
    it('responds with status code 400', (done) => {
      request(host)
        .get(`/api/users/${invalidUuid}`)
        .expect(StatusCode.BAD_REQUEST, done);
    });
  });
  
  describe('2. Get non-exist user by uuid', () => {
    it('responds with status code 404', (done) => {
      request(host)
      .get(`/api/users/${unExistUuid}`)
      .expect(StatusCode.NOT_FOUND, done);
    });
  });
  
  describe('3. Create invalid user', () => {
    it('responds with status code 400', (done) => {
      request(host)
        .post('/api/users')
        .send(JSON.stringify(invalidUser))
        .expect(StatusCode.BAD_REQUEST, done)
    });
  });

  const testUser : User = {
    username: "Notch",
    age: 43,
    hobbies: ['fishing', 'programming'],
  };
  describe('4. Create valid user', () => {
    it('responds with status code 201', (done) => {
      request(host)
        .post('/api/users')
        .send(JSON.stringify(testUser))
        .expect(StatusCode.CREATED)
        .then(response => {
          const responseTestUser = JSON.parse(response.text);
          testUser.id = responseTestUser.id;
          assert.equal(responseTestUser.username, testUser.username);
          assert.equal(responseTestUser.age, testUser.age);
          assert.equal(responseTestUser.hobbies.join(''), testUser.hobbies.join(''));
          done();
        })
        .catch(err => done(err));
    });
  });
  
  describe('5. Update user by invalid uuid', () => {
    it('responds with status code 400', (done) => {
      request(host)
        .put(`/api/users/${invalidUuid}`)
        .send(JSON.stringify(testUser))
        .expect(StatusCode.BAD_REQUEST, done);
    });
  });

  describe('6. Update user by uuid with non-valid properties', () => {
    it('responds with status code 400', (done) => {
      request(host)
        .put(`/api/users/${testUser.id}`)
        .send(JSON.stringify(invalidUser))
        .expect(StatusCode.BAD_REQUEST, done);
    });
  });

  describe('7. Delete user by uuid', () => {
    it('responds with status code 204', (done) => {
      request(host)
        .delete(`/api/users/${testUser.id}`)
        .expect(StatusCode.NO_CONTENT, done);
    });
  });

  describe('8. Update non-exist user by uuid', () => {
    it('responds with status code 404', (done) => {
      request(host)
        .put(`/api/users/${testUser.id}`)
        .send(JSON.stringify(testUser))
        .expect(StatusCode.NOT_FOUND, done);
    });
  });
  
  describe('9. Delete user by invalid uuid', () => {
    it('responds with status code 400', (done) => {
      request(host)
        .delete(`/api/users/${invalidUuid}`)
        .expect(StatusCode.BAD_REQUEST, done);
    });
  });
  
  describe('10. Delete non-exist user by uuid', () => {
    it('responds with status code 404', (done) => {
      request(host)
        .delete(`/api/users/${testUser.id}`)
        .expect(StatusCode.NOT_FOUND, done);
    });
  });

  describe('11. Go to non-existent URL path', () => {
    it('responds with status code 404', (done) => {
      request(host)
        .get(`/api/users/someId998/profile/`)
        .expect(StatusCode.NOT_FOUND, done);
    });
  });
  
});
