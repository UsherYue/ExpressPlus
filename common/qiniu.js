/**
 * ExpressPlus
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 2018/3/18
 * Time: 11:57
 */

var qiniu = require('qiniu');

module.exports = {
    /**
     *
     * @param accessKey
     * @param secretKey
     * @param filename
     */
    upload: function (accessKey, secretKey, bucket, filename) {
        return new Promise(function (resolve, reject) {
            let options = {
                scope: bucket,
            };
            var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
            let putPolicy = new qiniu.rs.PutPolicy(options);
            let uploadToken = putPolicy.uploadToken(mac);
            let config = new qiniu.conf.Config();
            config.zone = qiniu.zone.Zone_z0;
            config.useCdnDomain = true;
            let formUploader = new qiniu.form_up.FormUploader(config);
            let putExtra = new qiniu.form_up.PutExtra();
            // 文件上传
            formUploader.putFile(uploadToken, null, filename, putExtra, function (respErr, respBody, respInfo) {
                if (respErr) {
                    resolve(false);
                }
                if (respInfo.statusCode == 200) {
                    resolve(respBody);
                } else {
                    //此处如果上传文件失败也需要记录下来后续在上传
                    resolve(false);
                }
            });
        });
    },
    /**
     * 获取七牛上传token
     * @param accessKey
     * @param secretKey
     * @param bucket
     * @returns {Promise.<*|Promise>}
     */
    uploadToken:async (accessKey, secretKey, bucket)=>{
        let options = {
            scope: bucket,
            expires:600
        };
        var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        let putPolicy = new qiniu.rs.PutPolicy(options);
        let uploadToken = putPolicy.uploadToken(mac);
        return uploadToken;
    },
    /**
     * meta info
     * @param accessKey
     * @param secretKey
     * @param bucket
     * @param key
     * @returns {Promise}
     */
    stat: function (accessKey, secretKey, bucket, key) {
        return new Promise(function (resolve, reject) {

            var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
            let config = new qiniu.conf.Config();
            let bucketManager = new qiniu.rs.BucketManager(mac, config);
            bucketManager.stat(bucket, key, function (err, respBody, respInfo) {
                if (err) {
                    resolve(false);
                } else {
                    resolve(respBody);
                }
            });

        });
    },
    /**
     *  产生七牛etag 校验文件完整性
     * qiniu.stat(accessKey,secretKey,bucket,'o_1am01vfk71otg1mof17hbgd11ost.xlsx').then(function (r) {
     *       console.log(r);
     * });
     * qiniu.getEtag('../conf/1.xlsx').then(function (r) {
     *   console.log(r);
     * });
     * @param filename
     */
    getEtag: (buffer) => {
        return new Promise(function (resolve) {
            co(function* () {
                var calcEtag = () => {
                    if (!sha1String.length) {
                        return 'Fto5o-5ea0sNMlW_75VgGJCv2AcJ';
                    }
                    var sha1Buffer = Buffer.concat(sha1String, blockCount * 20);
                    // 如果大于4M，则对各个块的sha1结果再次sha1
                    if (blockCount > 1) {
                        prefix = 0x96;
                        sha1Buffer = sha1(sha1Buffer);
                    }
                    sha1Buffer = Buffer.concat(
                        [new Buffer([prefix]), sha1Buffer],
                        sha1Buffer.length + 1
                    );
                    return sha1Buffer.toString('base64')
                        .replace(/\//g, '_').replace(/\+/g, '-');

                };
                // 判断传入的参数是buffer还是stream还是filepath
                var mode = 'buffer';
                if (typeof buffer === 'string') {
                    buffer = require('fs').createReadStream(buffer);
                    mode = 'stream';
                } else if (buffer instanceof require('stream')) {
                    mode = 'stream';
                }
                // sha1算法
                var sha1 = function (content) {
                    var crypto = require('crypto');
                    var sha1 = crypto.createHash('sha1');
                    sha1.update(content);
                    return sha1.digest();
                };
                // 以4M为单位分割
                var blockSize = 4 * 1024 * 1024;
                var sha1String = [];
                var prefix = 0x16;
                var blockCount = 0;
                switch (mode) {
                    case 'buffer':
                        var bufferSize = buffer.length;
                        blockCount = Math.ceil(bufferSize / blockSize);

                        for (var i = 0; i < blockCount; i++) {
                            sha1String.push(sha1(buffer.slice(i * blockSize, (i + 1) * blockSize)));
                        }
                        process.nextTick(function () {
                            resolve(calcEtag());
                        });
                        break;
                    case 'stream':
                        var stream = buffer;
                        stream.on('readable', function () {
                            var chunk;
                            while (chunk = stream.read(blockSize)) {
                                sha1String.push(sha1(chunk));
                                blockCount++;
                            }
                        });
                        stream.on('end', function () {
                            resolve(calcEtag());
                        });
                        break;
                }
            });
        });
    },
    /**
     * 根据url查询qetag
     * @param url
     */
    queryQetag: (url) => {
        return new Promise(function (resolve, reject) {
            co(function* () {
                let request = url + '?hash/md5';
                resolve(yield http.get(request))
            });
        });
    }
};