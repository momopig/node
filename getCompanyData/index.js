/**
 * @desc 根据list.txt文件的公司，获取这些公司的基本信息，并且保存在companies.json数据
 * 
*/
const request = require('request-promise');
const fs = require('fs');
const Q = require('q');
const options = {
    method: 'get',
    uri: 'http://beta.sz.haizhi.com/api/search',
    qs: {
        type: 'basic',
        name: '',
        only_count: 0
    },
    json: true,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'access_token=eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI5Q3ZwT1RTbldVbSIsImV4cCI6MTQ5MTQ4NzQ4OCwidWlkIjoxfQ.WRcu2BjaFw7p1PP6r_l4tFtpctZ0CqWfWgQLQVyCUVo'
    }
}

fs.readFile('list.txt', {flag: 'r+', encoding: 'utf8'}, function (err, data) {
    if(err) {
        console.error(err);
        return;
    }
    console.log(data);
    var resultArr = [];
    var companiesArr = data.split('\n'); 
    var allPromises = [];
    var noDataList = [];
    companiesArr.map(function (name, index) {
        options.qs.name = name;
        var redefer = Q.defer();
        allPromises.push(redefer.promise);
         request(options).then(function(data) {
            if(data.data){
                resultArr.push(data.data.gongshang_basic.data);
            }else{
                console.log('no data' + name);
                noDataList.push(name);
            }
            redefer.resolve();
        }).catch(function(error){
            console.log('error:' + error + ':' +name);
            redefer.reject();
        });
    });
    Q.all(allPromises).then(function() {
        console.log('finished');
        console.log(resultArr.length);
        console.log(allPromises.length);
        console.log('no data company:' + noDataList);
        fs.writeFile('./companies.json', JSON.stringify(resultArr), {flag: 'a'}, function (err) {
            if(err) {
                 console.error(err);
            }
        });
    });
});