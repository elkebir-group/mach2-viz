# MACH2-Viz
MACH2 is an upgraded version of MACHINA. Visualizing the solution space for the parsimonious migration history problem with polytomy resolution. Solutions are generated via the MACHINA algorithm ([El-Kebir et. al.](https://www.nature.com/articles/s41588-018-0106-z)) and MACH2 (Roddur et. al.).

## Current Deployed Version
To view the current deployment of MACH2Viz, go to [this link](https://elkebir-group.github.io/mach2-viz/#/)

## Running MACH2-Viz on Localhost
To run MACH2-Viz on localhost, simply do the following:  
1. Clone this repository
2. Run `npm install`
3. Run `npm start`  
  a. **NOTE:** You may run into dependency issues with OpenSSL  
  b. in which case simply run `export NODE_OPTIONS=--openssl-legacy-provider` and try again
