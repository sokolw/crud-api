import { User } from './Models/User';
import { Server } from './Server';

export class Application {
  public static readonly users : Array<User> = [];
  private readonly port: number = parseInt(process.env.PORT as string, 10);
  private readonly server: Server;

  constructor() {
    this.server = new Server(this.port);
    this.start();
  }

  public start() : void {
    console.log(`Server started! Listen port: ${this.port}`);
  }
}