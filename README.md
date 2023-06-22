# AutoChart
AutoChart is a Node.JS script that generates a .json chart file from a MIDI and a special chromatic scale map .json. Effectively removes the need to chart songs manually.
Note that it is currently not as stable as it may seem.
# How to use
1. [Download and install Node.JS](https://nodejs.org/) (dont forget to install NPM)
2. Download this repository, as a .zip or with git
3. Run `npm i midi-file` in the same directory as the script
4. Open the script in a text editor (NOT NOTEPAD), and edit the settings at the top
5. Edit the chromatic scale .jsons to fit the chromatic scales used in your song (soundfonts might work)
6. Edit songdata.json to your liking
7. Run `node autochart`
8. ?????
9. PROFIT!!!
# Known issues
* The first note in sections sometimes disappears
* Chart desynchronization on spamtracks
