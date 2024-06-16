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
import pino, { Logger } from "pino"
import { exit } from "process"
import fs from "fs"
import nodeMailer from "nodemailer"
import requiredVars from "./requiredVars"
import path from "path"
import * as redis from "redis"
import { z } from "zod"

const hbs = require("nodemailer-express-handlebars")

/* ****************************************************************************
 * microMail class
 * ****************************************************************************/

class microMail {
    // Redis instances
    readonly #client: redis.RedisClientType = redis.createClient({
        url: process.env.REDIS_URL
    })
    readonly #subscriber: redis.RedisClientType = this.#client.duplicate()

    // SMTP transport
    readonly #transporter: nodeMailer.Transporter

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

    /* ****************************************************************************
     * microMail constructor
     * ****************************************************************************/

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

        // create and assign nodemailer transport
        this.#transporter = nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseFloat(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })

        // connect and verify
        Promise.all([this.#connectSMTP(), this.#connectRedis()]).then(() => {
            this.#pino.info({
                code: "SERVER_INIT_SUCCESS",
                message: `SERVER SUCCESSFULLY INITIALIZED, WAITING FOR JOBS!`
            })
        })
    }

    /* ****************************************************************************
     * Connect to SMTP
     * ****************************************************************************/

    readonly #connectSMTP = async () => {
        // create nodemailer transporter
        try {
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
                        partialsDir: partialsPath
                    },
                    //View path declare
                    viewPath: viewPath,
                    extName: ".handlebars"
                })
            )

            await this.#transporter.verify()

            this.#pino.info({
                code: "SERVER_SMTP_CONNECTED",
                message: "SERVER SUCCESSFULLY CONNECTED TO SMTP"
            })
        } catch (e) {
            this.#pino.error({
                code: "SERVER_NO_TRANSPORTER",
                message: "FAILED TO INITIALIZE SMTP TRANSPORTER",
                error: e
            })
            this.#pino.fatal({
                code: "SERVER_FATAL_EXIT",
                message: "SERVER EXITED"
            })

            exit()
        }
    }

    /* ****************************************************************************
     * Connect to Redis
     * ****************************************************************************/

    readonly #connectRedis = async () => {
        try {
            // start server
            await Promise.all([
                this.#client.connect(),
                this.#subscriber.connect()
            ])

            this.#client.on("error", (err) => {
                this.#pino.warn({
                    code: "SERVER_REDIS_ERROR",
                    message: `REDIS ERROR`,
                    error: err
                })
            })

            this.#subscriber.on("error", (err) => {
                this.#pino.warn({
                    code: "SERVER_REDIS_ERROR",
                    message: `REDIS ERROR`,
                    error: err
                })
            })

            this.#handleEvents()

            this.#pino.info({
                code: "SERVER_REDIS_SUCCESS",
                message: `SERVER SUCCESSFULLY CONNECTED TO REDIS`
            })
        } catch (e) {
            this.#pino.fatal({
                code: "SERVER_FATAL_EXIT",
                message: "SERVER EXITED",
                error: e
            })

            exit()
        }
    }

    /* ****************************************************************************
     * Handle Redis Events
     * ****************************************************************************/

    readonly #handleEvents = () => {
        // redis hook
        this.#subscriber.subscribe("micromail", async (message, channel) => {
            this.#pino.info({
                code: "EMAIL_AWAIT",
                message: "ATTEMPTING TO SEND EMAIL..."
            })

            const job = JSON.parse(message)

            const zJob = z.object({
                to: z.string().email().min(5),
                from: z.string().email().min(5),
                subject: z.string().min(1),
                template: z.string().min(1),
                context: z.record(z.any())
            })

            try {
                await zJob.parseAsync(job)
            } catch (e) {
                this.#pino.warn({
                    code: "EMAIL_ERROR",
                    message: "JOB PARAMS INVALID"
                })

                return
            }

            try {
                await this.#sendMail(job)
            } catch (e) {
                this.#pino.warn(e, {
                    code: "EMAIL_ERROR",
                    message: "TYPESCRIPT ERROR"
                })

                return
            }
        })
    }

    /* ****************************************************************************
     * Send Mail
     * ****************************************************************************/

    readonly #sendMail = async (job: any) => {
        // send email
        try {
            const mailOptions = {
                from: `${job.from} <${job.from}>`, // sender address
                to: job.to, // list of receivers - comma separated string ("example@example1.com, example@example2.com")
                subject: job.subject, // Subject line
                template: job.template,
                context: job.context,
                headers: {
                    "X-Mailer": "microMail"
                }
            }

            await this.#transporter.sendMail(mailOptions)

            this.#pino.info({
                code: "EMAIL_SUCCESS",
                message: "SUCCESS SENDING EMAIL"
            })

            return
        } catch (e) {
            if (e.code === "ENOENT") {
                this.#pino.warn({
                    code: "EMAIL_ERROR",
                    message: "ERROR SENDING EMAIL - MISSING TEMPLATE"
                })
            } else {
                this.#pino.warn(e, {
                    code: "EMAIL_ERROR",
                    message: "ERROR SENDING EMAIL"
                })
            }

            return
        }
    }

    /* ****************************************************************************
     * Check Environment Variables
     * ****************************************************************************/

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
