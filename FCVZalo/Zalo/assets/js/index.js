
/*Get data in url*/
var url_string = window.location.href;
var url = new URL(url_string);
var codeVerifier = url.searchParams.get("state");
var authorizationCode = url.searchParams.get("code");

$(document).ready(function () {
    $("#loader").hide();
    getConfigApp();
});

/*Get Config App*/
function getConfigApp() {
    var settings = {
        "url": api_url + "ChatZalo/GetConfigApp",
        "method": "GET",
        "timeout": 0,
    };

    $.ajax(settings).done(function (rs) {
        if (rs.code == 200) {
            console.log(rs);
            var app = rs.app;

            $("#app_id").val(app.appID);
            $("#secret_key").val(app.secretKey);
            getAccessToken();
            getOAInformation();
        } else {
            console.log(rs);
            alertError(rs.messVN);
        }
    });
}

/*Get Access Token From Zalo*/
function getAccessToken() {
    var appID = $("#app_id").val();
    var secretKey = $("#secret_key").val();

    var getToken = {
        "url": "https://oauth.zaloapp.com/v4/oa/access_token",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "secret_key": secretKey,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        "data": {
            "code": authorizationCode,
            "app_id": appID,
            "grant_type": "authorization_code",
            "code_verifier": codeVerifier
        }
    };

    $("#loader").show();

    $.ajax(getToken).done(function (rs) {
        if (rs.error) {
            $("#loader").hide();
            console.log(rs);
        } else {
            $("#loader").hide();
            console.log(rs);

            var updateToken = {
                "url": api_url + "ChatZalo/Token/Update",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify({
                    "accessToken": rs.access_token,
                    "refreshToken": rs.refresh_token,
                    "expiresIn": rs.expires_in
                }),
            };

            $("#loader").show();

            $.ajax(updateToken).done(function (rs) {
                $("#loader").hide();
                console.log(rs);
            });
        }
    });
}

/*Get OA Information*/
function getOAInformation() {
    var oa = {
        "url": api_url + "ChatZalo/OA/GetInformation",
        "method": "GET",
        "timeout": 0,
    };

    $("#loader").show();

    $.ajax(oa).done(function (rs) {
        if (rs.code == 200) {
            console.log(rs);
            var data = rs.data;
            var avatar = data.Avatar;

            $(".nav-block__avatar-img").attr("src", avatar);

            $("#loader").hide();

            /*Check Zalo Unread Msg every 1 seconds*/
            setInterval(function () {
                zaloCheckUnReadMsg();
            }, 1000);
        } else {
            console.log(rs);
            $("#loader").hide();
            alertError(rs.messVN);
        }
    });
}

/*Zalo: Check unread messages*/
function zaloCheckUnReadMsg() {
    var check = {
        "url": api_url + "ChatZalo/CheckUnReadMessages",
        "method": "GET",
        "timeout": 0,
    };

    $.ajax(check).done(function (rs) {
        if (rs.code == 200) {
            var data = rs.data;
            var dataLength = data.length;
            if (dataLength > 0) {
                $(".nav-list__item-icon-new").show();
            } else {
                $(".nav-list__item-icon-new").hide();
            }
        } else {
            $(".nav-list__item-icon-new").hide();
        }
    });
}

