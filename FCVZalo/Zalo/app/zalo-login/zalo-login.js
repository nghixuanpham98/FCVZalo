
$(document).ready(function () {
    getConfigApp();
});

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
            $("#url").val(app.url);

            getCodeVerifier();
        } else {
            console.log(rs);
            alertError(rs.messVN);
        }
    });
}

/*Generating Code Verifier*/
function dec2hex(dec) {
    return ("0" + dec.toString(16)).substr(-2);
}

function generateCodeVerifier() {
    var array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join("");
}

function getCodeVerifier() {
    document.getElementById("code_verifier").value = generateCodeVerifier();
    getCodeChallenge();
}

/*Generating Code Challenge From Verifier*/
function sha256(plain) {
    // returns promise ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(a) {
    var str = "";
    var bytes = new Uint8Array(a);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return btoa(str)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function generateCodeChallengeFromVerifier(v) {
    var hashed = await sha256(v);
    var base64encoded = base64urlencode(hashed);
    return base64encoded;
}

async function getCodeChallenge() {
    let codeVerifier = document.getElementById("code_verifier").value;
    try {
        let code_challenge = await generateCodeChallengeFromVerifier(
            codeVerifier
        );
        document.getElementById("code_challenge").value = code_challenge;

        getAuthorizationCode();
    } catch (e) {
        document.getElementById("code_challenge").value = JSON.stringify(e);
    }
}

/*Get Authorization Code From Zalo*/
function getAuthorizationCode() {
    var appID = $("#app_id").val();
    var codeVerifier = $("#code_verifier").val();
    var codeChallenge = $("#code_challenge").val();
    var url = $("#url").val();

    var local_url = url + "/Zalo/";

    var urlRedirect = "https://oauth.zaloapp.com/v4/oa/permission?app_id=" + appID
        + "&redirect_uri=" + local_url
        + "&code_challenge=" + codeChallenge
        + "&state=" + codeVerifier;

    window.location.href = urlRedirect;
}