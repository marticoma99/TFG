//http://127.0.0.1:9012/getInfo?id=1

var http = require('http');
var url = require('url');

var mysql = require('mysql');

var client = mysql.createConnection({ database: 'edCrumble', user: 'root', password: 'root', host: '127.0.0.1', multipleStatements: true });

var server = http.createServer(function (request, response) {

    var url_info = url.parse(request.url, true); //all the request info is here
    var pathname = url_info.pathname; //the address
    var params = url_info.query; //the parameters

    if (pathname == "/getInfo") {
        id = params.id;
        var DBresult = {}
        response.setHeader("Access-Control-Allow-Origin", "*");
        getInformation(params.id, DBresult, response);
    }
});

server.listen(9012, function () { });

client.query('USE edCrumble');

function getUserName(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SELECT userName FROM EdCrumbleJson WHERE id = ?", [id],
            function (err, results, fields) {
                if (err) throw err;
                DBresult.userName = results[0].userName;
                resolve();
            });
    });
}

function getDesignName(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SELECT JSON_VALUE((SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?),'$.designTitle') AS ResultValue", [id],
            function (err, results, fields) {
                if (err) throw err;
                DBresult.designName = results[0].ResultValue;
                resolve();
            });
    });
}

function getDescription(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?", [id],
            function (err, results, fields) {
                if (err) throw err;
                DBresult.description = JSON.parse(results[0].jsonFile).description;
                resolve();
            });
    })
}

function getExperience(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?", [id],
            function (err, results, fields) {
                if (err) throw err;
                DBresult.experience = JSON.parse(results[0].jsonFile).experience;
                resolve();
            });
    });
}

function getStudents(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SELECT JSON_VALUE((SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?), '$.students') AS ResultValue", [id],
            function (err, results, fields) {
                if (err) throw err;
                if (results[0].ResultValue == '') DBresult.students = -1;
                else DBresult.students = Number(results[0].ResultValue);
                resolve();
            });
    });
}

function getTopic(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SELECT JSON_VALUE((SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?), '$.topic') AS ResultValue", [id],
            function (err, results, fields) {
                if (err) throw err;
                if (results[0].ResultValue == '') DBresult.topic = -1;
                else DBresult.topic = Number(results[0].ResultValue);
                resolve();
            });
    });
}

function geteducationalLevel(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SELECT JSON_VALUE((SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?), '$.educationalLevel') AS ResultValue", [id],
            function (err, results, fields) {
                if (err) throw err;
                if (results[0].ResultValue == '') DBresult.educationalLevel = -1;
                else DBresult.educationalLevel = Number(results[0].ResultValue);
                resolve();
            });
    });
}

function getobjectiveList(id, DBresult) {
    return new Promise(function (resolve, fail) {
    client.query("SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?", [id],
            function (err, results, fields) {
                if (err) throw err;
                DBresult.objectiveList = (JSON.parse(results[0].jsonFile).objectivesList);
                resolve();
            });
    });
}

function getEvaluation(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?", [id],
            function (err, results, fields) {
                if (err) throw err;
                else DBresult.evaluation = JSON.parse(results[0].jsonFile).evaluation;
                resolve();
            });
    });
}

function getMostUsedResource(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SET @jsonFile = (SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?); SELECT * FROM (SELECT resourceType, COUNT(resourceType) as resourceNumber FROM JSON_TABLE(@jsonFile, '$.resourcesList' COLUMNS(NESTED PATH '$.*' COLUMNS(resourceType varchar(50) PATH '$.type'))) AS resources GROUP BY resourceType ORDER BY resourceNumber DESC) AS orderedResources LIMIT 1;", [id],
            function (err, results, fields) {
                if (err) throw err;
                if(!results[1][0]) return;
                if(results[1][0].resourceNumber < DBresult.numResourceMooc) DBresult.mostUsedResource = "MOOCs";
                else DBresult.mostUsedResource = results[1][0].resourceType;
                resolve();
            });
    });
}

function getNumResourceSocial(id, DBresult) {
    return new Promise(function (resolve, fail) {
        var resources = "resourceType = 'twitter' OR resourceType = 'facebook' OR resourceType = 'linkedin' OR resourceType = 'instagram' OR resourceType = 'snapchat' OR resourceType = 'pinterest' OR resourceType = 'googleplus' OR resourceType = 'othersocial'";
        client.query("SET @jsonFile = (SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?); SELECT COUNT(resourceType) as resourceNumber FROM JSON_TABLE(@jsonFile, '$.resourcesList' COLUMNS(NESTED PATH '$.*' COLUMNS(resourceType varchar(50) PATH '$.type'))) AS resources WHERE " + resources + " GROUP BY resourceType;", [id],
            function (err, results, fields) {
                if (err) throw err;
                if (results[1][0]) DBresult.numResourceSocial = results[1][0].resourceNumber;
                else DBresult.numResourceSocial = 0;
                resolve();
            });
    });
}

function getNumResourceFiles(id, DBresult) {
    return new Promise(function (resolve, fail) {
        var resources = "resourceType = 'file' OR resourceType = 'picture' OR resourceType = 'video' OR resourceType = 'ppt' OR resourceType = 'pdf' OR resourceType = 'audio' OR resourceType = 'spreadsheet' OR resourceType = 'code' OR resourceType = 'blank'";
        client.query("SET @jsonFile = (SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?); SELECT COUNT(resourceType) as resourceNumber FROM JSON_TABLE(@jsonFile, '$.resourcesList' COLUMNS(NESTED PATH '$.*' COLUMNS(resourceType varchar(50) PATH '$.type'))) AS resources WHERE " + resources + " GROUP BY resourceType;", [id],
            function (err, results, fields) {
                if (err) throw err;
                if (results[1][0]) DBresult.numResourceFiles = results[1][0].resourceNumber;
                else DBresult.numResourceFiles = 0;
                resolve();
            });
    });
}

function getNumResourceApps(id, DBresult) {
    return new Promise(function (resolve, fail) {
        var resources = "resourceType = 'edpuzzle' OR resourceType = 'pyramid' OR resourceType = 'socrative' OR resourceType = 'kahoot' OR resourceType = 'ldfeedback' OR resourceType = 'padlet' OR resourceType = 'googleforms' OR resourceType = 'googlemaps' OR resourceType = 'plickers' OR resourceType = 'eduloc' OR resourceType = 'quizlet' OR resourceType = 'symbaloo' OR resourceType = 'lessonPlan' OR resourceType = 'blankApp'";
        client.query("SET @jsonFile = (SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?); SELECT COUNT(resourceType) as resourceNumber FROM JSON_TABLE(@jsonFile, '$.resourcesList' COLUMNS(NESTED PATH '$.*' COLUMNS(resourceType varchar(50) PATH '$.type'))) AS resources WHERE " + resources + " GROUP BY resourceType;", [id],
            function (err, results, fields) {
                if (err) throw err;
                if (results[1][0]) DBresult.numResourceApps = results[1][0].resourceNumber;
                else DBresult.numResourceApps = 0;
                resolve();
            });
    });
}

function getNumResourcePhysical(id, DBresult) {
    return new Promise(function (resolve, fail) {
        var resources = "resourceType = 'book' OR resourceType = 'electronics' OR resourceType = 'laboratory' OR resourceType = 'medical' OR resourceType = 'mechanics' OR resourceType = 'crafts' OR resourceType = 'painting' OR resourceType = 'sports' OR resourceType = 'games' OR resourceType = 'nature' OR resourceType = 'cooking' OR resourceType = 'food' OR resourceType = 'audioEquipment' OR resourceType = 'videoEquipment' OR resourceType = 'physicalartifact'";
        client.query("SET @jsonFile = (SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?); SELECT COUNT(resourceType) as resourceNumber FROM JSON_TABLE(@jsonFile, '$.resourcesList' COLUMNS(NESTED PATH '$.*' COLUMNS(resourceType varchar(50) PATH '$.type'))) AS resources WHERE " + resources + " GROUP BY resourceType;", [id],
            function (err, results, fields) {
                if (err) throw err;
                if (results[1][0]) DBresult.numResourcePhysical = results[1][0].resourceNumber;
                else DBresult.numResourcePhysical = 0;
                resolve();
            });
    });
}

function getNumResourceComm(id, DBresult) {
    return new Promise(function (resolve, fail) {
        var resources = "resourceType = 'email' OR resourceType = 'forum' OR resourceType = 'slack' OR resourceType = 'whatsapp' OR resourceType = 'skype' OR resourceType = 'hangouts' OR resourceType = 'othercommunic'";
        client.query("SET @jsonFile = (SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?); SELECT COUNT(resourceType) as resourceNumber FROM JSON_TABLE(@jsonFile, '$.resourcesList' COLUMNS(NESTED PATH '$.*' COLUMNS(resourceType varchar(50) PATH '$.type'))) AS resources WHERE " + resources + " GROUP BY resourceType;", [id],
            function (err, results, fields) {
                if (err) throw err;
                if (results[1][0]) DBresult.numResourceComm = results[1][0].resourceNumber;
                else DBresult.numResourceComm = 0;
                resolve();
            });
    });
}

function getNumActivitiesInClass(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SET @jsonFile = (SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?); SELECT count(className) AS result FROM JSON_TABLE(@jsonFile, '$.itemsList[*]' COLUMNS(className varchar(50) PATH '$.className')) as activities WHERE className = 'in' GROUP BY className;", [id],
            function (err, results, fields) {
                if (err) throw err;
                if (results[1][0]) DBresult.numActivitiesInClass = results[1][0].result;
                else DBresult.numActivitiesInClass = 0;
                resolve();
            });
    });
}

function getNumActivitiesOutClass(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SET @jsonFile = (SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?); SELECT count(className) AS result FROM JSON_TABLE(@jsonFile, '$.itemsList[*]' COLUMNS(className varchar(50) PATH '$.className')) as activities WHERE className = 'out' GROUP BY className;", [id],
            function (err, results, fields) {
                if (err) throw err;
                if (results[1][0]) DBresult.numActivitiesOutClass = results[1][0].result;
                else DBresult.numActivitiesOutClass = 0;
                resolve();
            });
    });
}

function getActivities(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?", [id],
            function (err, results, fields) {
                if (err) throw err;
                if(!JSON.parse(results[0].jsonFile).itemsList) return;
                DBresult.activities = JSON.parse(results[0].jsonFile).itemsList.map(obj => {
                    return {
                        title: obj.title,
                        className: obj.className,
                        tasksNumber: obj.tasks.length,
                        duration: Math.floor((new Date(obj.end) - new Date(obj.start)) / 60000),
                        startDate: new Date(obj.start),
                        tasks: obj.tasks.map(t => { return { duration: Number(t.min), studentRol: t.student_role, teacherRol: t.teacher_role, graded: t.graded } })
                    }
                });
                DBresult.activities.sort(function(a,b){
                    return a.startDate - b.startDate;
                })
                resolve();
            });
    });
}

function getTotalTime(id, DBresult) {

    return new Promise(function (resolve, fail) {
        client.query("SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?", [id],
            function (err, results, fields) {
                if (err) throw err;
                DBresult.duration = Math.ceil((new Date(JSON.parse(results[0].jsonFile).endDate) - new Date(JSON.parse(results[0].jsonFile).startDate)) / 86400000);
                resolve();
            });
    });
}

function getNumResourceMooc(id, DBresult) {
    return new Promise(function (resolve, fail) {
        client.query("SELECT jsonFile FROM EdCrumbleJson WHERE EdCrumbleJson.id = ?", [id],
            function (err, results, fields) {
                if (err) throw err;
                var obj = (JSON.parse(results[0].jsonFile).moocsList);
                if(!obj) return;
                var numResources = Object.keys(obj).length
                DBresult.numResourceMooc = numResources;
                resolve();
            });
    });
}

function getNumResources(DBresult) {
    DBresult.numResources = DBresult.numResourceSocial + DBresult.numResourceFiles + DBresult.numResourceApps + DBresult.numResourcePhysical + DBresult.numResourceComm + DBresult.numResourceMooc;
}

function getnumObjectives(DBresult) {
    DBresult.numObjectives = DBresult.objectiveList.length;
}

function getNumActivities(DBresult) {
    DBresult.numActivities = DBresult.activities.length;
}

function getInformation(id, DBresult, response) {
    Promise.all([getUserName(id, DBresult), getTotalTime(id, DBresult), getActivities(id, DBresult), getNumActivitiesOutClass(id, DBresult),
    getNumActivitiesInClass(id, DBresult), getNumResourceComm(id, DBresult), getNumResourcePhysical(id, DBresult), getNumResourceMooc(id, DBresult),
    getNumResourceApps(id, DBresult), getNumResourceFiles(id, DBresult), getNumResourceSocial(id, DBresult), getMostUsedResource(id, DBresult),
    getEvaluation(id, DBresult), getobjectiveList(id, DBresult), geteducationalLevel(id, DBresult), getTopic(id, DBresult), getStudents(id, DBresult),
    getExperience(id, DBresult), getDescription(id, DBresult), getDesignName(id, DBresult)]).then(function () { getNumResources(DBresult) })
        .then(function () { getnumObjectives(DBresult) }).then(function () { getNumActivities(DBresult) })
        .then(function () { response.end(JSON.stringify(DBresult)) });;
}