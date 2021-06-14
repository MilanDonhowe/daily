import express from 'express'
const indexRouter = express.Router();


/* GET home page. */
indexRouter.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.render('test', { title: 'Express' });
});

export default indexRouter;
