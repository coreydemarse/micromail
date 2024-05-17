/* ****************************************************************************
 * microMail.ts
 *
 * written by Corey DeMarse
 * https://github.com/coreydemarse
 * ****************************************************************************/

/* ****************************************************************************
 * import modules
 * ****************************************************************************/

import dotenv from "dotenv"
import express, { Application } from "express"
import pino, { Logger } from "pino"
import { exit } from "process"
import fs from "fs"
import helmet from "helmet"
import nodeMailer from "nodemailer"
import requiredVars from "./requiredVars"
import { validationResult } from "express-validator"
import * as validations from "./validations/app"
import path from "path"

const hbs = require("nodemailer-express-handlebars")

/* ****************************************************************************
 * microMail class
 * ****************************************************************************/

class microMail {
    readonly #app: Application = express()

    // logging middleware
    readonly #pino: Logger = pino(
        pino.transport({
            targets: [
                {
                    level: "info",
                    target: "pino-pretty",
                    options: { sync: false }
                },
                {
                    level: "error",
                    target: "pino/file",
                    options: { destination: "./logs/error.log", sync: false }
                }
            ]
        })
    )

    readonly #transporter: nodeMailer.Transporter

    constructor() {
        // dotenv
        dotenv.config()

        this.#checkEnvVars()

        // create empty log file if it doesn't exist
        try {
            fs.mkdirSync("./logs")
            fs.writeFileSync("./logs/error.log", "")
        } catch (e) {} // eslint-disable-line no-empty

        this.#pino.info({
            code: "SERVER_INIT_AWAIT",
            message: "INITIALIZING SERVER"
        })

        // create nodemailer transporter
        try {
            this.#transporter = nodeMailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseFloat(process.env.SMTP_PORT),
                secure: true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            })

            const viewPath = path.resolve(__dirname, "./templates/views/")
            const partialsPath = path.resolve(__dirname, "./templates/partials")

            this.#transporter.use(
                "compile",
                hbs({
                    viewEngine: {
                        //extension name
                        extName: ".handlebars",
                        // layout path declare
                        layoutsDir: viewPath,
                        defaultLayout: false,
                        //partials directory path
                        partialsDir: partialsPath,
                        express
                    },
                    //View path declare
                    viewPath: viewPath,
                    extName: ".handlebars"
                })
            )

            this.#transporter.verify()

            this.#pino.info({
                code: "SERVER_SMTP_CONNECTED",
                message: "SMTP server connected"
            })
        } catch (e) {
            this.#pino.error({
                code: "SERVER_NO_TRANSPORTER",
                message: "Failed to initialize SMTP transporter",
                error: e
            })
            this.#pino.fatal({
                code: "SERVER_FATAL_EXIT",
                message: "SERVER EXITED"
            })

            exit()
        }

        this.#app.use(helmet())
        this.#app.use(express.json())
        this.#app.use(express.urlencoded())

        // initialize routes
        this.#routes()

        try {
            this.#pino.info({
                code: "SERVER_START_AWAIT",
                message: `ATTEMPTING TO LISTEN ON PORT ${process.env.API_PORT}`
            })

            // start server
            this.#app.listen(`${process.env.API_PORT}`)

            this.#pino.info({
                code: "SERVER_START_SUCCESS",
                message: `SERVER IS SUCCESSFULLY LISTENING ON PORT ${process.env.API_PORT}`
            })
        } catch (e) {
            this.#pino.fatal({
                code: "SERVER_FATAL_EXIT",
                message: "SERVER EXITED",
                error: e
            })

            exit()
        }

        this.#pino.info({
            code: "SERVER_INIT_SUCCESS",
            message: `SERVER INITIALIZATION SUCCESSFUL`,
            port: process.env.API_PORT
        })
    }

    /* ****************************************************************************
     * API routes
     * ****************************************************************************/

    readonly #routes = () => {
        // register routes
        this.#app.post("/", validations.postSend, this.#postSend)
    }

    /* ****************************************************************************
     * POST '/'
     * ****************************************************************************/

    readonly #postSend = async (req: any, res: any) => {
        /*
        const myValidationResult = validationResult.withDefaults({
            formatter: (error) => {
                return {
                    msg: error.msg
                }
            }
        })

        const errors = myValidationResult(req)

        // catch all validation errors
        if (!errors.isEmpty()) {
            res.status(418).json({ errors: errors.array() })
            return
        }

        */

        this.#pino.info({
            code: "POST_EMAIL_AWAIT",
            message: "Attempting to send email..."
        })

        // send email
        try {
            const mailOptions = {
                from: `${req.body.from} <${req.body.from}>`, // sender address
                to: req.body.to, // list of receivers - comma separated string ("example@example1.com, example@example2.com")
                subject: req.body.subject, // Subject line
                template: req.body.template,
                context: req.body.context
            }

            this.#transporter.sendMail(mailOptions)

            this.#pino.info({
                code: "POST_EMAIL_SUCCESS",
                message: "Success sending email"
            })

            res.status(200).end()
            return
        } catch (e) {
            this.#pino.warn(e, {
                code: "POST_EMAIL_ERROR",
                message: "Error sending email"
            })

            res.status(418).end()
            return
        }
    }

    // check for environment variables listed in requiredVars
    readonly #checkEnvVars = function () {
        for (let i = 0; i < requiredVars.length; i++) {
            if (!process.env[requiredVars[i]]) {
                this.#pino.error({
                    code: "MISSING_ENV",
                    message: `.env: Missing required environment variable: ${requiredVars[i]}`
                })

                this.#pino.fatal({
                    code: "SERVER_FATAL_EXIT",
                    message: "SERVER EXITED"
                })

                exit()
            }
        }
    }
}

/*
 * 2 THE MOON 🚀 🚀
 */

new microMail()
