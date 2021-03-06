import { config } from "dotenv";
import { Application } from './Application';

// set env
const setEnv = () : void => {
  config();

  if (!process.env.PORT) {
    process.exit(1);
  }
}

setEnv();

// start app
const app : Application = new Application();