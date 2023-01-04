[RU] Проект: **crud-api**
- `Используйте версию Node.js: LTS v18.12.1`
- Написано в Windows 10 Enterprise LTSC 2019
- Перед запуском установите `node_modules` используйте команду:
```bash
npm i
```
- Программа запускается с помощью npm-script
- Для запуска в production режиме используйте команду:
```bash
npm run start:prod
```
- Для запуска в development режиме используйте команду:
```bash
npm run start:dev
```
- Для запуска тестов используйте команду:
  - `В рандомных тестах можно поменять число добавляемых объектов`
```bash
npm run test
```
- Для запуска балансировщика используйте команду:
```bash
npm run start:multi
```

- Конечная точка `api/users`
  - **GET** `api/users` получить всех пользователей.
  - **GET** `api/users/${userId}` получить пользователя по userId.
  - **POST** `api/users` создать нового пользователя используя схему ниже.
  ```JSON
    {
        "username":   string,
        "age":        number,
        "hobbies":    Array<any>
    }
  ```
  - **PUT** `api/users/{userId}` изменить существующего пользователя по userId используя схему выше.
  - **DELETE** `api/users/${userId}` удалить существующего пользователя по userId.

[EN] Project: **crud-api**
- `Use Node.js version: LTS v18.12.1`
- Written in Windows 10 Enterprise LTSC 2019
- Before running install `node_modules` use the command:
```bash
npm i
```
- The program is launched using npm-script
- To run in production mode, use the command:
```bash
npm run start:prod
```
- To run in development mode, use the command:
```bash
npm run start:dev
```
- To run tests, use the command:
   - `In random tests, you can change the number of added objects`
```bash
npm run test
```
- To start the balancer, use the command:
```bash
npm run start:multi
```

- Endpoint `api/users`
   - **GET** `api/users` get all users.
   - **GET** `api/users/${userId}` get user by userId.
   - **POST** `api/users` create a new user using the scheme below.
  ```JSON
    {
        "username":   string,
        "age":        number,
        "hobbies":    Array<any>
    }
  ```
   - **PUT** `api/users/{userId}` change an existing user by userId using the scheme above.
   - **DELETE** `api/users/${userId}` delete an existing user by userId.