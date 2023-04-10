# SpindleView

# Doc on the RRF rest api:
https://github.com/Duet3D/RepRapFirmware/wiki/HTTP-requests

# Building the web site
to build the webpack contents, in the project folder
<br>```npm run build```<br>
which creates a dist\spindle-view folder which can be served


# Using a local npm server on a Windows PC
Install npm. from https://nodejs.org/en/download/
then install a simple server...<br>
```npm install -g http-server```

In the spindle-view web folder run<br>
```http-server```
   <br>or<br>
```http-server -c-1 -p80 --cors```

then it's on port 80 of localhost with no caching

# Using a local npm server on a Linux PC
Install npm. In linux use
<br>```sudo apt install npm```<br>
then install a simple server...<br>
```sudo npm install -g http-server```

In the spindle-view web folder run<br>
```http-server```
   <br>or<br>
```http-server -c-1 -p80 --cors```

then it's on port 80 of localhost with no caching and allow everyone

# using a linux npm server

```
cd mydistfolder
sudo apt install npm
sudo npm install -g http-server
http-server [-p80] [--cors] [-c-1]
```

