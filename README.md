# Catalog

---

Catalog is a very simple solution for curating user submissions for a catalog or portfolio. It is being built for the Emily Carr Grad Catalog of 2013, but is MIT licensed so anyone is free to use it to solve their own problems without restriction. See the license below.

## How it Works
---

Or rather, how it *will* work when it's done.

Content items are submit for administrator curation. Administrators have access in a simple interface where they can either approve or reject the content items. A simple API is provided so that content can be served to an endpoint like an iOS app or web app.

## How to use it
---

1. Clone the repo.
2. `npm install` to install all the dependencies (there aren't very many)
3. Set up your config file:

```json
{
    "baseurl" : "whimsicalurl.com",

    "postgres" : {
        "username" : "sparkly",
        "password" : "unicorn",
        "dbname" : "magicpants"

    },

    "mail" : {
        "service" : "Gmail",
        "username" : "panda@amazinggifs.com",
        "password" : "bamboo"
    }
}
```

## License

Copyright (C) 2013 Steamclock Software Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.