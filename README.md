# micromail

A little nodemailer SMTP microservice

### It passes the butter

<img src="https://i.imgur.com/sVYSwYB.gif" alt="drawing" width="100"/>  
  
microMail is a simple HTTP POST wrapper around nodemailer

### Start App

Setup .env variables:

```
SMTP_HOST=example.com
SMTP_PORT=465
SMTP_USER=exampleuser
SMTP_PASS=examplepass
API_PORT=3939
```

Install node modules: `yarn install`  
Start application: run `tsc` then do `dist/app.js`  
Run in Docker: run `tsc` then do `docker-compose up`

<h3> Ruby HTTP Example</h3>
<img src="https://skillicons.dev/icons?i=ruby"/>  
  
Make a simple HTTP POST request to micromail to send an email

```
require 'net/http'

Net::HTTP.post(
    URI('http://127.0.0.1:3939/'),
    {
        'to' => 'receiver@example.com',
        'from' => 'sender@example.com',
        'subject' => 'An example email',
        'body' => 'Hello World'
    }.to_json,
    { 'Content-Type': 'application/json' }
)
```

Replies with `status 200` if email sent successfully  
Replies with `error 418` if email was not sent
