SpindleView is a web program designed to work with a CNC or milling machine and a camera mounted on or near the spindle.

By using a fixed camera pointing downward (usually) you can set stock origins, find circle centers, check that edges follow an
axis, and define then repair CNC nonlinearities introduced by skew in axes, non-straight rails, non-parallel rails, and such.

SpindleView enables a lot of these simply by displaying the spindle camera image then linking it to the CNC axes for reporting
and setting origins and finding errors. It contains multiple reticles for measuring and seeing distances.

1. Mouse around to see what coordinate the mouse is pointing at. 
2. Note distances to a fixed spot.
3. Click a button to move the spindle so that the camera center is over the spot, or
4. Click a button to move the spindle over the pointed spot.

SpindleView is written in TypeScript. It relies on NPM (Node Package Manager). Building help is in the SpindleView folder.

The SpindleView writeup is here: https://medium.com/home-wireless/spindleview-cnc-camera-software-a647393fb379

How to build the application ->

// go to the project subfolder<br>
cd SpindleView<br>
// install the npm requirements<br>
npm install<br>
// run the build script<br>
npm run build

## Release - distribution files
The set of distribution files are in the release folder. This folder is manually updated by me when the code updates. It copies the dist\spindle-view folder created by build.

