import { pathToRegexp } from 'path-to-regexp'
import { Request, Response, RequestHandler } from 'express'

export interface MatchOptions {
    options: string | MatchOption | MatchOption[]
}

export interface MatchObject {
    method: string;
    path: string;
}

export interface MatchFunction {
    (req: Request, res: Response): boolean | Promise<boolean>
}

export type MatchOption = string | MatchObject | MatchFunction

export default function except(options: MatchOption[], middleware: RequestHandler): RequestHandler {
    return async (req, res, next) => {

        if (typeof options === 'string') {
            if (isExceptedByPath(options, req.path)) {
                return next()
            }
        }

        // loop through the matching options and see if the request can be 
        // excepted. If excepted, the middleware argument is not applied to
        // the request.
        // If the request is not excepted, then the middleware must be executed.
        for (let option of options) {

            // if option is a string, it represents a path. Match the path the 
            // way express would and call next() if there's a match.
            if (typeof option === 'string') {
                if (isExceptedByPath(option, req.path)) {
                    return next()
                }
                continue
            }

            if (typeof option === 'object') {
                if (isExceptedByObject(option, req.path, req.method)) {
                    return next()
                }
                continue
            }

            if (typeof option === 'function') {
                if (await isExceptedByFunction(option, req, res)) {
                    return next()
                }
                continue
            }
        }

        // after looping through possible exception options, we must call the
        // middleware
        middleware(req, res, next)
    }
}

function isExceptedByPath(option: string, reqPath: string): boolean {
    return pathToRegexp(option).exec(reqPath) !== null
}

function isExceptedByObject(option: MatchObject, path: string, method: string): boolean {
    const methodMatch = option.method.toLowerCase() === method.toLowerCase()
    return isExceptedByPath(option.path, path) && methodMatch
}

async function isExceptedByFunction(option: MatchFunction, req: Request, res: Response): Promise<boolean> {
    const output = option(req, res)
    if (typeof output === 'boolean') {
        return Promise.resolve(output)
    }
    return output
}