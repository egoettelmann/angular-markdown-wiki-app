Documentation
=============

Here are some advanced explanations of how to use the app.

[TOC]

## Configuration

The configuration file (`config`) is located at the root of the app. There you can specify following options:

| Option name | Description | Example |
|--|--|--|
| `defaultRoute`   | The default file to display when opening the app | `/cheatsheets/markdown` |
| `highlightTheme` | The theme to use for the code highlighting. The theming is performed with [highlight.js](https://highlightjs.org/static/demo/), so any of those themes are available options. | `darcula` |

## Updating the app

To update the app to the latest available version, you simply have to pull changes from the Github repo (provided that you cloned it properly in the first place).

To prevent any changes that you could have done on the project itself, first reset all changes:
```sh
git reset --hard HEAD
```

Then, at the root of the project, type:
```sh
git pull
```

To re-build the app, execute the following gulp task:
```sh
gulp init
```

::: alert-warning
**Note:** check the [Release Notes](#!/about/release-notes) section after an update to be sure that there are no additional steps to perform. If new dependencies are required, a `npm install` followed by a `bower install` have to be executed before performing the `gulp init`.
:::

## Version your content

Your content is obviously important, so you should think about versioning it. Wether you need versioning to keep track of your changes, create backup copies or even share it, everything can be achieved with the app's folder structure and the wonderful tool that is Git.

If your new to Git, you should read the following: [https://git-scm.com/book/en/v2]()

### Local repo

The most simple step to perform is to create a local git repo for your files stored in `resources/content`:
```sh
git init
```

Add everything that is in there and regularly commit your changes:
```sh
git add .
git commit -m 'My awesome commit message'
```

### Remote repo

To backup your files in a remote repo, or to be able to synchronize it on other locations, add a remote:
```sh
git add remote origin [YOUR_REMOTE_REPO_LOCATION]
```

Once the remote added, simply push our commits:
```sh
git push origin master
```

### Shared repos

If you need to share your wiki files with others, you will probably have the issue that some of your files contain personal or even sensitive information (that obviously you should not share).

This is where Git Submodules are very handy, because they allow to split your content into different repositories, each of which you can manage independently.

To be able to do this, you should have the following structure:

- one main repo that is or is not linked to a remote repository (if it is, this remote should be private). This main repo should **not be shared**. This repo can than contain:
  - files with personal or sensitive information
  - as many public, shared or even private repositories you want that are included as submodules in different folders

So, for example you could create the following (from `resources/content`):
```sh
git init
mkdir public_wiki
cd public_wiki
git init
touch public_file.md
git add .
git commit -m 'First public commit'
cd ../
git submodule add ./public_wiki public_wiki
touch private_file.md
git add .
git commit -m 'First private commit'
```

You can then add a remote to your `public_wiki` to share your `public_file.md` with others.
Your `private_file.md` will stay private, as long as you do not share your main repo.
