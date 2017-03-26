# Angular Markdown Wiki App

You need a personal wiki for writing things down you think you will forget ?

Simply write everything you want in markdown files, organize them in the folder structure you need, and this app will serve everything through a Bootstrap-themed web interface.


Following features are supported:
 * All files are directly accessible through a navigation bar
 * Page content search
 * Todo-lists
 * Code highlighting
 * Font-awesome icons
 * Table of contents
 * ...

## Getting started

Before getting started, you need following things:
 * [Node](https://nodejs.org/en/download/)
 * [Bower](https://bower.io/)
 * [Gulp](http://gulpjs.com/)
 * a text editor, like [Sublime](https://www.sublimetext.com/)

### Installation

First, clone this repo (this way you will be able to get the latest updates by simply performing a `git pull`):

```sh
git clone https://github.com/egoettelmann/angular-markdown-wiki-app.git
```

Second `cd` into the projects directory and install all required Node dependencies:

```sh
npm install
```

Third, install all required Bower dependencies:

```sh
bower install
```

At the root of the folder, you will find a `config-sample` file. Copy and rename it to `config`. This file allows to configure the app.

The last step is to build the app through Gulp:

```sh
gulp all
```

### Usage

Now, to access the app, you need to have a webserver (like [Apache](https://httpd.apache.org/download.cgi)) that points to the `public` folder of the project.

Place your markdown files into the `resources/content` folder. Do not hesitate to create folders to organize your files, it will create different entries into the app's navbar.

To generate the app's content, simply run the Gulp default command:

```sh
gulp
```

Each time you change or add a file, you have to re-run this command to re-generate the app's content.

### Configuration

In the configuration file you can specify following options:

| Option name | Description | Example |
|--|--|--|
| `defaultRoute`   | The default file to display when opening the app | `/cheatsheets/markdown` |
| `highlightTheme` | The theme to use for the code highlighting. The theming is performed with [highlight.js](https://highlightjs.org/static/demo/), so any of those themes are available options. | `darcula` |


