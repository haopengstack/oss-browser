const cp = require('child_process');
const path = require('path');
const fs = require('fs');

console.log(`run on: platform=${process.platform},arch=${process.arch}`);

try{
  var obj = require('./electron-crc64-prebuild');
  //var obj = require('./cpp-addon');
  console.log('loaded: crc64-cpp-addon');

}catch(e){
  console.warn(e)
  var obj = require('./pure-js');
  console.log('loaded: crc64-pure-js');
}


// obj.crc64FileProcess = function(p, fn){
//   var proc = cp.fork(path.join(__dirname, 'fork.js'), [p])
//   proc.on('message', function(data){
//      fn(data.error, data.data)
//   });
// }

obj.crc64FileProcess = function(p, fn){
  
  process.noAsar=true;
  fs.stat(p, function(err, data){
    process.noAsar=false;

    if(err)fn(err);
    else{
      //大小超过1MB，启动子进程校验CRC
      if(data.size > 1 * 1024 * 1024){
        
        var proc = cp.fork(path.join(__dirname, 'fork.js'), [p])
         
        proc.on('message', function(data){
           fn(data.error, data.data)
        });
      }else{
        process.noAsar=true;
        obj.crc64File(p,function(a,b,c){
          process.noAsar=false;
          fn(a,b,c)
        }); 
        
      }
    }
  });
}

module.exports = obj;
