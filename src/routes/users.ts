import { NextFunction, Request, Response, Router } from "express";

export class UserRoute {
  constructor() { }

  public static create(router: Router) {
    router.get("/users", (req: Request, res: Response, next: NextFunction) => {
      /* GET users listing. */
      res.send('respond with a resource');
    });
  }
}
