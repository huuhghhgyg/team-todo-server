const crypto = require("crypto");
const { instrument } = require("@socket.io/admin-ui");
// 连接数据库
var mysql = require("mysql");
const { SocketAddress } = require("net");

// 创建数据库连接
var db_connection = mysql.createConnection({
  host: "192.168.1.160", // 数据库地址
  user: "todo_server",
  password: "qwertyuiop",
  database: "todo",
  multipleStatements: true, // 允许多语句
});
db_connection.connect();

const io = require("socket.io")(2560, {
  // cors: {
  //   origin: ["http://localhost:3000"],
  // },
  cors: true,
});

// 收到连接
io.on("connection", (socket) => {
  console.log(socket.id);
  // 查询组名
  // groupInfo:[isNew(true/false),groupHex(加密组名)]
  socket.on("queryGroup", (groupName, newGroup) => {
    console.log("QueryGroup " + groupName + " from " + socket.id);

    db_connection.query(
      "SELECT * FROM groups WHERE group_name = '" + groupName + "'",
      function (error, results) {
        if (error) throw error;
        // 返回值
        // console.log(results);

        // 如果判断值为空必须这么判断
        if (results.length === 0 || results[0].group_passwd == "") {
          newGroup(true); // 组名不存在或者组密码为空，重新注册
        } else {
          newGroup(false);
        }
      }
    );
  });

  // 注册或设置密码
  socket.on("enRoll", (groupName, passwd, code) => {
    //todo:验证组名是否已存在且密码为空的情况
    db_connection.query(
      // 检查组名是否存在
      "SELECT * FROM groups WHERE group_name = '" + groupName + "'",
      function (error, results) {
        if (error) {
          code("");
          throw error;
        }

        if (results.length === 0) {
          // 查询不到，组名不存在，注册
          // INSERT INTO groups VALUES (DEFAULT,'test2','123')
          db_connection.query(
            "INSERT INTO groups VALUES (DEFAULT,'" +
              groupName +
              "','" +
              passwd +
              "')",
            function (error, results) {
              if (error) {
                code("");
                throw error;
              }

              // 注册成功，返回code值
              // console.log(results)
              console.log("group " + groupName + " enrolled");
              code(hex_md5(groupName));
            }
          );
        } else if (results[0].group_passwd == "") {
          // 组存在且密码为空，更新密码
          db_connection.query(
            "UPDATE groups SET group_passwd='" +
              passwd +
              "' WHERE group_name='" +
              groupName +
              "'",
            function (error, results) {
              if (error) {
                success(false);
                socket.disconnect();
                throw error;
              }

              // 返回值
              console.log("group " + groupName + " enrolled");
              code(hex_md5(groupName));
            }
          );
        }
        //其他情况注册，不予反应。
      }
    );
  });

  // 登录
  socket.on("landOn", (groupName, passwd, success) => {
    db_connection.query(
      "SELECT group_passwd FROM groups WHERE group_name = '" + groupName + "'",
      function (error, results) {
        if (error) throw error;
        if (results[0].group_passwd == passwd) {
          // 登录验证成功
          success(hex_md5(groupName));
          console.log(groupName + " successfully logged in.");
        } else {
          // 登录验证失败
          success("");
          console.log(socket.id + " failed to log in (passwd:" + passwd + ")");
        }
      }
    );
  });

  // 查询任务列表
  socket.on("queryProjList", (groupName, groupHex, projList) => {
    if (checkGroupHex(groupName,groupHex)){
      // 查询groupId
      db_connection.query(
        "SELECT id FROM groups WHERE group_name = '" + groupName + "'",
        function (error, results) {
          if (error) throw error;
          // methods
          var groupId = results[0].id;

          // 查询projList
          db_connection.query(
            "SELECT * FROM projects WHERE group_id = '" + groupId + "'",
            function (error, results) {
              if (error) throw error;
              // methods
              projList(results);
              // console.log(results[0].proj_name);
            }
          );
        }
      );

    }
  });

  socket.on(
    "addProject",
    (groupName, code, projName, projDesc, mates, success) => {
      // 验证groupName
      console.log("groupname:" + groupName + " code:" + code);
      if (checkGroupHex(groupName, code)) {
        // 查询组id
        db_connection.query(
          "SELECT id FROM groups WHERE group_name = '" + groupName + "'",
          function (error, results) {
            if (error) throw error;

            var groupId = results[0].id;

            // 添加项目（允许重名）
            db_connection.query(
              "INSERT INTO projects VALUES (DEFAULT,'" +
                groupId +
                "','" +
                projName +
                "','" +
                projDesc +
                "', DEFAULT, DEFAULT); SELECT LAST_INSERT_ID() AS proj_id FROM projects;",
              function (error, results) {
                if (error) throw error;

                // console.log(results);
                if (!error) {
                  // 成功添加
                  console.log("successfully added project " + projName);
                } else {
                  // 添加失败
                  success(false);
                }

                // 获取项目id
                var projId = results[1][0].proj_id;

                // 添加组员
                mates.forEach((mate) => {
                  db_connection.query(
                    "INSERT INTO attendants VALUES (DEFAULT,'" +
                      projId +
                      "','" + mate + "')",
                    function (error, results) {
                      if (error) throw error;
                    }
                  );
                });

                console.log(mates + " added into projId " + projId);
                success(true);
              }
            );
          }
        );
      } else {
        // 验证失败
        success(false);
        socket.disconnect();

      }
    }
  );

  socket.on('queryMates',(groupName,groupHex,projId,mates)=>{
    // 验证组名
    if(checkGroupHex(groupName,groupHex)){
      // 查询projId对应的mate（组员）列表
      console.log('query mates of projId:'+projId);

      db_connection.query(
        "SELECT attendant_name FROM attendants WHERE proj_id = '" + projId + "'",
        function (error, results) {
          if (error) throw error;
          // methods
          mates(results);
          console.log(results);
        }
      );
  
    }else{
      socket.disconnect();
    }
  });
});

//groupName,code
function checkGroupHex(groupName, groupHex) {
  if (groupName!=null && groupHex!=null){
    if (groupName.toString().length>0 && groupHex.toString().length==32){
      return hex_md5(groupName) === groupHex ? true : false;
    }
    else{
      return false;
    }
  }
  else{
    return false;
  }
}

function hex_md5(content) {
  let md5 = crypto.createHash("md5"); // 创建 md5
  let md5Sum = md5.update(content); // update 加密
  let result = md5Sum.digest("hex");
  return result;
}

instrument(io, {
  auth: false,
});

// db_connection.query(
//   "SELECT group_passwd FROM groups WHERE group_name = '" + groupName + "'",
//   function (error, results) {
//     if (error) throw error;
//     // methods
//   }
// );