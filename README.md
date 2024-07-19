# micromail

A little nodemailer SMTP real-time microservice (~300 loc)

### It passes the butter

<img src="https://i.imgur.com/sVYSwYB.gif" alt="drawing" width="100"/>  
  
microMail is little redis-backed SMTP real-time microservice with handlebars templating.

Creating and managing email templates and firing off emails isn't always easy in some frameworks, so this universal microservice was created to help you get you quickly set up with mailing in a modular way that can be utilized across your architecture. Simply publish an event to Redis to send a templated email from any web app, service or script you may have on the back-end.

### Setup App

Setup .env variables:

```
SMTP_HOST=example.com
SMTP_PORT=465
SMTP_USER=exampleuser
SMTP_PASS=examplepass
REDIS_URL=redis://127.0.0.1:6379
```

### Start App

<img src="https://skillicons.dev/icons?i=bun,docker"/>

Using Bun / Docker
<br />

Install node modules: `bun install`  
Start application: run `bun src/app.ts`  
Run in Docker: run `docker-compose up`

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

<h3>C# Example</h3>
<img src="https://skillicons.dev/icons?i=cs" />
  
Redis publish an email via C#

```
var redis = ConnectionMultiplexer.Connect("localhost:6379");
var db = redis.GetDatabase();

db.Publish("micromail", JsonConvert.SerializeObject(new
{
    to = "recipient@example.com",
    from = "sender@example.com",
    subject = "hello world",
    template = "example",
    context = new { hello = "hello world" }
}));
```
