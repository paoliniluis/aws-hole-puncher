const util = require('util');
const exec = util.promisify(require('child_process').exec);
const request = require ('./request.js');

async function getIp() {
    try {
        let ip = await request.get();
        return ip
    } catch (e) {
        throw new Error (e);
    }
}

async function getVars (array) {
    try {
        let myIp = await getIp();
        myIp = `${myIp.replace('\n', '')}/32`;

        let config = {
            securityGroup: null,
            rules: []
        };

        array.forEach(element => {
            if (element.includes('-services')) {
                if (element.split('=')[1].includes(',')) { // many services
                    element.split('=')[1].split(',').forEach(secondDegreeElement => {
                        config.rules.push({
                            FromPort: serviceIdentifier(secondDegreeElement).port,
                            IpProtocol: serviceIdentifier(secondDegreeElement).protocol,
                            IpRanges: [{
                                CidrIp: myIp,
                                Description: ''
                            }],
                            Ipv6Ranges: [],
                            PrefixListIds: [],
                            ToPort: serviceIdentifier(secondDegreeElement).port,
                            UserIdGroupPairs: []
                        })
                    })
                } else { // one service
                    config.rules.push({
                        FromPort: serviceIdentifier(element.split('=')[1]).port,
                        IpProtocol: serviceIdentifier(element.split('=')[1]).protocol,
                        IpRanges: [{
                            CidrIp: myIp,
                            Description: ''
                        }],
                        Ipv6Ranges: [],
                        PrefixListIds: [],
                        ToPort: serviceIdentifier(element.split('=')[1]).port,
                        UserIdGroupPairs: []
                    })
                }
            }
            // if (element.includes('-services')) config.rules.securityGroup = element.split('=')[1] || '';
            if (element.includes('-group')) config.securityGroup = element.split('=')[1] || '';
        });
        return config;
    } catch (e) {
        throw new Error(e);
    }
}

const serviceIdentifier = service => {
    let combo = { port: null, protocol: null };
    if (service == 'ssh') combo = { port: 22, protocol: 'tcp' };
    if (service == 'rdp') combo = { port: 3389, protocol: 'tcp' };
    if (service == 'mysql') combo = { port: 3306, protocol: 'tcp' };
    if (service == 'mssql') combo = { port: 1433, protocol: 'tcp' };
    if (service == 'postgresql') combo = { port: 5432, protocol: 'tcp' };
    return combo;
}

async function describe(securityGroup) {
    const out = await exec(`aws ec2 describe-security-groups --group-id ${securityGroup}`);
    let result = JSON.parse(out.stdout)
    return result.SecurityGroups[0].IpPermissions;
}

async function removeAll(securityGroup, permissions) {
    const out = await exec(`aws ec2 revoke-security-group-ingress --group-id ${securityGroup} --ip-permissions ${permissions}`);
    return 'All rules wiped';
}

async function addRule (securityGroup, permissions) {
    const out = await exec(`aws ec2 authorize-security-group-ingress --group-id ${securityGroup} --ip-permissions ${permissions}`);
    return null;
}

async function main() {
    let vars = await getVars(process.argv);
    let ipPermissions = await describe(vars.securityGroup);
    if (ipPermissions.length != 0) { // nothing to remove
        console.log('Removing previous rules');
        let b = await removeAll(vars.securityGroup, `'${JSON.stringify(ipPermissions)}'`);
    }

    if (vars.rules.length > 1) {
        vars.rules.forEach(rule => console.log(`Adding port ${rule.FromPort}/${rule.IpProtocol} to ${vars.securityGroup}`));
    } else {
        console.log(`Adding port ${vars.rules[0].FromPort}/${vars.rules[0].IpProtocol} to ${vars.securityGroup}`)
    }
    
    await addRule(vars.securityGroup, `'${JSON.stringify(vars.rules)}'`);
}

main();