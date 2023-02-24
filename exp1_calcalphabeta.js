// Initialize delay values for alpha and beta
var beta_delay = 0; // init beta // target-alpha
var alpha_delay = 0; // init alpha
// Initialize new delay values for alpha and beta
var new_beta_delay = 0; // init beta // beta_delay + delta(target_delay + last_logged_delay)
var new_alpha_delay = 0; // init alpha // target-new_beta_delay

var today = new Date();
// Extract the year, month, day, hours, minutes and seconds from the current date
var year = today.getUTCFullYear();
var month = ('0' + (today.getUTCMonth() + 1)).slice(-2);
var day = ('0' + today.getUTCDate()).slice(-2);
var hours = ('0' + today.getUTCHours()).slice(-2);
var minutes = ('0' + today.getUTCMinutes()).slice(-2);
var seconds = ('0' + today.getUTCSeconds()).slice(-2);

var refresh_cnt = 461;

var updated_ts = '"' + year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds + '"';


function main() {

  // Display the header for the output
  console.log('now, updated_ts, last_ts, last_offset, last_score, alpha_delay, beta_delay, status');
  // Call the network_delay_change function every 30 seconds
  setInterval(network_delay_change, 30000); // every 30sec=30000

} // main end

// Declare the network_delay_change function
async function network_delay_change() {
// Import necessary libraries
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require("path");
const { convertCSVToArray } = require('convert-csv-to-array');
const converter = require('convert-csv-to-array');

// Increment the refresh count

  if (refresh_cnt % 2 == 0){
  refresh_cnt++;
  var resp_URL = 'https://www.ntppool.org/scores/163.152.23.170/log?limit=' + (refresh_cnt * 2) + '&monitor=*';
  var resp = await axios.get(
	resp_URL,
  );

  } else {
    refresh_cnt++;
  var resp_URL = 'https://www.ntppool.org/scores/163.152.23.170/log?limit=' + (refresh_cnt * 2) + '&monitor=*';
  var resp = await axios.get(
	resp_URL,
  );
  }
  // Reset the refresh count if it exceeds 90 minutes
  if (refresh_cnt > 580){ // 90min <- over 1hour refresh 180
  refresh_cnt = 401;
  }
  // Set the target delay and offset values
  var target_delay = 500;
  var target_offset = Math.abs(target_delay/2000); // 0.25ms

  const $ = cheerio.load(resp.data);

  const extractedCode = $('body').first().html();
  // Save the extracted data to a CSV file
  var extractedStr = extractedCode;
  fs.writeFile('/home/isslab_owner/바탕화면/ntpservercrawl/script/ntpserverscore.csv', extractedStr, err => {
    if (err) {
      console.error(err)
      return
    }
  })

// Convert the CSV data to an array
const arrayofArrays = convertCSVToArray(extractedCode, {
  header: false,
  type: 'array',
  separator: ',', // use the separator you use in your csv (e.g. '\t', ',', ';' ...)
});

var last_offset = arrayofArrays[0][2];
var last_ts =  arrayofArrays[0][1];
var last_score =  arrayofArrays[0][4];

var before_offset = arrayofArrays[2][2];
var before_ts =  arrayofArrays[2][1];
var before_score =  arrayofArrays[2][4];

var nowTime = new Date();

var nowyear = nowTime.getUTCFullYear();
var nowmonth = ('0' + (nowTime.getUTCMonth() + 1)).slice(-2);
var nowday = ('0' + nowTime.getUTCDate()).slice(-2);
var nowhours = ('0' + nowTime.getUTCHours()).slice(-2);
var nowminutes = ('0' + nowTime.getUTCMinutes()).slice(-2);
var nowseconds = ('0' + nowTime.getUTCSeconds()).slice(-2);

var nowUTC ='"' + nowyear + '-' + nowmonth + '-' + nowday + ' ' + nowhours + ':' + nowminutes + ':' + nowseconds + '"';

// Calculate alpha,beta delay for unalarmed status
if (updated_ts == last_ts){
	console.log(nowUTC + "," + updated_ts + "," + last_ts + "," + last_offset + "," + last_score + "," + new_alpha_delay + "," + new_beta_delay + "," + "no_update");
	return new_beta_delay, new_alpha_delay;
}else {
	if (alpha_delay == 0 && beta_delay == 0) {
	alpha_delay = Math.round(Math.abs(((last_offset - before_offset) * 2000)));
	new_alpha_delay = alpha_delay;
	console.log(nowUTC + "," + updated_ts + "," + last_ts + "," + last_offset + "," + last_score + "," + new_alpha_delay + "," + new_beta_delay + "," + "initiate_alpha");
	beta_delay = target_delay - alpha_delay;
	new_beta_delay = beta_delay;
	console.log(nowUTC + "," + updated_ts + "," + last_ts + "," + last_offset + "," + last_score + "," + new_alpha_delay + "," + new_beta_delay + "," + "initiate_beta");
	updated_ts = last_ts;
	return new_beta_delay, new_alpha_delay;
	} else if (updated_ts != last_ts) {
	new_alpha_delay = alpha_delay - (Math.round((target_offset + last_offset) * 2000));
	console.log(nowUTC + "," + updated_ts + "," + last_ts + "," + last_offset + "," + last_score + "," + new_alpha_delay + "," + new_beta_delay + "," + "alpha_updated");
	new_beta_delay = target_delay - new_alpha_delay; 
	console.log(nowUTC + "," + updated_ts + "," + last_ts + "," + last_offset + "," + last_score + "," + new_alpha_delay + "," + new_beta_delay + "," + "beta_updated");
	
	
	updated_ts = last_ts;
	} else {
	console.log("excepted! Error!");
	}
}


const { exec } = require("child_process");


// 2nd command 

exec("sudo tc qdisc change dev enp6s0 parent 1:3 handle 30: netem delay " + (new_alpha_delay+new_beta_delay) + "ms 20ms", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});


return new_beta_delay, new_alpha_delay;
}

main();

