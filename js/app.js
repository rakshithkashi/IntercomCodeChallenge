/* Load external modles and global constants */
const fs = require('fs');
const globals = require('./constants.js');

/*Global variables*/
var customersData; // to store customers data from file
var invitingCustomers = []; // initailze array to store all invited customers

/*Dublin office co-ordinates - Convert into radians */
var dublinOfficeCoordinates = {
  'latitude' : convertDegtoRad(globals.DUBLIN_LAT),
  'longitude': convertDegtoRad(globals.DUBLIN_LONG)
}

/* Utility method 1 - Convert Degrees to radians and return the radians*/
function convertDegtoRad(degrees){
  var radians = degrees * (Math.PI / 180) ;
  return radians;
}

/*---- Load the data of the customerList ----*/
function readCustomersFile() {
  try{
    var fetchedData = fs.readFileSync(globals.CUSTOMERS_FILE_PATH); // read customer data and save
    customersData = fetchedData.toString().split('\n');

    callNearByCustomers(); // Call event to process customers data
  }catch(err){
    console.log(err);
  }
}


/*----- Process and Calculate the nearby distance from the data -----*/
function callNearByCustomers(){
  //loop through every customer data and process into nearby range
    for(var i=0;i<customersData.length;i++){
      var eachCustomer = JSON.parse(customersData[i]);
      // Call method for calculating nearby range
      calculateDistanceofCustomers(eachCustomer);
    }
    // Call method to sort the invited customers according to their User ID
    sortInvitedCustomers();
}

/*---- Calculate the Nearby range from the given co-ordinates and filter the customers ----*/
function calculateDistanceofCustomers(customer){
  var customerLatitude = convertDegtoRad(customer.latitude);
  var customerLongitude = convertDegtoRad(customer.longitude);
  var diffLongitude = Math.abs(customerLongitude - dublinOfficeCoordinates.longitude);
  var pointOfCentre = Math.acos((Math.sin(dublinOfficeCoordinates.latitude) * Math.sin(customerLatitude))
                      + (Math.cos(dublinOfficeCoordinates.latitude) * Math.cos(customerLatitude) * Math.cos(diffLongitude)));
  if((pointOfCentre * globals.RADIUS_OF_EARTH) <= globals.NEARBY_CUSTOMERS_RANGE){
    invitingCustomers.push(customer); // Add the nearby range customer to array
  }
}

/*---- Sort the invited customers according to their User ID ----*/
function sortInvitedCustomers(){
  invitingCustomers.sort(function(a,b){
    return a.user_id - b.user_id ;
  });

  //Call method to Write and Print invited customers data.
  WritenPrintCustomers();
}

/*----- Write the Invited customer details to file and print it ----- */
function WritenPrintCustomers(){
  console.log("------------Selected Customers for Intercom Dublin Office for Food and Drinks-------------");
  invitingCustomers.forEach(function(customer){
    console.log(customer);
  });
  var customerString = JSON.stringify(invitingCustomers);
  fs.writeFileSync('InvitedCustomers.json',customerString);
}

/*Call method to read data from file*/
readCustomersFile();
