import { NextFunction, Request, Response, Router } from "express";

export class IndexRoute {
  constructor() { }

  public static create(router: Router) {
    router.get("/", (req: Request, res: Response, next: NextFunction) => {
      res.render('index', { title: 'Express' });
    });
  }
}
