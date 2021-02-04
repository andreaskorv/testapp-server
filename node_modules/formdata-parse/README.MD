# formdata-parse 

An [Express](http://expressjs.com) middleware of
[Formidable](https://github.com/felixge/node-formidable) that just works.

## What is formdata-parse?

[formdata-parse] is a Node.js module
for parsing form data, including `multipart/form-data` file upload.


It aims to just work.

## Install

```
npm install formdata-parse
```

## How to use

```ts
import parseForm from 'formdata-parse';
import express from 'express';

let app = express();

app.post('/upload',parseForm, (req, res, next) => {
  req.fields; // contains non-file fields
  req.files; // contains files
});
```

And that's it.

## License

[MIT](LICENSE)
