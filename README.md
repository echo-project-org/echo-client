# Echo project

Teamspeak like application with overkill audio quality

# Dev build

In the electron folder, execute `npm start`. The process will automatically compile the frontend on [http://localhost:3000](http://localhost:3000) and show it in the electron app, opening the RTC debug and WebTools.

# Prod build

In the echo folder execute `npm run build` and wait for react and webpack to finish building and packaging the frontend.
Then go to the electron folder and run `npm run make` to package the built frontend in the electron app with squirrel executable.

The executable together with the installer will be put inside /electron/out. The app can me compiled for Windows, Linux and Mac (not tested).

# API

To run the API you will need a working MySQL database and to have the correct table.
TBD: add sql file to API folder.
