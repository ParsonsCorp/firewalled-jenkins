// START Cookie Information
function setCookie(cname, cvalue, exdays) {
    // cname=username cvalue=myusername exdays=#ofdays
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function checkCookie(cookieName) {
    var cookie = getCookie(cookieName);
    if (cookie != "") {
        return true;
    } else {
        return false;
    }
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}
// END COOKIE Information
function divConsoleAlert(type, jumbo, content) {
    // alert-success, alert-info, alert-warning, alert-danger
    $('#management-alert').removeClass('alert-success').removeClass('alert-info').removeClass('alert-warning').removeClass('alert-danger');
    $('#management-alert').addClass(type);
    $('#management-alert').fadeIn(1000);
    $('#alert-content').html('<strong>'+jumbo+'</strong> '+ content);
}
function consoleAjaxCmd(method, resturl, ajaxdata, success_call) {
     $.ajax({
        type: method,
        url: resturl,
        data: ajaxdata,
        success: success_call,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            divConsoleAlert('alert-danger', textStatus.toUpperCase()+': ', errorThrown);
         }
    });
}
function divState(page_display) {
    $('#console-wrapper').children().hide()
    switch(page_display) {
        case 'set':
            $('#set-secret').show();
            break;
        case 'provide':
            $('#provide-secret').show();
            break;
        case 'jenkins-hosts':
            $('#jenkins-hosts').show(getUsersJenkinsAPIs());
            break;
    }
}
// GET USER Information
function getUsername() {
    return getCookie('username');
}
// END USER Information
// MAIN
// Check State onload
function checkState() {
    var success = function (msg, status, jqXHR) {
        if (msg.auth == 'true') {
            if (msg.hasKey == 'true') {
                // Lets see if they've already provided a key
                if (getCookie('stored_key') !== '') {
                    divState('jenkins-hosts')
                    // User has a key and it's been stored so lets allow them access to jenkins api
                } else {
                // The user has a key so but has not set it so display page to set the key
                    divState('provide')
                }
            } else {
            // The user has to set a secret key. Show page to set key
                divState('set')
            }
        }
    }
    consoleAjaxCmd('GET', '/session/validate/', '', success)
}


// HIDE ALERTS
$('#close-alert').click(function() {
    $(this).parent().fadeOut(1000);
});


// LOGIN PAGE
if (getUsername()) {
    $('#nav-logout').removeClass('disabled').removeAttr('disabled');
} else {
    $('#nav-logout').addClass('disabled').attr('disabled', true);
}

$('#loginForm').submit(function(e) {
    e.preventDefault();
    var formData = $(this).serialize();
    $.ajax({
        type: "POST",
        url: "/user/create",
        data: formData,
        success: function (msg, status, jqXHR) {
            location.href = '/'
        },
         error: function(XMLHttpRequest, textStatus, errorThrown) {
            alert("Status: " + textStatus); alert("Error: " + errorThrown);
         }
    });
});

// HOME PAGE
$('#h1-welcome-username').html(decodeURIComponent(getUsername()));

// SET-SECRET
$('#set-secret-key-form').submit(function(e) {
    e.preventDefault();
    var secretKey = $('#secret-key').val();
    var secretKeyConfirm = $('#secret-key-confirm').val();

    if (secretKey == secretKeyConfirm) {
        var success = function (msg, status, jqXHR) {
            divConsoleAlert('alert-success', 'SUCCESS: ', msg.notice);
        }
        consoleAjaxCmd('POST','/user/secret','secretKey='+secretKey, success);
        divState('provide')
    } else {
        divConsoleAlert('alert-danger', 'ERROR:', 'The keys do not match.');
    }
});

// provide-SECRET
$('#provide-secret-key-form').submit(function(e) {
    e.preventDefault();
    var secretKey = $('#provide-secret-key-input').val();
    var success = function (msg, status, jqXHR) {
        if (msg.notice == 'true') {
            divConsoleAlert('alert-success', 'SUCCESS:', 'You know your key!');
            divState('jenkins-hosts');
        } else {
            divConsoleAlert('alert-danger', 'ERROR:', 'You dont know your key!');
        }
    }
    consoleAjaxCmd('POST','/user/secret/check','secretKey='+secretKey, success);
});
// ADD-JENKINS-HOST
$('#add-jenkins-api-form').submit(function(e) {
    e.preventDefault();
    var formData = $(this).serialize();
    var success = function (msg, status, jqXHR) {
        divConsoleAlert('alert-success', 'SUCCESS: ', 'Jenkins host has been added');
        getUsersJenkinsAPIs();
    }
    consoleAjaxCmd('POST','/jenkins/create',formData, success);
    this.reset();
});

function connectToJenkinsAPI(getType) {
    var success = function (msg, status, jqXHR) {
        if (msg.notice == 'Authorized') {
            var apiName = getCookie('apiName');
            $('.jenkins-jobs-api-url-name').text(apiName);
            var username = msg.user_email;
            var apiKey = msg.plainTextAPIKey;
            var init_url = msg.url;
            init_url = init_url.split("/");
            var complete_url = init_url[0]+'//'+username+':'+apiKey+'@'+init_url[2];
            switch(getType) {
                case 'getJenkinsJobs':
                    getJenkinsJobs(complete_url);
                    break;
                case 'getJenkinsJobInfo':
                    getJenkinsJobInfo(complete_url);
                    break;
            }
        } else {
            divConsoleAlert('alert-danger', 'ERROR: ', 'You don\'t own that resource');
        }
    }
    var apiID = getCookie('apiID');
    consoleAjaxCmd('POST','/jenkins/connect','apiID='+apiID, success);
}
// GET-JENKINS-HOSTS
function getUsersJenkinsAPIs() {
    var success = function (msg, status, jqXHR) {
        var user_apis = msg.user[0].apis;
        if (user_apis.length > 0) {
            var template = '';
            for (var i in user_apis.reverse()) {
                var api = user_apis[i];
                api.url = api.url.split("/");
                template += '<li>'+ api.url[2] +'<ul id="'+ api.id +'" class="jenkins-host-list-options"><li class="connect-to-api">Connect</li><li class="destroy-api">Destroy</li></ul></li>'
            }
            $('#list-apis-jenkins').html(template);
        } else {
            $('#jenkins-host-verbiage').append('You haven\'t added any hosts. Please add one using the form');
        }
        // CONNECT to JENKINS$
        $('.connect-to-api').click(function() {
            connectToJenkinsAPI('getJenkinsJobs');
            setCookie('apiName', api.url[2]);
            setCookie('apiID', api.id);
        });

    }
    consoleAjaxCmd('GET','/jenkins','', success);
}

function getJenkinsJobs(complete_url) {
    var inside_success = function (msg, status, jqXHR) {
        parseJenkinsJobs(msg.apiData);
        $('#add-jenkins-host-form-div').hide();
        $('#manage-jenkins-jobs-host-form-div').show();
    }
    consoleAjaxCmd('POST', '/jenkins/jobs', 'url='+complete_url, inside_success);
}

function parseJenkinsJobs(data) {
    var apiID = getCookie('apiID');
    var template = '<ul data-api="'+apiID+'" id="jenkins-jobs">'
    for (var i in data) {
        var job = data[i];
        var color = job.color;
        switch(color) {
            case 'red':
                color = "#EF2929"
                break;
            case 'blue':
                color = "#4E9A06"
                break;
            }
        template += '<li class="jenkins-job" id="'+job.name+'" style="color:'+color+'">'+job.name+' <span style="display:none;">:: Builds</span><ul style="display:none"></ul></li>';
    }
    template += '<ul>';
    $('#build-info').html(template);
    $('.jenkins-job').click(function() {
        $(this).children().toggle();
        setCookie('jobName', $(this).attr('id'));
        connectToJenkinsAPI('getJenkinsJobInfo')
    });
}

function getJenkinsJobInfo(complete_url) {
    var jobName = getCookie('jobName');
    var inside_success = function (msg, status, jqXHR) {
         parseJobInfo(msg.apiData, complete_url);
    }
    consoleAjaxCmd('POST', '/jenkins/job/info', 'url='+complete_url+'&job_name='+jobName, inside_success);
}
function parseJobInfo(data, complete_url) {
    var jobName = getCookie('jobName');
    var template = ''
    for (var i in data.builds.reverse()) {
        var build = data.builds[i];
        template += '<li class="jenkins-build" data-url="'+complete_url+'" id="'+jobName+'_'+build.number+'">'+build.number+'</li>';
    }
    $('#'+jobName +' ul').html(template);
    $('.jenkins-build').hover(function() {
        console.log($(this).attr('id'));
        if (!$(this).hasClass("check")) {
            var id = $(this).attr('id')
            var complete_url = $(this).data('url')
            id = id.split('_')
            var job = id[0];
            var build = id[1];
            checkBuildResult(complete_url, job, build);
        }
    });
}
function checkBuildResult(complete_url, jobName, buildNumber) {
    console.log('entered');
        var inside_success = function (msg, status, jqXHR) {
            var build_data = msg.apiData;
            console.log(build_data);
            var result = build_data.result;
            var build_class = "";
            switch(result) {
                case 'SUCCESS':
                    build_class = "jenkins-build-success check"
                    break;
                case 'FAILURE':
                    build_class = "jenkins-build-fail check"
                    break;
            }
            $('#'+jobName+'_'+buildNumber).addClass(build_class);
        }
        consoleAjaxCmd('POST', '/jenkins/job/build/info', 'url='+complete_url+'&job_name='+jobName+'&build_number='+buildNumber, inside_success);
}