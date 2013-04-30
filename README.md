# CatalogApp: 
### A Node.js and iOS lovechild that delivers an iOS content browsing app, and an Node.js app that collects, curates, and serves that content.
---

Catalog is a very simple solution for curating user submissions for a catalog or portfolio website and companion iOS app. It consists of a Node.js application that provides gallery lists of curated projects for browsing, a project submission and editing interface, and an admin interface for approving/rejecting the content. A simple iOS app is provided, preconfigured to grab all of the information about the catalog projects via JSON. The iOS app loads and displays the content in a very nice feeling full-screen swipe-gallery.

This project was originally built for the [Emily Carr Grad Catalog of 2013](http://theshow2013.ecuad.ca/), but the code is MIT licensed so anyone is free to fork, contribute, and adapt it to thise own needs. See the license at the very bottom of this document.

## Project Layout
---

In the root of the repository along with this README.md, there are two folders:

- iOS: It contains all the code necessary to build the companion iOS application
- Web App: Contains all the code necessary

## Server-side Dependencies
---

Aside from the node dependencies (which will be discussed in the next section) there are some requirements that the machine you intend to host that app on must meet*:

You must install, for whatever OS and distribution you have:

- [Imagemagick](http://www.imagemagick.org/script/index.php)
- [Postgres](http://www.postgresql.org/download/) (We recommend using [brew](http://mxcl.github.io/homebrew/)** to install Postgres, but if you have a package manager that will automagically do this for you, go for it.)

\* Please note that Steamclock Software is unable to provide support for the installation of Imagemagick and Postgres.

\*\* If you are installing Postgres via the brew method and find you have problems with which binary is in your path, check out [this article](http://nextmarvel.net/blog/2011/09/brew-install-postgresql-on-os-x-lion/)

We also recommend:

- [Monit](http://mmonit.com/monit/)
- [Forever]()
- Heck, both if you'd like

... for monitoring the status of your app when it is deployed in the wild.


## Setting up the Node.js app
---

1. Make sure you have installed imagemagick and postgres as indicated from the previous section. Note that you should have a database ready to go with u/p credentials. You'll need those soon enough.
2. Clone or fork the repo.
3. `npm install` to install all the dependencies. Note that using this command will install all dev dependencies.  You will probably only want to install the required dependencies for production when you do deploy.
4. `npm install -g db-migrate` - because for some reason just installing it locally hasn't been playing nice. 
5.  Set up your config files:

In a file at /config/config.json:


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

In a file in your document root put a file called database.json

```json
{
  "dev": {
    "driver": "pg",
    "user": "username",
    "password": "password",
    "host": "localhost",
    "database": "emilycarr"
  }
}
```

There is [a ticket open](http://github.com/steamclock/catalog/issues/2) in Issues to consolidate the location and contents of the initial configurations into a single place.

6. Run `db-migrate up` until the service tells you there is nothing to do. 

7. Run `'node app' and navigate to 'localhost:3000' and you should be good to go.

## Setting up and Building the iOS app
---

[Stub!]

## License
---

Copyright (C) 2013 Steamclock Software Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.