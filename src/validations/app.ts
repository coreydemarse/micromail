import { check, ValidationChain } from "express-validator"

export const postSend: ValidationChain[] = [
    //check existence
    check("to").not().isEmpty().withMessage("to is required"),
    check("from").not().isEmpty().withMessage("from is required"),
    check("subject").not().isEmpty().withMessage("subject is required"),
    check("body").not().isEmpty().withMessage("body is required"),

    //check types
    check("to").isString().withMessage("to must be a string"),
    check("from").isString().withMessage("from must be a string"),
    check("subject").isString().withMessage("subject must be a string"),
    check("body").isString().withMessage("body must be a string"),

    // name
    check("to")
        .isEmail()
        .normalizeEmail()
        .withMessage("to must be a valid email address"),

    // email
    check("from")
        .isEmail()
        .normalizeEmail()
        .withMessage("from must be a valid email address"),

    // subject
    check("subject")
        .isLength({ min: 1, max: 28 })
        .withMessage("subject must be between 1 and 28 characters")
]
