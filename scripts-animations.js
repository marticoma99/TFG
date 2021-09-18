//https://ilde2.upf.edu/edcrumble/pg/lds/viewedcrumble/848/
//https://gestioacademica.upf.edu/doa/consultaPublica/look[conpub]MostrarPubGuiaDocAs?entradaPublica=true&idiomaPais=en.GB&_anoAcademico=2020&_codAsignatura=31645

var id = 1;
var animationType = 0; // 1 for own design, 0 for showing others the design
var language = 'en'; //lenguage to show the animation, possible lenguages: en, es, ca

var playButton = document.querySelector(".playButton");
var muteButton = document.querySelector(".muteButton");
var isMuted = false;
var audioBG = new Audio("./audio0.mp3");
audioBG.loop = true;
var passtVolume = 1; //audio volume for the fade-down function
var isAnimationFinished = false;

//to concatenate the animations
var timePassed = 0;
var previousColor = "ffffff"

//For the objectives
var numObjectives = 0;
var offset = 0;
var numScreensObjectives = 0
var numObjectivesPerScreen = 4;

//for the timeline
var numActivities = 0;
var offsetTimeline = 0;
var numScreens = 0;
var numActivitiesPerScreen = 10;

var maxResources = 0; //the number of resources for the most used

var totalTimeActivities = 0;
var totalTimeTasks = 0;

var info = {}; //the data from the server

let tl = anime.timeline({
    autoplay: true
});

playButton.addEventListener("click", function () {
    if (animationType == 1) audioBG = new Audio("./audio1.mp3");
    audioBG.loop = true;
    audioBG.play();
    playButton.style.display = "none";
    fetch("http://127.0.0.1:9012/getInfo?id=" + id).then((response) => response.json()).then((responseJSON) => { info = responseJSON }).then(setProperties).then(initAnimations);
});

muteButton.addEventListener("click", function () {
    if (!isMuted) {
        muteButton.style.color = "red";
        isMuted = true;
        audioBG.volume = 0;
        document.querySelector(".muteIcon").classList.remove("fa-volume-up");
        document.querySelector(".muteIcon").classList.add("fa-volume-off");
    }
    else {
        if (isAnimationFinished) return;
        muteButton.style.color = "#e27826";
        isMuted = false;
        audioBG.volume = 1;
        document.querySelector(".muteIcon").classList.remove("fa-volume-off");
        document.querySelector(".muteIcon").classList.add("fa-volume-up");
    }
});

function translation() {
    if (language == "en") return;

    var languageTranslation = {};
    if (language == "ca") languageTranslation = ca;
    if (language == "es") languageTranslation = es;

    var elements = document.querySelectorAll("[tr-text]");
    for (var i = 0; i < elements.length; i++) {
        elements[i].innerHTML = languageTranslation[elements[i].getAttribute("tr-text")];
    }
}


function translateTimeline() {
    if (language == "en") return;

    var languageTranslation = {};
    if (language == "ca") languageTranslation = ca;
    if (language == "es") languageTranslation = es;

    var elements = document.querySelectorAll("[tr-timeline]");

    for (var i = 0; i < elements.length; i++) {
        elements[i].innerHTML = languageTranslation[elements[i].getAttribute("tr-timeline")];
    }
}

function fadeDown() {
    if (isMuted) {
        isAnimationFinished = true;
        return;
    }
    if (passtVolume > 0.01) {
        passtVolume -= 0.01;
        audioBG.volume = passtVolume;
        console.log(passtVolume);
        setTimeout(function () { fadeDown() }, 30);
    }
    else {
        audioBG.pause();
        isAnimationFinished = true;
    }
}

function stopAudio() {
    setTimeout(function () {
        fadeDown();
    }, timePassed - 3000);
}

function initAnimations() {
    
    if (info.designName && info.designName != "") addTitle();
    if (info.description && info.description != "" && animationType == 0) addDescription();
    if (info.students && info.topic && info.educationalLevel && info.duration &&
        info.students != "" && info.topic != "" && info.educationalLevel != "" && info.duration != "") addGeneralInfo();
    if (numObjectives > 0) addObjectives();
    if (info.evaluation && info.evaluation != "") addEvaluation();
    if (info.numResources && info.numResources > 0) addResources();
    if (numActivities > 0) addTimeline();
    if (info.experience && info.experience != "" && animationType == 0) addExperience();
    if (totalTimeActivities > 0 && totalTimeTasks > 0) addStatistics();

    stopAudio();
}

function setProperties() {
    document.querySelector(".h1-title").innerHTML = info.designName;
    document.querySelector(".h2-title").innerHTML = "by " + info.userName;
    if (info.designName) document.querySelector(".h1-title").style.fontSize = (20 - (info.designName.length * 0.3)) + "vh";
    if(info.description && info.description.length > (450 * window.innerWidth / window.innerHeight)) info.description = info.description.slice(0,(450 * window.innerWidth / window.innerHeight)) + "...";
    document.querySelector(".h2-description").innerHTML = info.description;
    if (info.description) document.querySelector(".h2-description").style.top = (47 - (info.description.length * 0.035) + window.innerWidth / window.innerHeight * 3.4) + "vh";
    if (info.description) document.querySelector(".h1-description").style.top = (15 - (info.description.length * 0.035) + window.innerWidth / window.innerHeight * 3.4) + "vh";
    document.querySelector("#general3 highlight").innerHTML = getTopic(info.topic)[0];
    document.querySelector("#general4 highlight").innerHTML = getLevel(info.educationalLevel)[0];
    document.querySelector("#general3 highlight").setAttribute("tr-text", getTopic(info.topic)[1]);
    document.querySelector("#general4 highlight").setAttribute("tr-text", getLevel(info.educationalLevel)[1]);
    if(info.evaluation && info.evaluation.length > (160 * window.innerWidth / window.innerHeight)) info.evaluation = info.evaluation.slice(0,(160 * window.innerWidth / window.innerHeight)) + "...";
    document.querySelector(".p-evaluation").innerHTML = info.evaluation;
    document.querySelector(".h2-resources highlight").innerHTML = info.mostUsedResource;
    if(info.evaluation && info.experience.length > (255 * window.innerWidth / window.innerHeight)) info.experience = info.experience.slice(0,(255 * window.innerWidth / window.innerHeight)) + "...";
    document.querySelector(".p-experience").innerHTML = info.experience;

    numObjectives = info.numObjectives;

    maxResources = Math.max(info.numResourceComm, info.numResourcePhysical, info.numResourceApps, info.numResourceFiles, info.numResourceSocial, info.numResourceMooc);
    numScreensObjectives = Math.ceil(numObjectives / numObjectivesPerScreen);

    numActivities = info.numActivities;
    numScreens = Math.ceil(numActivities / numActivitiesPerScreen);

    totalTimeActivities = info.activities.reduce(function (a, b, i, ar) { return { duration: a.duration + b.duration } }).duration;
    totalTimeTasks = totalTasksDuration();

    translation();
}

function getTopic(topicNumber) {
    switch (topicNumber) {
        case 1: return ["General programmes", "general-topic"]
        case 2: return ["Education", "education-topic"]
        case 3: return ["Humanities and arts", "humanities-topic"]
        case 4: return ["Social sciences, business and law", "social-topic"]
        case 5: return ["Science", "science-topic"]
        case 6: return ["Engineering, manufacturing and construction", "engineering-topic"]
        case 7: return ["Agriculture", "agriculture-topic"]
        case 8: return ["Health and welfare", "health-topic"]
        case 9: return ["Services", "services-topic"]
        default: return ["No Specified", "noSpecified-topic"]
    }
}

function getLevel(levelNumber) {
    switch (levelNumber) {
        case 1: return ["Early childhood Education", "early-level"]
        case 2: return ["Primary education", "primary-level"]
        case 3: return ["Lower secondary education", "lower-level"]
        case 4: return ["Upper secondary education", "upper-level"]
        case 5: return ["Post-secondary non-tertiary education", "post-level"]
        case 6: return ["Short-cycle tertiary education", "short-level"]
        case 7: return ["Bachelor or equivalent", "bachelor-level"]
        case 8: return ["Master or equivalent", "master-level"]
        case 9: return ["Doctoral or equivalent", "doctoral-level"]
        default: return ["No Specified", "noSpecified-level"]
    }
}

function getResourcesWidth(resourceNumber) {
    if (resourceNumber == 0) return '12vh';
    if (resourceNumber == maxResources) return '55vh';
    return (resourceNumber * 43 / maxResources + 12).toString() + "vh";
}

function totalTasksDuration() {
    var tasksTime = 0;
    for (var i = 0; i < info.activities.length; i++) {
        for (var j = 0; j < info.activities[i].tasks.length; j++) {
            if (info.activities[i].tasks[j].duration) tasksTime += info.activities[i].tasks[j].duration;
        }
    }
    return tasksTime;
}

function addTitle() {
    tl.add({
        targets: "body",
        backgroundColor: "#e4ecf5"
    }).add({
        targets: '#columns-title div',
        width: '80%',
        opacity: '15%',
        delay: anime.stagger(100),
        begin: function () {
            document.querySelector('#section-title').style.display = 'initial';
        }
    }, timePassed).add({
        targets: '.h1-title',
        translateY: [-100, 0],
        duration: 1250,
        opacity: 100,
        easing: 'easeOutElastic(2, .3)',
    }, (timePassed + 250)).add({
        targets: '.h2-title',
        translateY: [500, 0],
        opacity: 100,
        easing: 'easeInOutExpo',
        duration: 2000
    }, (timePassed + 0)).add({
        targets: '.h1-title',
        translateX: [0, 500],
        duration: 750,
        opacity: 0,
        easing: 'easeInElastic(1, .8)'
    }, (timePassed + 4900)).add({
        targets: '.h2-title',
        translateX: [0, -500],
        duration: 750,
        opacity: 0,
        easing: 'easeInElastic(1, .8)'
    }, (timePassed + 4900)).add({
        targets: '#columns-title div',
        width: '100%',
        direction: 'reverse',
        easing: 'easeInOutExpo',
        opacity: 0,

    }, (timePassed + 5000)).add({
        targets: '#section-title',
        display: "none",
        begin: function () {
            document.querySelector('#section-title').style.display = 'none';
        }
    }, (timePassed + 6000));

    timePassed += 6000;
    previousColor = "#e4ecf5";
}

function addDescription() {

    var h1Description = document.querySelector('.h1-description');
    var durationWithLength = document.querySelector(".h2-description").innerHTML.length * 30;
    h1Description.innerHTML = h1Description.textContent.replace(/\S/g, "<span class='h1-letter-animation'>$&</span>");

    tl.add({
        targets: 'body',
        backgroundColor: [previousColor, "#112255"],
        duration: 5000
    }, timePassed - 350).add({
        targets: '#columns-description div',
        width: '80%',
        opacity: '8%',
        direction: 'reverse',
        easing: 'easeInOutExpo',

        begin: function () {
            document.querySelector('#section-description').style.display = 'initial';
        }
    }, timePassed + 1000).add({
        targets: '.h1-letter-animation',
        opacity: "100%",
        rotateY: [-90, 0],
        duration: 500,
        delay: (el, i) => 45 * i,

    }, (timePassed + 1350)).add({
        targets: '.h2-description',
        opacity: 100,
        translateY: [40, 0],
        duration: 2000,
    }, (timePassed + 1750)).add({
        targets: '.h1-letter-animation',
        opacity: 0,
        easing: "easeOutExpo",
        translateY: [0, -500],
        duration: 2000,
    }, (timePassed + 9000 + durationWithLength)).add({
        targets: '.h2-description',
        translateY: [0, 1000],
        opacity: 0,
        duration: 2000,
    }, (timePassed + 9000 + durationWithLength)).add({
        targets: '#columns-description div',
        width: '0%',
        opacity: 0,
        duration: 2000,
    }, (timePassed + 9000 + durationWithLength)).add({
        targets: '#section-description',
        display: "none",
        begin: function () {
            document.querySelector('#section-description').style.display = 'none';
        }
    }, (timePassed + 10000 + durationWithLength));

    timePassed += 10000 + durationWithLength;
    previousColor = "#112255";
}

function addGeneralInfo() {
    let tl = anime.timeline({
        autoplay: true
    });

    tl.add({
        targets: 'body',
        backgroundColor: [previousColor, "#e4ecf5"],
        duration: 8000,
    }, timePassed - 1000).add({
        targets: ".h1-general",
        opacity: 100,
        duration: 2000,
        translateY: [-250, 0],

        begin: function () {
            document.querySelector('#section-generalInfo').style.display = 'initial';
        }
    }, timePassed).add({
        targets: ".img-general",
        opacity: 100,
        duration: 500,
        easing: 'easeInOutExpo',
        rotateY: [-90, 0],
        delay: anime.stagger(500),
    }, (timePassed + 1000)).add({
        targets: ".containerInfo-general",
        translateX: [250, 0],
        delay: anime.stagger(500),
        duration: 1000,
        opacity: 100
    }, (timePassed + 1000)).add({
        targets: "#general1 highlight",
        innerHTML: [0, info.students],
        round: 1,
        duration: 2000,
    }, (timePassed + 1100)).add({
        targets: "#general2 highlight",
        innerHTML: [0 + " days", info.duration],
        round: 1,
        duration: 2000,
    }, (timePassed + 1600)).add({
        targets: ".containerInfo-general",
        translateY: [0, 500],
        delay: anime.stagger(300, { from: 'last' }),
        duration: 3000,
        opacity: 0,
    }, (timePassed + 8000)).add({
        targets: ".img-general",
        opacity: 0,
        duration: 200,
        easing: 'easeInOutExpo',
        rotateY: [0, -90],
        delay: anime.stagger(300, { from: 'last' }),
    }, (timePassed + 7850)).add({
        targets: ".h1-general",
        opacity: 0,
        duration: 4500,
        translateY: [0, 1000],
    }, (timePassed + 9200)).add({
        targets: '#section-generalInfo',
        display: "none",
        begin: function () {
            document.querySelector('#section-generalInfo').style.display = 'none';
        }
    }, (timePassed + 10000));

    timePassed += 10000;
    previousColor = "#e4ecf5";
}

function createObjectives() {
    for (var j = 0; j < numScreensObjectives; j++) {
        setTimeout(setObjectives, 8000 * j + 1500 + timePassed);
        setTimeout(exitObjectives, 8000 * (j + 1) - 100 + 1500 + timePassed);
    }

    function setObjectives() {
        var sectionObjectives = document.querySelector("#objectivesContainer");
        sectionObjectives.classList.remove('animate__animated', 'animate__fadeOutDownBig');
        sectionObjectives.innerHTML = '';
        for (var i = 0; i < (numObjectives - numObjectivesPerScreen * offset) && (i < numObjectivesPerScreen); i++) {
            var objectiveElement = document.createElement('h3');
            objectiveElement.className = "h3-objectives";
            objectiveElement.appendChild(document.createTextNode(+ (i + 1 + offset * numObjectivesPerScreen) + ". "));
            var objectiveText = document.createElement('h3Text');
            objectiveText.appendChild(document.createTextNode(info.objectiveList[(i + offset * numObjectivesPerScreen)]));
            objectiveElement.appendChild(objectiveText);
            sectionObjectives.appendChild(objectiveElement);
        }
        offset++;
    }

    function exitObjectives() {
        var sectionObjectives = document.querySelector("#objectivesContainer");
        sectionObjectives.classList.add('animate__animated', 'animate__fadeOutDownBig');
    }
}

function addObjectives() {
    createObjectives();

    tl.add({
        targets: 'body',
        backgroundColor: [previousColor, "#112255"],
        duration: 3500
    }, (timePassed - 500)).add({
        targets: '#section-objectives .inlineContainer',
        translateY: [-250, 0],
        opacity: 100,
        easing: 'easeInOutExpo',
        duration: 1000,
        begin: function () {
            document.querySelector('#section-objectives').style.display = 'initial';
        }
    }, timePassed).add({
        targets: ".h2-objectives highlight",
        innerHTML: [0, numObjectives],
        round: 1,
        easing: 'linear',
        duration: 1500,
    }, (timePassed + 250)).add({
        targets: '#section-objectives .inlineContainer',
        translateY: [0, 1000],
        opacity: 0,
        easing: 'easeInOutExpo',
        duration: 1000
    }, ((numScreensObjectives * 8000 + 1500) + timePassed)).add({
        targets: '#section-objectives',
        display: "none",
        begin: function () {
            document.querySelector('#section-objectives').style.display = 'none';
        }
    }, ((numScreensObjectives * 8000 + 1500) + timePassed + 1000));

    timePassed += ((numScreensObjectives * 8000 + 1500) + 1000);
    previousColor = "#112255";
}

function addEvaluation() {
    var durationWithLength = document.querySelector(".p-evaluation").innerHTML.length * 20;

    tl.add({
        targets: 'body',
        backgroundColor: [previousColor, "#112255"],
        duration: 3500
    }, (timePassed - 500)).add({
        targets: "#dotEvaluation",
        opacity: "5%",
        delay: anime.stagger(50),
        begin: function () {
            document.querySelector('#section-evaluation').style.display = 'initial';
        }
    }, timePassed).add({
        targets: ".h1-evaluation",
        translateX: [-2000, 0],
        opacity: 100,
        duration: 2000,
        easing: 'easeInOutExpo',
    }, timePassed).add({
        targets: ".img-evaluation",
        rotateY: [-90, 0],
        duration: 2000,
        opacity: 100,
    }, (timePassed + 2000)).add({
        targets: ".p-evaluation",
        translateX: [2000, 0],
        opacity: 100,
        duration: 2000,
        easing: 'easeInOutExpo',
    }, (timePassed + 1200)).add({
        targets: ".img-evaluation",
        rotateY: [0, 90],
        duration: 500,
        opacity: 0,
        easing: 'easeInOutExpo',
    }, (timePassed + 10000 + durationWithLength)).add({
        targets: ".p-evaluation",
        translateX: [0, -2000],
        opacity: 0,
        duration: 5000,
    }, (timePassed + 10500 + durationWithLength)).add({
        targets: ".h1-evaluation",
        translateY: [0, 5000],
        opacity: 100,
        duration: 2000,
        easing: 'easeInOutExpo',
    }, (timePassed + 11000 + durationWithLength)).add({
        targets: "#dotEvaluation",
        opacity: 0,
        delay: anime.stagger(30),
        duration: 2000
    }, (timePassed + 11000 + durationWithLength)).add({
        targets: '#section-evaluation',
        display: "none",
        begin: function () {
            document.querySelector('#section-evaluation').style.display = 'none';
        }
    }, (timePassed + 12000 + durationWithLength));

    timePassed += 12000 + durationWithLength;
    previousColor = "#112255";
}

function addResources() {
    tl.add({
        targets: 'body',
        backgroundColor: [previousColor, "#ffc099"],
        duration: 2500,
        easing: 'easeInOutExpo',
    }, (timePassed - 750)).add({
        targets: "#resources-title",
        opacity: 100,
        translateY: [-200, 0],
        duration: 2000,
        easing: 'easeInOutExpo',
        begin: function () {
            document.querySelector('#section-resourcesBig').style.display = 'initial';
        }
    }, timePassed).add({
        targets: ".h1-resources #highlight",
        innerHTML: ["0", info.numResources],
        round: 1,
        duration: 2000,
        easing: 'linear',
    }, (timePassed + 1000)).add({
        targets: '#subtitle-resources',
        translateX: [2000, 0],
        duration: 1500,
        opacity: 100,
        easing: 'easeInOutExpo',
    }, (timePassed + 2500)).add({
        targets: '.h3-resources',
        translateX: [-500, 0],
        duration: 1500,
        opacity: 100,
        easing: 'easeInOutExpo',
    }, (timePassed + 5000)).add({
        targets: '.section-1-resources #column1',
        height: getResourcesWidth(info.numResourceFiles),
        duration: 1500,
        opacity: 100
    }, (timePassed + 6000)).add({
        targets: '.section-1-resources #column2',
        height: getResourcesWidth(info.numResourceApps),
        duration: 1500,
        opacity: 100
    }, (timePassed + 6500)).add({
        targets: '.section-1-resources #column3',
        height: getResourcesWidth(info.numResourcePhysical),
        duration: 1500,
        opacity: 100
    }, (timePassed + 7000)).add({
        targets: '.section-1-resources #column4',
        height: getResourcesWidth(info.numResourceComm),
        duration: 1500,
        opacity: 100,
    }, (timePassed + 7500)).add({
        targets: '.section-1-resources #column5',
        height: getResourcesWidth(info.numResourceSocial),
        duration: 1500,
        opacity: 100
    }, (timePassed + 8000)).add({
        targets: '.section-1-resources #column6',
        height: getResourcesWidth(info.numResourceMooc),
        duration: 1500,
        opacity: 100
    }, (timePassed + 8500)).add({
        targets: '.section-1-resources #column1',
        innerHTML: [0, info.numResourceFiles],
        round: 1,
        easing: 'linear',
    }, (timePassed + 6000)).add({
        targets: '.section-1-resources #column2',
        innerHTML: [0, info.numResourceApps],
        round: 1,
        easing: 'linear',
    }, (timePassed + 6500)).add({
        targets: '.section-1-resources #column3',
        innerHTML: [0, info.numResourcePhysical],
        round: 1,
        easing: 'linear',
    }, (timePassed + 7000)).add({
        targets: '.section-1-resources #column4',
        innerHTML: [0, info.numResourceComm],
        round: 1,
        easing: 'linear',
    }, (timePassed + 7500)).add({
        targets: '.section-1-resources #column5',
        innerHTML: [0, info.numResourceSocial],
        round: 1,
        easing: 'linear',
    }, (timePassed + 8000)).add({
        targets: '.section-1-resources #column6',
        innerHTML: [0, info.numResourceMooc],
        round: 1,
        easing: 'linear',
    }, (timePassed + 8500)).add({
        targets: ".section-2-resources #name1",
        opacity: 100,
        translateY: [100, 0],
        easing: 'easeInOutExpo',
    }, (timePassed + 5000)).add({
        targets: ".section-2-resources #name2",
        opacity: 100,
        translateY: [100, 0],
        easing: 'easeInOutExpo',
    }, (timePassed + 5500)).add({
        targets: ".section-2-resources #name3",
        opacity: 100,
        translateY: [100, 0],
        easing: 'easeInOutExpo',
    }, (timePassed + 6000)).add({
        targets: ".section-2-resources #name4",
        opacity: 100,
        translateY: [100, 0],
        easing: 'easeInOutExpo',
    }, (timePassed + 6500)).add({
        targets: ".section-2-resources #name5",
        opacity: 100,
        translateY: [100, 0],
        easing: 'easeInOutExpo',
    }, (timePassed + 7000)).add({
        targets: ".section-2-resources #name6",
        opacity: 100,
        translateY: [100, 0],
        easing: 'easeInOutExpo',
    }, (timePassed + 7500)).add({
        targets: "#resources-title",
        opacity: 0,
        translateX: [0, 2000],
        duration: 1000,
        easing: 'easeInOutExpo',
    }, (timePassed + 13000)).add({
        targets: "#subtitle-resources",
        opacity: 0,
        translateX: [0, -2000],
        duration: 1000,
        easing: 'easeInOutExpo',
    }, (timePassed + 13200)).add({
        targets: ".h3-resources",
        opacity: 0,
        translateY: [0, 1000],
        duration: 1000,
        easing: 'easeInOutExpo',
    }, (timePassed + 13300)).add({
        targets: ".section-2-resources #name1",
        opacity: 0,
        translateY: [0, 100],
        easing: 'easeInOutExpo',
        duration: 250,
    }, (timePassed + 13500)).add({
        targets: ".section-2-resources #name2",
        opacity: 0,
        translateY: [0, 100],
        easing: 'easeInOutExpo',
        duration: 250,
    }, (timePassed + 13600)).add({
        targets: ".section-2-resources #name3",
        opacity: 0,
        translateY: [0, 100],
        easing: 'easeInOutExpo',
        duration: 250,
    }, (timePassed + 13700)).add({
        targets: ".section-2-resources #name4",
        opacity: 0,
        translateY: [0, 100],
        easing: 'easeInOutExpo',
        duration: 250,
    }, (timePassed + 13800)).add({
        targets: ".section-2-resources #name5",
        opacity: 0,
        translateY: [0, 100],
        easing: 'easeInOutExpo',
        duration: 250,
    }, (timePassed + 13900)).add({
        targets: ".section-2-resources #name6",
        opacity: 0,
        translateY: [0, 100],
        easing: 'easeInOutExpo',
        duration: 250,
    }, (timePassed + 14000)).add({
        targets: '.section-1-resources #column1',
        height: "12vh",
        duration: 500,
        opacity: 0,
        easing: 'easeInOutExpo',
        innerHTML: 0,
        round: 1,
    }, (timePassed + 13600)).add({
        targets: '.section-1-resources #column2',
        height: "12vh",
        duration: 500,
        opacity: 0,
        easing: 'easeInOutExpo',
        innerHTML: 0,
        round: 1,
    }, (timePassed + 13700)).add({
        targets: '.section-1-resources #column3',
        height: "12vh",
        duration: 500,
        opacity: 0,
        easing: 'easeInOutExpo',
        innerHTML: 0,
        round: 1,
    }, (timePassed + 13800)).add({
        targets: '.section-1-resources #column4',
        height: "12vh",
        duration: 500,
        opacity: 0,
        easing: 'easeInOutExpo',
        innerHTML: 0,
        round: 1,
    }, (timePassed + 13900)).add({
        targets: '.section-1-resources #column5',
        height: "12vh",
        duration: 500,
        opacity: 0,
        easing: 'easeInOutExpo',
        innerHTML: 0,
        round: 1,
    }, (timePassed + 14000)).add({
        targets: '.section-1-resources #column6',
        height: "12vh",
        duration: 500,
        opacity: 0,
        easing: 'easeInOutExpo',
        innerHTML: 0,
        round: 1,
    }, (timePassed + 14100)).add({
        targets: '#section-resourcesBig',
        display: "none",
        begin: function () {
            document.querySelector('#section-resourcesBig').style.display = 'none';
        }
    }, (timePassed + 14500));

    timePassed += 14500;
    previousColor = "#ffc099";
}

function createTimeline() {

    var previousTime = 0;

    for (var j = 0; j < numScreens; j++) {

        var numActivitiesScreen = numActivitiesPerScreen;
        if ((j + 1) == numScreens) numActivitiesScreen = numActivities - numActivitiesPerScreen * j;

        var durationTimeLine = previousTime + 3500 + timePassed
        previousTime += 1800 * numActivitiesScreen + 5000;
        var endTimeLine = previousTime - 2000 + 3500 + timePassed;

        setTimeout(createTimeline1, durationTimeLine);
        setTimeout(exitTimeline, endTimeLine);
    }
}

function createTimeline1() {
    var sectionTimeLine = document.querySelector("#timelineSection1");
    sectionTimeLine.innerHTML = '';
    var ol = document.createElement('ol');
    ol.classList.add('animate__animated', 'animate__fadeInRightBig');

    for (var i = 0; (i < numActivities - numActivitiesPerScreen * offsetTimeline) && (i < numActivitiesPerScreen); i++) {
        var li = document.createElement('li');
        var div = document.createElement('div');

        var title = document.createElement('p');
        title.className = "timelineTitle"

        var maxWidth = window.innerWidth / window.innerHeight * 7.5;
        var titleText = info.activities[(i + offsetTimeline * numActivitiesPerScreen)].title;

        if (titleText.length > maxWidth) {

            var firstText = titleText.slice(0, maxWidth) + "-";
            title.appendChild(document.createTextNode(firstText));
            div.appendChild(title);

            var title2 = document.createElement('p');
            title2.className = "timelineTitle"
            var secondText = titleText.slice(maxWidth, maxWidth * 2);
            if (titleText.length > maxWidth * 2) {
                var thirdText = titleText.slice(maxWidth * 2, maxWidth * 3 - 2);
                var title3 = document.createElement('p');
                title3.className = "timelineTitle"

                title2.appendChild(document.createTextNode(secondText + "-"));
                div.appendChild(title2);

                if (titleText.length > maxWidth * 3) thirdText += "..."
                title3.appendChild(document.createTextNode(thirdText));
                div.appendChild(title3)
            }
            else {
                title2.appendChild(document.createTextNode(secondText));
                div.appendChild(title2);
            }
        }
        else {
            title.appendChild(document.createTextNode(titleText));
            div.appendChild(title);
        }

        if (!(info.activities[(i + offsetTimeline * numActivitiesPerScreen)].className == "in")) {
            div.classList.add("blue");
            div.style.background = "#a8e0e3";
        }

        var totalTasks = document.createElement('generalText');
        totalTasks.style.display = "inline";
        totalTasks.appendChild(document.createTextNode("With "));
        totalTasks.setAttribute("tr-timeline", "generalTextWith-timeline");

        var totalTasksHighlight = document.createElement('generalTexthighlight');
        var totalTasks1 = document.createElement('generalText');
        totalTasks1.style.display = "inline";
        totalTasksHighlight.appendChild(document.createTextNode(info.activities[(i + offsetTimeline * numActivitiesPerScreen)].tasksNumber));
        totalTasks1.appendChild(totalTasksHighlight);

        var totalTasks2 = document.createElement('generalText');
        totalTasks2.style.display = "inline";
        totalTasks2.appendChild(document.createTextNode(" tasks"));
        totalTasks2.setAttribute("tr-timeline", "generalTextTasks-timeline");

        div.appendChild(totalTasks);
        div.appendChild(totalTasks1);
        div.appendChild(totalTasks2);

        var durationCourse = document.createElement('generalTextBigger');
        var durationActivity = document.createElement('duration');
        durationActivity.appendChild(document.createTextNode(info.activities[(i + offsetTimeline * numActivitiesPerScreen)].duration + " min"));
        durationCourse.appendChild(durationActivity);
        div.appendChild(durationCourse)

        if (titleText.length <= maxWidth)
            div.appendChild(document.createElement('br'));
        else if (titleText.length <= maxWidth * 2) {
            var brShort = (document.createElement('br'));
            brShort.classList.add("short")
            div.appendChild(brShort);
        }

        li.appendChild(div);
        ol.appendChild(li);
    }
    var li1 = document.createElement('li');
    var li2 = document.createElement('li');
    var li3 = document.createElement('li');
    var li4 = document.createElement('li');
    ol.appendChild(li1);
    ol.appendChild(li2);
    ol.appendChild(li3);
    ol.appendChild(li4);
    var li1 = document.createElement('li');
    var li2 = document.createElement('li');
    var li3 = document.createElement('li');
    var li4 = document.createElement('li');
    ol.appendChild(li1);
    ol.appendChild(li2);
    ol.appendChild(li3);
    ol.appendChild(li4);
    var li1 = document.createElement('li');
    var li2 = document.createElement('li');
    var li3 = document.createElement('li');
    var li4 = document.createElement('li');
    ol.appendChild(li1);
    ol.appendChild(li2);
    ol.appendChild(li3);
    ol.appendChild(li4);
    sectionTimeLine.appendChild(ol);

    offsetTimeline++;
    translateTimeline();
}

function exitTimeline() {
    sectionOl = document.querySelector(".timeline ol");
    sectionOl.classList.remove('animate__animated', 'animate__fadeInRightBig');
    sectionOl.classList.add('animate__animated', 'animate__fadeOutLeftBig');
}

function addTimeline() {
    createTimeline()

    tl.add({
        targets: 'body',
        backgroundColor: [previousColor, "#e4ecf5"],
        duration: 5000,
        easing: 'easeInOutExpo',
    }, (timePassed - 2000)).add({
        targets: "#title-timeline",
        opacity: 100,
        translateY: [-100, 0],
        easing: 'easeInOutExpo',
        begin: function () {
            document.querySelector('#section-timeline').style.display = 'initial';
        }
    }, timePassed).add({
        targets: ".h1-timeline highlight",
        innerHTML: [0, numActivities],
        round: 1,
        duration: 2000,
        easing: 'easeInOutExpo',
    }, timePassed).add({
        targets: "#subtitle-timeline",
        opacity: 100,
        translateY: [2000, 0],
        easing: 'easeInOutExpo',
        opacity: 100
    }, (timePassed + 1000)).add({
        targets: ".h2-timeline #inClass",
        innerHTML: [0, info.numActivitiesInClass],
        round: 1,
        duration: 3000,
        easing: 'easeInOutExpo',
    }, (timePassed + 600)).add({
        targets: ".h2-timeline #outClass",
        innerHTML: [0, info.numActivitiesOutClass],
        round: 1,
        duration: 3000,
        easing: 'easeInOutExpo',
    }, (timePassed + 600)).add({
        targets: ".h3-timeline",
        opacity: 100,
        translateY: [2500, 0],
        easing: 'easeInOutExpo',
        opacity: 100,
    }, (timePassed + 3000)).add({
        targets: ".h3-timeline",
        opacity: 100,
        translateY: [0, 2500],
        easing: 'easeInOutExpo',
        opacity: 0,
    }, (1800 * numActivities + 5000 * numScreens + 2500 + timePassed)).add({
        targets: "#subtitle-timeline",
        opacity: 100,
        translateX: [0, 2000],
        easing: 'easeInOutExpo',
        opacity: 0
    }, (1800 * numActivities + 5000 * numScreens + 3000 + timePassed)).add({
        targets: "#title-timeline",
        opacity: 100,
        translateX: [0, -2000],
        easing: 'easeInOutExpo',
        opacity: 0
    }, (1800 * numActivities + 5000 * numScreens + 3000 + timePassed)).add({
        targets: '#section-timeline',
        display: "none",
        begin: function () {
            document.querySelector('#section-timeline').style.display = 'none';
        }
    }, (1800 * numActivities + 5000 * numScreens + 4000 + timePassed));

    timePassed += (1800 * numActivities + 5000 * numScreens + 4000);
    previousColor = "#e4ecf5";
}

function addExperience() {
    var durationWithLength = document.querySelector(".p-experience").innerHTML.length * 25;

    tl.add({
        targets: 'body',
        backgroundColor: [previousColor, "#112255"],
        duration: 2500,
        easing: 'easeInOutExpo',
    }, (timePassed - 1500)).add({
        targets: "#dotExperience",
        opacity: "5%",
        translateY: [200, 0],
        delay: anime.stagger(75),
        begin: function () {
            document.querySelector('#section-experience').style.display = 'initial';
        }
    }, (timePassed)).add({
        targets: ".h1-experience",
        opacity: 100,
        translateY: [-500, 0],
    }, (timePassed + 2000)).add({
        targets: ".p-experience",
        opacity: 100,
        translateY: [250, 0],
    }, (timePassed + 2500)).add({
        targets: ".p-experience",
        opacity: 0,
        translateY: [0, 1000],
    }, (timePassed + 10000 + durationWithLength)).add({
        targets: ".h1-experience",
        translateY: [0, 5000],
        opacity: 100,
        duration: 1500,
        easing: 'easeInOutExpo',
    }, (timePassed + 10000 + durationWithLength)).add({
        targets: "#dotExperience",
        opacity: 0,
        delay: anime.stagger(22),
        duration: 1000,
    }, (timePassed + 10000 + durationWithLength)).add({
        targets: '#section-experience',
        display: "none",
        begin: function () {
            document.querySelector('#section-experience').style.display = 'none';
        }
    }, (timePassed + 11500 + durationWithLength));

    timePassed += 11500 + durationWithLength;
    previousColor = "#112255";
}

function countDuration(property, name) {
    var totalTime = 0;
    for (var i = 0; i < info.activities.length; i++) {
        if (info.activities[i][property] == name) totalTime += info.activities[i].duration;
    }
    return ((totalTime / totalTimeActivities) * 100);
}

function getStatisticsWidth(value) {
    if (value == 0) return "7%";
    else return (value / 2 + 7) + "%";
}

function countDurationTasks(property, name) {
    var tasksTime = 0;
    for (var i = 0; i < info.activities.length; i++) {
        for (var j = 0; j < info.activities[i].tasks.length; j++) {
            if (info.activities[i].tasks[j].duration && info.activities[i].tasks[j][property] == name) tasksTime += info.activities[i].tasks[j].duration;
        }
    }
    return ((tasksTime / totalTimeTasks) * 100);
}

function addStatistics() {
    tl.add({
        targets: 'body',
        backgroundColor: [previousColor, "#ffc099"],
        duration: 5000,
        easing: 'easeInOutExpo',
    }, (timePassed - 2000)).add({
        targets: ".h1-statistics",
        translateY: [1000, 0],
        opacity: 100,
        easing: 'easeInOutExpo',
        begin: function () {
            document.querySelector('#section-statistics').style.display = 'initial';
        }
    }, timePassed).add({
        targets: ".h2-statistics",
        translateY: [-50, 0],
        opacity: 100,
        duration: 1000,
        delay: anime.stagger(2000),
    }, timePassed + 1000).add({
        targets: "#row1",
        opacity: 100,
        width: getStatisticsWidth(countDuration("className", "in")),
        innerHTML: ["0%", countDuration("className", "in") + "%"],
        round: 1
    }, (timePassed + 1500)).add({
        targets: "#row2",
        opacity: 100,
        width: getStatisticsWidth(countDuration("className", "out")),
        innerHTML: ["0%", countDuration("className", "out") + "%"],
        round: 1
    }, (timePassed + 2000)).add({
        targets: "#row3",
        opacity: 100,
        width: getStatisticsWidth(countDurationTasks("graded", 3)),
        innerHTML: ["0%", countDurationTasks("graded", 3) + "%"],
        round: 1
    }, (timePassed + 3000)).add({
        targets: "#row4",
        opacity: 100,
        width: getStatisticsWidth(countDurationTasks("graded", 2)),
        innerHTML: ["0%", countDurationTasks("graded", 2) + "%"],
        round: 1
    }, (timePassed + 3500)).add({
        targets: "#row5",
        opacity: 100,
        width: getStatisticsWidth(countDurationTasks("graded", 1)),
        innerHTML: ["0%", countDurationTasks("graded", 1) + "%"],
        round: 1
    }, (timePassed + 4000)).add({
        targets: "#row6",
        opacity: 100,
        width: getStatisticsWidth(countDurationTasks("teacherRol", 1)),
        innerHTML: ["0%", countDurationTasks("teacherRol", 1) + "%"],
        round: 1
    }, (timePassed + 5000)).add({
        targets: "#row7",
        opacity: 100,
        width: getStatisticsWidth(countDurationTasks("teacherRol", 2)),
        innerHTML: ["0%", countDurationTasks("teacherRol", 2) + "%"],
        round: 1
    }, (timePassed + 5500)).add({
        targets: "#row8",
        opacity: 100,
        width: getStatisticsWidth(countDurationTasks("teacherRol", 3)),
        innerHTML: ["0%", countDurationTasks("teacherRol", 3) + "%"],
        round: 1
    }, (timePassed + 6250)).add({
        targets: "#row9",
        opacity: 100,
        width: getStatisticsWidth(countDurationTasks("studentRol", 1)),
        innerHTML: ["0%", countDurationTasks("studentRol", 1) + "%"],
        round: 1
    }, (timePassed + 7000)).add({
        targets: "#row10",
        opacity: 100,
        width: getStatisticsWidth(countDurationTasks("studentRol", 2)),
        innerHTML: ["0%", countDurationTasks("studentRol", 2) + "%"],
        round: 1
    }, (timePassed + 7500)).add({
        targets: "#row11",
        opacity: 100,
        width: getStatisticsWidth(countDurationTasks("studentRol", 3)),
        innerHTML: ["0%", countDurationTasks("studentRol", 3) + "%"],
        round: 1
    }, (timePassed + 8250)).add({
        targets: ".icons-statistics",
        opacity: 100,
        delay: anime.stagger(700),
        rotateY: [-90, 0],
    }, (timePassed + 1250)).add({
        targets: ".statisticsText",
        opacity: 100,
        delay: anime.stagger(700),
    }, (timePassed + 1350)).add({
        targets: ".div-statistics",
        width: "10%",
        opacity: 0,
        delay: anime.stagger(100),
        easing: 'easeInOutExpo',
        duration: 200
    }, (timePassed + 18000)).add({
        targets: ".statisticsText",
        opacity: 0,
        delay: anime.stagger(100),
        easing: 'easeInOutExpo',
        duration: 200,
    }, (timePassed + 18000)).add({
        targets: ".h2-statistics",
        opacity: 0,
        delay: anime.stagger(300),
        easing: 'easeInOutExpo',
        duration: 200,
    }, (timePassed + 18000)).add({
        targets: ".icons-statistics",
        opacity: 0,
        delay: anime.stagger(100),
        rotateY: [0, 90],
        duration: 200,
        easing: 'easeInOutExpo',
    }, (timePassed + 18000)).add({
        targets: ".h1-statistics",
        translateY: [0, 1000],
        opacity: 0,
        easing: 'easeInOutExpo',
    }, (timePassed + 19000)).add({
        targets: '#section-statistics',
        display: "none",
        begin: function () {
            document.querySelector('#section-statistics').style.display = 'none';
        }
    }, (timePassed + 20000));

    timePassed += 20000;
    previousColor = "#ffc099";
}