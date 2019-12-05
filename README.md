# README

This library is a middleware you can use to conditionally use other middleware 
on Express servers.

## Usage

Pass a string to do a simple path match. Eg. Calls `authMiddleware` unless the
request path matches `/public`:


```ts
import { except } from 'express-except-middleware'

app.use(except('/public', authMiddleware))
```

You can pass a string with path parameters.  Calls `authMiddleware` unless the
request path matches `/public/:id`:

```ts
app.use(except('/public/:id', authMiddleware))
```

You can pass an object that will match both the method and path. Method is 
case insensitive. Eg. Calls `authMiddleware` unless a `GET` request was made 
to the path `/public`.

```ts
app.use(except({method: 'GET', path: '/public'}), authMiddleware))
```

Match using a function. Your function will be called with the request and response
objects. You must return a `boolean` from your function. Eg. Calls 
`authMiddleware` unless the `Authorization` header is defined on the request.

```ts
const checkHeader = (req, res) => {
    return req.headers['Authorization'] === undefined
}

app.use(except(checkHeader, authMiddleware))
```

Match using a Promise based function that resolves to a boolean. Your function
will be called the request and response objects. You must resolve to a `boolean`
from your async function. Eg. Calls `authMiddleware` unless asyncShouldAuthenticate

```ts
function asyncCheck(req, res) {
    // Do some async operation here
    return asyncShouldAuthenticate()
}
app.use(except(asyncCheck, authMiddleware))
```

Match using an array of options. This is an OR operation. If at least one option
matches the request, then `next()` is called and the supplied middleware is 
not executed. Eg. Calls `authMiddleware` unless:

- the request path matches `/public`
- OR the request method is `GET` and path matches `/foo`
- OR the request header `Foobar` is undefined
- OR the `checkAsync()` function resolves to true

```ts
const options = [
    '/public',
    { method: 'GET', path: '/foo' },
    function(req, res) {
        return req.headers['Foobar'] === undefined
    },
    function(req, res) {
        return checkAsync()
    },
]
app.use(except([], authMiddleware)
```