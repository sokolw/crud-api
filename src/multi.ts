import cluster from 'node:cluster';
import http from 'node:http';
import { cpus } from 'node:os';
import process from 'node:process';
import { User } from './app/user.models';
import { App } from './app/app';
import { PORT } from './app/constants';

const multi = async () => {
  if (cluster.isPrimary) {
    await import('./config');
    let users: Array<User> = [];
    let currentWorker = 1;
    let isAllWorkersConnected = false;
    const MAIN_PORT = +(process.env.PORT || PORT);
    const numCPUs = cpus().length;

    console.log('Wait to start child servers.');

    process.on('uncaughtException', () => {
      console.log('Wait for the child processes to run. Take your time and repeat the request again.');
    });

    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork({ CHILD_PORT: MAIN_PORT + i + 1 });
      worker.on('message', (data) => {
        users = data;
      });
    }

    const masterServer = http.createServer((req, res) => {
      cluster.workers![currentWorker]?.send({ data: users });
      const forChildReq = http.request({ port: MAIN_PORT + currentWorker, path: req.url, method: req.method });
      forChildReq.on('response', (childRes) => {
        res.statusCode = childRes.statusCode!;
        childRes.pipe(res);
        currentWorker = currentWorker >= 4 ? 1 : ++currentWorker;
      });
      req.pipe(forChildReq);
    });
    masterServer.listen(MAIN_PORT, () => {
      console.log(`Master server started and listen port: ${MAIN_PORT}`);
    });
  } else {
    new App();
  }
};

multi();
