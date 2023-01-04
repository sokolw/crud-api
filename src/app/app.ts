import { ReqWithParams, Router } from './router';
import http, { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import { StatusCode } from './status-code';
import { Method } from './method';
import { IUser, User } from './user.models';
import { parseReqToJson } from './utilities/parse-req-to-json';
import { validate } from 'uuid';
import cluster from 'cluster';
import { PORT } from './constants';

export class App {
  virtualDb: Array<User> = [];
  router: Router;

  constructor() {
    this.router = new Router();
    this.configureRouter();
    if (!cluster.isWorker) {
      this.initServer();
    } else {
      this.initChildServer();
    }
  }

  private configureRouter() {
    this.router.handle('/api/users', Method.GET, (req, res) => {
      const result: string = JSON.stringify(this.virtualDb, null, 2);
      res.statusCode = StatusCode.OK;
      return res.end(result);
    });

    this.router.handle('/api/users/:userId', Method.GET, (req, res) => {
      const { userId } = (req as ReqWithParams).params as { userId: string };

      if (validate(userId)) {
        const user: User | undefined = this.virtualDb.find((item: User) => item.id === userId);
        if (user !== undefined) {
          res.statusCode = StatusCode.OK;
          return res.end(JSON.stringify(user, null, 2));
        } else {
          res.statusCode = StatusCode.NOT_FOUND;
          return res.end('This user does not exist!');
        }
      } else {
        res.statusCode = StatusCode.BAD_REQUEST;
        return res.end('This user id is invalid!');
      }
    });

    this.router.handle('/api/users', Method.POST, async (req, res) => {
      const parsedObj: unknown = await parseReqToJson(req);

      if (parsedObj !== null && User.isValidUser(parsedObj)) {
        const validUser = parsedObj as IUser;
        this.virtualDb.push(new User(validUser.username, validUser.age, validUser.hobbies));

        res.statusCode = StatusCode.CREATED;
        return res.end(JSON.stringify(this.virtualDb[this.virtualDb.length - 1], null, 2));
      } else {
        res.statusCode = StatusCode.BAD_REQUEST;
        return res.end('Incorrect request body or request body does not contain required fields!');
      }
    });

    this.router.handle('/api/users/:userId', Method.PUT, async (req, res) => {
      const { userId } = (req as ReqWithParams).params as { userId: string };

      if (validate(userId)) {
        const user: User | undefined = this.virtualDb.find((item: User) => item.id === userId);
        if (user !== undefined) {
          const parsedObj: unknown = await parseReqToJson(req);

          if (parsedObj !== null && User.isValidUser(parsedObj)) {
            const validUser = parsedObj as IUser;
            if (user.username !== validUser.username) {
              user.username = validUser.username;
            }
            if (user.age !== validUser.age) {
              user.age = validUser.age;
            }
            user.hobbies = validUser.hobbies;

            res.statusCode = StatusCode.OK;
            res.end(JSON.stringify(user, null, 2));
          } else {
            res.statusCode = StatusCode.BAD_REQUEST;
            return res.end('Incorrect request body or request body does not contain required fields!');
          }
        } else {
          res.statusCode = StatusCode.NOT_FOUND;
          return res.end('This user does not exist!');
        }
      } else {
        res.statusCode = StatusCode.BAD_REQUEST;
        return res.end('This user id is invalid!');
      }
    });

    this.router.handle('/api/users/:userId', Method.DELETE, (req: any, res: any) => {
      const { userId } = (req as ReqWithParams).params as { userId: string };

      if (validate(userId)) {
        type OrdinalId = { id: number };
        const ordinalId: OrdinalId = { id: 0 };
        const user: User | undefined = this.virtualDb.find((item: User, index: number) => {
          ordinalId.id = index;
          return item.id === userId;
        });

        if (user !== undefined) {
          this.virtualDb.splice(ordinalId.id, 1);
          res.statusCode = StatusCode.NO_CONTENT;
          return res.end();
        } else {
          res.statusCode = StatusCode.NOT_FOUND;
          return res.end('This user does not exist!');
        }
      } else {
        res.statusCode = StatusCode.BAD_REQUEST;
        return res.end('This user id is invalid!');
      }
    });
  }

  private initServer() {
    const server = http.createServer(this.serve.bind(this));
    server.listen(process.env.PORT || PORT, () => {
      console.log(`Server work, listen port: ${process.env.PORT || PORT}`);
    });
  }

  private initChildServer() {
    process.on('message', ({ msg, data }) => {
      this.virtualDb = data;
    });

    const server = http.createServer(async (req, res) => {
      await this.serve(req, res);
      process.send!(this.virtualDb);

      console.log(
        `[Work log] Child server PID:${process.pid} PORT:${process.env.CHILD_PORT} URL: ${req.url} METHOD: ${req.method}`
      );
    });

    server.listen(process.env.CHILD_PORT, () => {
      console.log(`Child server was started PID:${process.pid} PORT:${process.env.CHILD_PORT}`);
    });
  }

  private async serve(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      if (req.url !== undefined && req.method !== undefined) {
        const reqPath = this.router.trimLastSlash(url.parse(req.url).pathname!);

        const handlersSimplePath = this.router.handlers.get(reqPath);
        if (handlersSimplePath) {
          const methodHandler = handlersSimplePath.get(req.method);
          if (methodHandler) {
            return methodHandler(req, res);
          }
        }

        const reqPathParts = this.router.getPathParts(reqPath);
        for (const [path, pathHandlers] of this.router.handlers) {
          if (this.router.checkPathParams(path)) {
            const pathParts = this.router.getPathParts(path);

            if (pathParts.length !== reqPathParts.length) {
              continue;
            }

            const params = this.router.comparePathParts(pathParts, reqPathParts);
            if (!params) {
              continue;
            }
            const mutatedReq = req as ReqWithParams;
            mutatedReq.params = typeof params === 'object' ? params : {};

            const methodHandler = pathHandlers.get(req.method);
            if (methodHandler) {
              return methodHandler(mutatedReq, res);
            }
          }
        }
      }

      res.statusCode = StatusCode.NOT_FOUND;
      res.end('No such path exists!');
    } catch {
      res.statusCode = StatusCode.INTERNAL_SERVER_ERROR;
      res.end(
        '"Internal Server Error". The server has encountered a previous one that it does not know how to handle!'
      );
    }
  }
}
