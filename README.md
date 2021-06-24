# bound.less

Vector-based drawing and diagramming web application with infinite zooming capabilites developed by Michael Sawchuk, Kobin Kempe, Anuja Mehta, and Nolan Raghu. We used:

* Google Firebase Authentication and Hosting
* Google Firebase Realtime Database and Storage
* npm
* React.js
* Two.js


The website is usable, and zoomable to the limits of an SVG file, but a few weeks of work are needed for its full capabilities. Next steps include:

* Updating the design, especially the toolbar icons and dynamically sizing the toolbar
* Improving autosave so it works as expected, and implementing the download tool
* Creating thumbnails
* Finishing the infinite zoom algorithm by saving and clearing groups that are not being rendered, or cropping the ones that are zoomed in closely (cropping is implemented, but needs to be done when zoomed in to a certain threshold), and saving these changes to the SVG so the stale groups can be repopulated when opened. This will bridge from SVG infinite zoom to actual infinite zoom
* Fixing some small technical bugs (The paths have to be reloaded differently than they are saved because of a bug in Two.js, so that should be done when the path is originally made so the computer loads it the same as it was saved. Also, a small bug that is unlikely to come up when cropping a shape that intersects itself on the screen)
* Eventually creating some sort of map or 'return to original position' feature so the original drawing area doesn't become zoomed out too much, never to be found again


URL: https://bound-less-vu.web.app/
