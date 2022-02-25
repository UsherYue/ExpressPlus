/**
 * ApiBareFramework
 *  Created by usher.yue.
 * User: usher.yue
 * Date: 17/3/23
 * Time: 16:37
 */

let assert = require('chai').assert;

const FILENAME = '../routes/filtertest.js';

async function analysisAnnotationFile(routerFile) {
    const fs = require('fs');
    const readline = require('readline');
    //create read  stream
    const fileStream = fs.createReadStream(routerFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    let codeLines = [];
    for await (let line of rl) {
        if (line.trim() != '' &&
            line.trimLeft().indexOf('/*') != 0 &&
            line.trimLeft().indexOf('*') != 0 &&
            line.trimLeft().indexOf('*/') != 0) {
            codeLines.push(line)
        }
    }
    let annotationGroup = [];
    let annotationMap = {};
    var beginIndex = 0;
    for (let line of codeLines) {
        line = line.trimLeft();
        //处理注解
        if (line.indexOf('//@') == 0) {
            var reg=/(Document|Filter)\((.+)\)/ig;
            let result=reg.exec(line);
            if(result){
                let annotation=`@${result[1]}:${result[2]}`;
                if (!annotationGroup[beginIndex]) {
                    annotationGroup[beginIndex] = [annotation];
                } else {
                    annotationGroup[beginIndex].push(annotation);
                }
            }
        }
        //处理路由
        var reg=/^(\w+)\.(get|post|delete|head)\(['"]([\/\w]+)['"]/i;
        if (annotationGroup[beginIndex] && line.indexOf('router.') == 0) {
            let ret= reg[Symbol.match](line);
            let router=`${ret[2].toUpperCase()}:${ret[3]}`;
            annotationMap[router]=annotationGroup[beginIndex];
            ++beginIndex;
        }
    }
    console.log(annotationMap);
    return annotationMap;
}


describe('注解路由', async function () {
    it('注解提取', async done => {
        analysisAnnotationFile(FILENAME);
        done();
    });
});