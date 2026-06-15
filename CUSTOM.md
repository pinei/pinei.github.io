# Custom instructions

## How to serve

```
npx quartz build --serve
````

This will start a local web server to run your Quartz on your computer.

Open a web browser and visit http://localhost:8080/ to view it.

## How to pull and update content

```
> git clone https://github.com/pinei/pinei.github.io.git

> git submodule status
-693cf7b88b1237229e51cf443b6aa0abd633ee72 content

> git submodule init
Submodule 'content' (https://github.com/pinei/quartz-content.git) registered for path 'content'

> git submodule update
Cloning into '.../pinei.github.io/content'...
Submodule path 'content': checked out '693cf7b88b1237229e51cf443b6aa0abd633ee72'

> cd content
> git remote -v
origin  https://github.com/pinei/quartz-content.git (fetch)
origin  https://github.com/pinei/quartz-content.git (push)

> git pull origin main
From https://github.com/pinei/quartz-content
 * branch            main       -> FETCH_HEAD
Updating 693cf7b..4e63c7b
...

cd ..
git add content
git commit -m "Content updated"
git push
```
