# SimpleTask

This project is a simple approach to a task app with only three columns, Today, Tomorrow, and This Week. Based on the day the task was added, it will move automatically from Tomorrow to Today and will also turn colors based on how long it has been untouched. The live version of the application can be found here: [Simple Tasks](https://fox-simple-task.web.app/). Please, feel free to sign up and use it.

## Technical Description

Simple Tasks is designed to work on both desktop and mobile. The database and hosting are through Firebase. The project is written using Angular 11. Simple Tasks does use PWA technologies having a manifest and a default service worker to make it downloadable as a stand-alone app, but it does not fully work offline yet.

## Development server

To run Simple Tasks, clone the project, run `npm install`, and finally run `ng serve`. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Help

To know more about Angular, check out their in-house tutorial [Angular Tutorial](https://angular.io/docs) which covers most surface level needs. For Firebase, they also have great documentation [Firebase Tutorial](https://firebase.google.com/docs) but they do not have comprehensive instructions for Angular. Here is one great tutorial on setting up Firebase hosting for Angular [Hosting Tutorial](https://www.positronx.io/deploy-angular-app-to-production-with-firebase-hosting/).
