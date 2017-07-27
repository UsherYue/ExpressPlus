/**
 * 12XueSSO
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/7/19
 * Time: 14:51
 */


"use strict";

let os = require('os');

module.exports = {
    /**
     * ipv4
     * @returns {string}
     */
    ipV4: () => {
        var network = os.networkInterfaces();
        var netList =network.eth0?network.eth0:(network.en0?network.en0:network.WLAN);
        for (let addrInfo of netList) {
            if (addrInfo.family == 'IPv4') {
                return addrInfo.address;
            }
        }
        return '';
    },
    /**
     * ipv6
     * @returns {string}
     */
    ipV6: () => {
        var network = os.networkInterfaces();
        var netList =network.eth0?network.eth0:(network.en0?network.en0:network.WLAN);
        for (let addrInfo of netList) {
            if (addrInfo.family == 'IPv6') {
                return addrInfo.address;
            }
        }
        return '';
    },
};
