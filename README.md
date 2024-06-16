# micromail

A little nodemailer SMTP microservice

### It passes the butter

<img src="https://i.imgur.com/sVYSwYB.gif" alt="drawing" width="100"/>  
  
microMail is a redis-backed SMTP microservice with handlebars templating

### Start App

Setup .env variables:

```
SMTP_HOST=example.com
SMTP_PORT=465
SMTP_USER=exampleuser
SMTP_PASS=examplepass
REDIS_URL=redis://127.0.0.1:6379
```

Install node modules: `yarn install`  
Start application: run `yarn compile` then do `yarn start`  
Run in Docker: run `yarn compile` then do `docker-compose up`

Handlebar email templates can be found and altered in `src/templates/`

---

<h3> Ruby Example</h3>
<img src="https://skillicons.dev/icons?i=ruby"/>  
  
Redis publish an email via Ruby

```
require 'redis'
require 'json'

redis = Redis.new

redis.publish('micromail', {
    :to => "recipient@example.com",
    :from => "sender@example.com",
    :subject => "hello world",
    :template => "example",
    :context => { hello: "hello world" }
}.to_json)
```

---

<h3>Python Example</h3>
<img src="https://skillicons.dev/icons?i=python"/>

Redis publish an email via Python

```
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

redis_client.publish('micromail', json.dumps({
    'to': 'recipient@example.com',
    'from': 'sender@example.com',
    'subject': 'hello world',
    'template': 'example',
    'context': {'hello': 'hello world'}
}))
```

---

<h3>PHP Example</h3>
<img src="https://skillicons.dev/icons?i=php"/>

Redis publish an email via PHP

```
<?php
    require 'predis/autoload.php';
    Predis\Autoloader::register();

    use Predis\Client;

    $redis = new Client([
        'scheme' => 'tcp',
        'host'   => '127.0.0.1',
        'port'   => 6379,
    ]);

    $redis->publish('micromail', json_encode([
        'to' => 'recipient@example.com',
        'from' => 'sender@example.com',
        'subject' => 'hello world',
        'template' => 'example',
        'context' => ['hello' => 'hello world'],
    ]));
?>
```

---

<h3>TypeScript Example</h3>
<img src="https://skillicons.dev/icons?i=typescript"/>

Redis publish an email via TypeScript

```
import Redis from 'ioredis'

const redis = new Redis()

redis.publish('micromail', JSON.stringify({
    to: 'recipient@example.com',
    from: 'sender@example.com',
    subject: 'hello world',
    template: 'example',
    context: { hello: 'hello world' },
}))
```
