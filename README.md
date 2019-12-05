# README

This library is a middleware you can use to conditionally use other middleware 
on Express servers.


## Usage

```ts
import { except } from 'express-except-middleware'


app.use(except('/users', authMiddleware))

```