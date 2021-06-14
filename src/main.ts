// Entry point for express server


/*
    Before setting up any server logic let's setup our logging
    system with winston (this code is essentially copy-pasted)
    from the Winston quick-start docs.

    We're using a logging solution since tslint doesn't let us
    use console.log--which is probably a good call.

    Instead we'll use 'logger.info()' to print out messages
    to the console when not in production mode.
*/

import winston from 'winston'

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {service: 'user-service'},
    transports: [
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        new winston.transports.File( {filename: 'error.log', level: 'error'}),
        new winston.transports.File( {filename: 'combined.log'}),
    ],
})


if (process.env.NODE_ENV !== 'production'){
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}

// The actual server logic starts here

import express from 'express'
import indexRouter from './routes/index'
import { createEngine } from 'express-react-views'


const app = express()
const port = 8080

/*
    We have to set the engine extension to handle .js files
    since express-react-views doesn't natively support typescript
    so our process becomes:

        1. Compile Typescript w/ JSX -> JavaScript
        2. Run javascript files with node

    https://github.com/reactjs/express-react-views/issues/79
    |-> explainatory thread
*/



app.set('views', __dirname + '/views')
app.set('view engine', 'js')
app.engine('js', createEngine())

// register index router
app.get('/', indexRouter)


app.listen(port, () => {
    logger.info(`server listening on port ${port}`)
})