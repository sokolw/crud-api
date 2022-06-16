export class Application {
  private PORT: number = parseInt(process.env.PORT as string, 10);

  constructor() {
    this.start();
  }

  public start() : void {
    console.log(`My port ${this.PORT}`)
  }

}