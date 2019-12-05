# README

This library is a middleware you can use to conditionally use other middleware 
on Express servers.

## Usage

Pass match options to except() along with your middleware, and your middleware
will not be called if your options match the request.

```ts
import { except } from 'express-except-middleware'

// Basic path matching 
// (eg. use authMiddleware unless the request path matches '/public')
app.use(except('/public', authMiddleware))

// Path matching with URL params
app.use(except('/public/:id', authMiddleware))

// Match against method and path
app.use(except({method: 'GET', path: '/public'}), authMiddleware))

// Match using a function (eg. use authMiddleware unless the Authorization header is missing)
const fn = (req) => {
    return req.headers['Authorization'] === undefined
}
app.use(except(fn, authMiddleware))

// Match using a function that returns a Promise
function asyncCheck(req, res) {
    // Do some async operation here
    return Promise.resolve(false)
}
app.use(except(asyncCheck, authMiddleware))

// Match using an array of any of the options above
app.use(except(['/users', {method: 'POST', '/users'}, () => true, () => Promise.resolve(true)], auth))
```