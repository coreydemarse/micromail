# micromail

A little nodemailer SMTP microservice

### It passes the butter

<img src="https://i.imgur.com/sVYSwYB.gif" alt="drawing" width="100"/>  
  
microMail is a simple HTTP POST wrapper around nodemailer with handlebars for templating

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
Start application: run `yarn compile` then do `yarn start`  
Run in Docker: run `yarn compile` then do `docker-compose up`

<h3> Ruby Async HTTP Example</h3>
<img src="https://skillicons.dev/icons?i=ruby"/>  
  
Make a simple HTTP POST request to micromail to send an email

```
require 'async/http/client'

def sendmail(email)
    url = Async::HTTP::Endpoint.parse('http://127.0.0.1:3939/')
    client = Async::HTTP::Client.new(url)

    # Prepare the POST request with the provided data
    request = Async::HTTP::Request.new('POST', '/', {
        'Content-Type' => 'application/json',
        'Content-Length' => data.bytesize.to_s
    },{
        :to => email[:recipient],
        :from => email[:sender],
        :subject => email[:subject],
        :template => email[:template],
        :context => email[:context]
    }.to_json)

    client.call(request)
ensure
    # Close the client to release resources
    client.close if client
end
```

Replies with `status 200` if email sent successfully  
Replies with `error 418` if email was not sent

<h3>Python Async HTTP Example</h3>
<img src="https://skillicons.dev/icons?i=python"/>

```
import json
import httpx

async def sendmail(email):
    # Convert the email data to JSON
    data = {
        'to': email['recipient'],
        'from': email['sender'],
        'subject': email['subject'],
        'template': email['template'],
        'context': email['context']
    }

    # Convert the data to JSON format
    json_data = json.dumps(data)

    # Create an HTTPX client
    async with httpx.AsyncClient() as client:
        try:
            # Prepare the POST request with the provided data
            response = await client.post('http://127.0.0.1:3939/', data=json_data, headers={'Content-Type': 'application/json'})

            # Check if the request was successful
            if response.status_code == 200:
                print("POST request successful!")
                print("Response:", response.text)
            else:
                print(f"POST request failed with status code {response.status_code}")
                print("Response:", response.text)
        except httpx.RequestError as e:
            print(f"Error making POST request: {e}")
```

#### Example usage:

```
email = {
    'recipient': 'recipient@example.com',
    'sender': 'sender@example.com',
    'subject': 'Test email',
    'template': 'email_template',
    'context': {'key': 'value'}
}

await sendmail(email)
```
