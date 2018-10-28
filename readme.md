# AWS security group (firewall) hole puncher

DISCLAIMER: I'm not responsible if anything happens to your AWS account or resources or anything that could be directly or indirectly a consequence of using this tool.

So, you have your AWS resource where you put all your magic and you don't want to left it open to the world and unprotected. Yeah, we've all been through that. Also, you have a an internet connection at home that rotates its IP address and you are constantly finding out which IP you have and running the AWS CLI commands to open once again those resources. Yup, we've been through that as well.

This is a dependency-less (only official python AWS CLI) Node.JS script that will open the port you specify auto detecting your IP address right from the terminal.

## Requirements

1) Have Python installed in your machine
2) Have the official AWS CLI installed in your machine (open your terminal and do pip install awscli | aws configure). You will need to enter an access key, secret and region where you will be operating in.
3) Have Node.JS installed
4) Install this package globally with npm install -g aws-hole-puncher (if you want to use it from anywhere in the terminal)

## Usage

node aws-hole-puncher -group=group-id -services=service-name
where:

- group-id is the ID of the security group associated with the resource you work on
- service-name is the service name you need (currently supporting rdp, ssh, mssql, mysql, postgresql, for others do a pull request and add those into the serviceIdentifier function, super simple :P)

you can also add multiple ports in one shot like
aws-hole-puncher -group=group-id -services=service-name1,service-name2,service-name3,service-name4

e.g: node aws-hole-puncher -group=sg-12345 -services=ssh,postgresql // will open ports tcp 22 and tcp 5432 on the security group sg-12345 for your current ip

## Things to consider

- As this script fetches your IP from https://ipinfo.io/ip, if you are being MITM'ed then the IP that will be added will be the one of your attacker, but I assume you already know this.
- You need to configure your AWS credentials in the AWS CLI, I don't do it for you and neither I will
- You need to know the id of the security group ID you are working with
- I did this completely dependency-less and only using node native modules for strenghtening the security of the module