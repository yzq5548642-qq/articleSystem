module.exports = function (type) {
  var dateData = new Date();
  var year = dateData.getFullYear();
  var month = dateData.getMonth() + 1;
  var date = dateData.getDate();
  var hours = dateData.getHours();
  var minutes = dateData.getMinutes();
  var seconds = dateData.getSeconds();

  //想要第一种就传个date
  if (type == 'date'){
      return year + "-" + month + "-" + date;
  } else {
      return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
  }
};