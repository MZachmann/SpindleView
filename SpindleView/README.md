# SpindleView
<br><br>

## Preparation
1. Install npm from https://nodejs.org/en/download/
2. ```cd SpindleView```
3. ```npm install```
<br><br>

## Doc on the RRF rest api:
https://github.com/Duet3D/RepRapFirmware/wiki/HTTP-requests
<br><br>

## Building the web site
to build the webpack contents, in the project folder
<br>```npm run build```<br>
which creates a dist\spindle-view folder which can be served
<br><br>

## Using a local web server
Install a simple web server...(once)<br>
```npm install -g http-server```

In the dist\spindle-view folder run<br>
```http-server```
   <br>or if<br>
```http-server -c-1 -p80 --cors```<br>
then it's on port 80 of localhost with no caching
<br><br>

