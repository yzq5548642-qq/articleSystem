var mysql = require('mysql');
module.exports = function (sql,callback) {
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'yzq',
        password : '12345678',
        database : 'blog'
    });
    connection.connect();
    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        callback(results);
    });
    connection.end();
};