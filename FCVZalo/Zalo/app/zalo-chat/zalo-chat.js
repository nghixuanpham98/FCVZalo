
var arrFollower = [];

$(document).ready(function () {
    $("#loader").hide();
    $(".chat-content__msg").hide();
    getFollowers();

    /*Check Msg new every 1 second*/
    setInterval(function () {
        var userID = $("#userID").val();
        if (userID) {
            getMsgNew(userID);
        }
    }, 1000);

    /*Check Unread Msg every 1 second*/
    setInterval(function () {
        checkUnReadMsg();
    }, 1000);

    /*Check User new every 30 seconds*/
    setInterval(function () {
        getFollowers();
    }, 60000);

    checkUnReadMsg();
});

/*Get all Followers*/
function getFollowers(pageSizeNew) {
    var keySearch = $("#txtConvSearch").val();
    var typeFilter = $("#filterTag").val();

    /*Paging*/
    var pageIndex = $("#pageIndexConv").val();
    var pageSize = $("#pageSizeConv").val();

    if (pageSizeNew) {
        pageSize = pageSizeNew;
    } else {
        pageSize = 10;
        $("#pageSizeConv").val(10);
    }

    var users = {
        "url": api_url + "ChatZalo/User/GetAll",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify({
            "pageIndex": pageIndex,
            "pageSize": pageSize,
            "keySearch": keySearch,
            "type": typeFilter
        }),
    };

    $.ajax(users).done(function (rs) {
        if (rs.code == 200) {
            var html = "";
            var data = rs.data;
            var dataLength = data.length;

            for (var i = 0; i < dataLength; i++) {
                if (data[i].LastTimeMessage == null || data[i].LastTimeMessage === "undefined" | data[i].LastTimeMessage === "") {
                    var timeActive = data[i].LastTimeMessage;
                    timeActive = "-";
                } else {
                    let timestampNow = Math.floor(Date.now() / 1000);
                    var timestampActive = Math.floor(data[i].LastTimeMessage / 1000);
                    var timeActive = timeSinceSpecial(timestampNow - timestampActive);
                }

                if (data[i].LastMessage == null || data[i].LastMessage === "undefined" | data[i].LastMessage === "") {
                    data[i].LastMessage = "-";
                }

                if (data[i].TagsName != null || data[i].TagsName != "undefined" | data[i].TagsName != "") {
                    $("#tagName").val(data[i].TagsName);
                }

                if (data[i].TypeLastMessage == "text") {
                    html += `<li id="user-${data[i].UserID}" onclick="getMessagesOfFollower(\`` + data[i].UserID + `\`, \`` + data[i].DisplayName + `\`, \`` + data[i].AvatarDefaultApp + `\`, \`` + data[i].IsFollower + `\`)" class="conv-body-list__item">`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2">`;
                    html += `<img alt="Hình ảnh" class="user-img" src="${data[i].AvatarDefaultApp}" />`;
                    html += `</div>`;
                    html += `<div class="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 d-flex flex-column align-items-start ms-2">`;
                    html += `<span id="nameUser-${data[i].UserID}" class="conv-body-list__item-name">${data[i].DisplayName}</span>`;
                    html += `<span id="lastMsg-${data[i].UserID}" class="conv-body-list__item-title">${data[i].LastMessage}</span>`;
                    html += `</div>`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex flex-column align-items-end ms-2">`;
                    html += `<i id="iconNew-${data[i].UserID}" class="conv-body-list__item-count fa-solid fa-n text-center"></i>`;
                    html += `<span id="timeLastMsg-${data[i].UserID}" class="conv-body-list__item-time">${timeActive}</span>`;
                    html += `</div>`;
                    html += `</li>`;
                } else if (data[i].TypeLastMessage == "photo" || data[i].TypeLastMessage == "image") {
                    html += `<li id="user-${data[i].UserID}" onclick="getMessagesOfFollower(\`` + data[i].UserID + `\`, \`` + data[i].DisplayName + `\`, \`` + data[i].AvatarDefaultApp + `\`, \`` + data[i].IsFollower + `\`)" class="conv-body-list__item">`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2">`;
                    html += `<img alt="Hình ảnh" class="user-img" src="${data[i].AvatarDefaultApp}" />`;
                    html += `</div>`;
                    html += `<div class="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 d-flex flex-column align-items-start ms-2">`;
                    html += `<span id="nameUser-${data[i].UserID}" class="conv-body-list__item-name">${data[i].DisplayName}</span>`;
                    html += `<span id="lastMsg-${data[i].UserID}" class="conv-body-list__item-title"><i class="fa-solid fa-image me-2"></i>Hình ảnh</span>`;
                    html += `</div>`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex flex-column align-items-end ms-2">`;
                    html += `<i id="iconNew-${data[i].UserID}" class="conv-body-list__item-count fa-solid fa-n text-center"></i>`;
                    html += `<span id="timeLastMsg-${data[i].UserID}" class="conv-body-list__item-time">${timeActive}</span>`;
                    html += `</div>`;
                    html += `</li>`;
                } else if (data[i].TypeLastMessage == "gif") {
                    html += `<li id="user-${data[i].UserID}" onclick="getMessagesOfFollower(\`` + data[i].UserID + `\`, \`` + data[i].DisplayName + `\`, \`` + data[i].AvatarDefaultApp + `\`, \`` + data[i].IsFollower + `\`)" class="conv-body-list__item">`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2">`;
                    html += `<img alt="Hình ảnh" class="user-img" src="${data[i].AvatarDefaultApp}" />`;
                    html += `</div>`;
                    html += `<div class="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 d-flex flex-column align-items-start ms-2">`;
                    html += `<span id="nameUser-${data[i].UserID}" class="conv-body-list__item-name">${data[i].DisplayName}</span>`;
                    html += `<span id="lastMsg-${data[i].UserID}" class="conv-body-list__item-title">GIF</span>`;
                    html += `</div>`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex flex-column align-items-end ms-2">`;
                    html += `<i id="iconNew-${data[i].UserID}" class="conv-body-list__item-count fa-solid fa-n text-center"></i>`;
                    html += `<span id="timeLastMsg-${data[i].UserID}" class="conv-body-list__item-time">${timeActive}</span>`;
                    html += `</div>`;
                    html += `</li>`;
                } else if (data[i].TypeLastMessage == "link" || data[i].TypeLastMessage == "links") {
                    html += `<li id="user-${data[i].UserID}" onclick="getMessagesOfFollower(\`` + data[i].UserID + `\`, \`` + data[i].DisplayName + `\`, \`` + data[i].AvatarDefaultApp + `\`, \`` + data[i].IsFollower + `\`)" class="conv-body-list__item">`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2">`;
                    html += `<img alt="Hình ảnh" class="user-img" src="${data[i].AvatarDefaultApp}" />`;
                    html += `</div>`;
                    html += `<div class="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 d-flex flex-column align-items-start ms-2">`;
                    html += `<span id="nameUser-${data[i].UserID}" class="conv-body-list__item-name">${data[i].DisplayName}</span>`;
                    html += `<span id="lastMsg-${data[i].UserID}" class="conv-body-list__item-title"><i class="fa-solid fa-link me-2"></i>Liên kết được chia sẻ</span>`;
                    html += `</div>`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex flex-column align-items-end ms-2">`;
                    html += `<i id="iconNew-${data[i].UserID}" class="conv-body-list__item-count fa-solid fa-n text-center"></i>`;
                    html += `<span id="timeLastMsg-${data[i].UserID}" class="conv-body-list__item-time">${timeActive}</span>`;
                    html += `</div>`;
                    html += `</li>`;
                } else if (data[i].TypeLastMessage == "audio" || data[i].TypeLastMessage == "voice") {
                    html += `<li id="user-${data[i].UserID}" onclick="getMessagesOfFollower(\`` + data[i].UserID + `\`, \`` + data[i].DisplayName + `\`, \`` + data[i].AvatarDefaultApp + `\`, \`` + data[i].IsFollower + `\`)" class="conv-body-list__item">`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2">`;
                    html += `<img alt="Hình ảnh" class="user-img" src="${data[i].AvatarDefaultApp}" />`;
                    html += `</div>`;
                    html += `<div class="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 d-flex flex-column align-items-start ms-2">`;
                    html += `<span id="nameUser-${data[i].UserID}" class="conv-body-list__item-name">${data[i].DisplayName}</span>`;
                    html += `<span id="lastMsg-${data[i].UserID}" class="conv-body-list__item-title"><i class="fa-solid fa-microphone me-2"></i></i>Tin nhắn thoại</span>`;
                    html += `</div>`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex flex-column align-items-end ms-2">`;
                    html += `<i id="iconNew-${data[i].UserID}" class="conv-body-list__item-count fa-solid fa-n text-center"></i>`;
                    html += `<span id="timeLastMsg-${data[i].UserID}" class="conv-body-list__item-time">${timeActive}</span>`;
                    html += `</div>`;
                    html += `</li>`;
                } else if (data[i].TypeLastMessage == "video") {
                    html += `<li id="user-${data[i].UserID}" onclick="getMessagesOfFollower(\`` + data[i].UserID + `\`, \`` + data[i].DisplayName + `\`, \`` + data[i].AvatarDefaultApp + `\`, \`` + data[i].IsFollower + `\`)" class="conv-body-list__item">`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2">`;
                    html += `<img alt="Hình ảnh" class="user-img" src="${data[i].AvatarDefaultApp}" />`;
                    html += `</div>`;
                    html += `<div class="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 d-flex flex-column align-items-start ms-2">`;
                    html += `<span id="nameUser-${data[i].UserID}" class="conv-body-list__item-name">${data[i].DisplayName}</span>`;
                    html += `<span id="lastMsg-${data[i].UserID}" class="conv-body-list__item-title"><i class="fa-solid fa-file-video me-2"></i>Video</span>`;
                    html += `</div>`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex flex-column align-items-end ms-2">`;
                    html += `<i id="iconNew-${data[i].UserID}" class="conv-body-list__item-count fa-solid fa-n text-center"></i>`;
                    html += `<span id="timeLastMsg-${data[i].UserID}" class="conv-body-list__item-time">${timeActive}</span>`;
                    html += `</div>`;
                    html += `</li>`;
                } else if (data[i].TypeLastMessage == "file") {
                    html += `<li id="user-${data[i].UserID}" onclick="getMessagesOfFollower(\`` + data[i].UserID + `\`, \`` + data[i].DisplayName + `\`, \`` + data[i].AvatarDefaultApp + `\`, \`` + data[i].IsFollower + `\`)" class="conv-body-list__item">`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2">`;
                    html += `<img alt="Hình ảnh" class="user-img" src="${data[i].AvatarDefaultApp}" />`;
                    html += `</div>`;
                    html += `<div class="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 d-flex flex-column align-items-start ms-2">`;
                    html += `<span id="nameUser-${data[i].UserID}" class="conv-body-list__item-name">${data[i].DisplayName}</span>`;
                    html += `<span id="lastMsg-${data[i].UserID}" class="conv-body-list__item-title"><i class="fa-solid fa-paperclip me-2"></i>Tệp đính kèm</span>`;
                    html += `</div>`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex flex-column align-items-end ms-2">`;
                    html += `<i id="iconNew-${data[i].UserID}" class="conv-body-list__item-count fa-solid fa-n text-center"></i>`;
                    html += `<span id="timeLastMsg-${data[i].UserID}" class="conv-body-list__item-time">${timeActive}</span>`;
                    html += `</div>`;
                    html += `</li>`;
                } else if (data[i].TypeLastMessage == "location") {
                    html += `<li id="user-${data[i].UserID}" onclick="getMessagesOfFollower(\`` + data[i].UserID + `\`, \`` + data[i].DisplayName + `\`, \`` + data[i].AvatarDefaultApp + `\`, \`` + data[i].IsFollower + `\`)" class="conv-body-list__item">`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2">`;
                    html += `<img alt="Hình ảnh" class="user-img" src="${data[i].AvatarDefaultApp}" />`;
                    html += `</div>`;
                    html += `<div class="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 d-flex flex-column align-items-start ms-2">`;
                    html += `<span id="nameUser-${data[i].UserID}" class="conv-body-list__item-name">${data[i].DisplayName}</span>`;
                    html += `<span id="lastMsg-${data[i].UserID}" class="conv-body-list__item-title"><i class="fa-solid fa-location-dot me-2"></i>Vị trí</span>`;
                    html += `</div>`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex flex-column align-items-end ms-2">`;
                    html += `<i id="iconNew-${data[i].UserID}" class="conv-body-list__item-count fa-solid fa-n text-center"></i>`;
                    html += `<span id="timeLastMsg-${data[i].UserID}" class="conv-body-list__item-time">${timeActive}</span>`;
                    html += `</div>`;
                    html += `</li>`;
                } else {
                    html += `<li id="user-${data[i].UserID}" onclick="getMessagesOfFollower(\`` + data[i].UserID + `\`, \`` + data[i].DisplayName + `\`, \`` + data[i].AvatarDefaultApp + `\`, \`` + data[i].IsFollower + `\`)" class="conv-body-list__item">`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2">`;
                    html += `<img alt="Hình ảnh" class="user-img" src="${data[i].AvatarDefaultApp}" />`;
                    html += `</div>`;
                    html += `<div class="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6 d-flex flex-column align-items-start ms-2">`;
                    html += `<span id="nameUser-${data[i].UserID}" class="conv-body-list__item-name">${data[i].DisplayName}</span>`;
                    html += `<span id="lastMsg-${data[i].UserID}" class="conv-body-list__item-title">${data[i].LastMessage}</span>`;
                    html += `</div>`;
                    html += `<div class="col-2 col-sm-2 col-md-2 col-lg-2 col-xl-2 d-flex flex-column align-items-end ms-2">`;
                    html += `<i id="iconNew-${data[i].UserID}" class="conv-body-list__item-count fa-solid fa-n text-center"></i>`;
                    html += `<span id="timeLastMsg-${data[i].UserID}" class="conv-body-list__item-time">${timeActive}</span>`;
                    html += `</div>`;
                    html += `</li>`;
                }
            }

            $(".conv-body-list").html(html);

            $("#totalRecordsConv").val(rs.paging.TotalRecords)

            var userID = $("#userID").val();

            if (userID) {
                $("#user-" + userID).addClass("conv-body-list__item--active");
            }

            if (arrFollower.length > 0) {
                for (var i = 0; i < arrFollower.length; i++) {
                    $("#nameUser-" + arrFollower[i].ID).addClass("fw-bold");
                    $("#lastMsg-" + arrFollower[i].ID).addClass("fw-bold");
                    $("#timeLastMsg-" + arrFollower[i].ID).addClass("fw-bold");
                    $("#iconNew-" + arrFollower[i].ID).show();
                }
            }

        } else if (rs.code == 450) {
            console.log(rs);
            var html = "";
            html += `<li class="conv-body-list__item">${rs.messVN}</li>`;

            $(".conv-body-list").html(html);
        } else {
            console.log(rs);
            alertError(rs.messVN);
        }
    });
}

/*Get all Messages of Followers*/
function getMessagesOfFollower(id, name, avatar, isFollower, pageSizeNew) {
    updateStatusOfNewMsg(id);

    var tagName = $("#tagName").val();
    if (tagName != null && tagName != "undefined" && tagName != "") {
        $("#updateTagDone").hide();
    } else {
        $("#updateTagDone").show();
    }

    $(".chat-content__msg").show();

    $("#userID").val(id);
    $("#nameOfUser").val(name);
    $("#avatarOfUser").val(avatar);
    $("#isFollower").val(isFollower);

    if (isFollower == "true") {
        isFollower = "Đã theo dõi";
    } else {
        isFollower = "Chưa theo dõi";
    }

    $(".msg-header__block-name").text(name);
    $(".msg-header__block-title").text(isFollower);
    $(".msg-header__block-img").attr("src", avatar);

    $(".msg-body-list").html("");
    $("#totalRecordsMsg").val("");

    $(".conv-body-list__item").removeClass("conv-body-list__item--active");
    $("#user-" + id).addClass("conv-body-list__item--active");


    $("#nameUser-" + id).removeClass("fw-bold");
    $("#lastMsg-" + id).removeClass("fw-bold");
    $("#timeLastMsg-" + id).removeClass("fw-bold");
    $("#iconNew-" + id).hide();

    /*Paging*/
    var pageIndex = $("#pageIndexMsg").val();
    var pageSize = $("#pageSizeMsg").val();

    if (pageSizeNew) {
        pageSize = pageSizeNew;
    } else {
        pageSize = 10;
        $("#pageSizeMsg").val(10);
    }

    var messages = {
        "url": api_url + "ChatZalo/GetAllMsgByFollower",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify({
            "pageIndex": pageIndex,
            "pageSize": pageSize,
            "followerIDZalo": id
        }),
    };

    $("#loader").show();

    $.ajax(messages).done(function (rs) {        
        if (rs.code == 200) {
            $("#loader").hide();
            console.log(rs);
            var msg = "";
            var data = rs.data;
            var dataLength = data.length;

            for (var i = (dataLength - 1); i >= 0; i--) {
                var time = data[i].Time;
                var dateFormat = new Date(Number(time));

                var minutes = dateFormat.getMinutes();
                var day = dateFormat.getDate();

                if (minutes < 10) {
                    minutes = "0" + dateFormat.getMinutes();
                }

                var hours = dateFormat.getHours();
                if (hours < 10) {
                    hours = "0" + dateFormat.getHours();
                }

                var timeAfterFormatted = hours +
                    ":" + minutes;

                if (data[i].Type == "nosupport") {
                    if (data[i].FromID != id) {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-received">`;
                        msg += `<div class="d-flex flex-column align-items-start">`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-received mt-2">`;
                        msg += `<span class="item-received__content">Loại tin nhắn không hỗ trợ</span>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    } else {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-sent">`;
                        msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                        msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                        msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-sent mt-2">`;
                        msg += `<span class="item-sent__content">Loại tin nhắn không hỗ trợ</span>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    }
                } else if (data[i].Type == "link" || data[i].Type == "links") {
                    if (data[i].FromID != id) {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-received">`;
                        msg += `<div class="d-flex flex-column align-items-start">`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-received mt-2">`;
                        msg += `<span class="item-received__content">${data[i].Description}`;
                        msg += `<a class="item-received__link mt-2" target="_blank" href="${data[i].Url}">`;
                        msg += `<img alt="Hình ảnh" class="msg-body-list__item-thumb" src="${data[i].Thumb}" />`;
                        msg += `<span class="ms-2">${data[i].Url}</span>`;
                        msg += `</a>`;
                        msg += `</span>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    } else {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-sent">`;
                        msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                        msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                        msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-sent mt-2">`;
                        msg += `<span class="item-sent__content">${data[i].Description}`;
                        msg += `<a class="item-sent__link mt-2" target="_blank" href="${data[i].Url}">`;
                        msg += `<img alt="Hình ảnh" class="msg-body-list__item-thumb" src="${data[i].Thumb}" />`;
                        msg += `<span class="ms-2">${data[i].Url}</span>`;
                        msg += `</a>`;
                        msg += `</span>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    }
                } else if (data[i].Type == "text") {
                    if (data[i].FromID != id) {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-received">`;
                        msg += `<div class="d-flex flex-column align-items-start">`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-received mt-2">`;
                        msg += `<span class="item-received__content">${data[i].MessageContent}</span>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    } else {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-sent">`;
                        msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                        msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                        msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-sent mt-2">`;
                        msg += `<span class="item-sent__content">${data[i].MessageContent}</span>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    }
                } else if (data[i].Type == "photo" || data[i].Type == "image") {
                    if (data[i].FromID != id) {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-received">`;
                        msg += `<div class="d-flex flex-column align-items-start">`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-received mt-2">`;
                        msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                        msg += `</div>`;
                        msg += `</li>`;
                    } else {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-sent">`;
                        msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                        msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                        msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-sent mt-2">`;
                        msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                        msg += `</div>`;
                        msg += `</li>`;
                    }
                } else if (data[i].Type == "sticker") {
                    if (data[i].FromID != id) {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-received">`;
                        msg += `<div class="d-flex flex-column align-items-start">`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-received mt-2">`;
                        msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                        msg += `</div>`;
                        msg += `</li>`;
                    } else {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-sent">`;
                        msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                        msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                        msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-sent mt-2">`;
                        msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                        msg += `</div>`;
                        msg += `</li>`;
                    }
                } else if (data[i].Type == "gif") {
                    if (data[i].FromID != id) {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-received">`;
                        msg += `<div class="d-flex flex-column align-items-start">`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-received mt-2">`;
                        msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                        msg += `</div>`;
                        msg += `</li>`;
                    } else {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-sent">`;
                        msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                        msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                        msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-sent mt-2">`;
                        msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                        msg += `</div>`;
                        msg += `</li>`;
                    }
                } else if (data[i].Type == "audio") {
                    if (data[i].FromID != id) {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-received">`;
                        
                        msg += `<div class="d-flex flex-column align-items-start">`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-received mt-2">`;
                        msg += `<audio controls><source src="${data[i].Url}" type="audio/ogg"><source src="${data[i].Url}" type="audio/mpeg"></audio>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    } else {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-sent">`;
                        msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                        msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                        msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-sent mt-2">`;
                        msg += `<audio controls><source src="${data[i].Url}" type="audio/ogg"><source src="${data[i].Url}" type="audio/mpeg"></audio>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    }
                } else if (data[i].Type == "video") {
                    if (data[i].FromID != id) {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-received">`;
                        msg += `<div class="d-flex flex-column align-items-start">`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-received mt-2">`;
                        msg += `<video id="video" width="320" controls="" style="z-index: 9999;">`;
                        msg += `<source src="${data[i].Url}" type="video/mp4">`;
                        msg += `<source src="${data[i].Url}" type="video/ogg"></video>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    } else {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-sent">`;
                        msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                        msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                        msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-sent mt-2">`;
                        msg += `<video id="video" width="320" controls="" style="z-index: 9999;">`;
                        msg += `<source src="${data[i].Url}" type="video/mp4">`;
                        msg += `<source src="${data[i].Url}" type="video/ogg"></video>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    }
                } else if (data[i].Type == "location") {
                    if (data[i].FromID != id) {

                    } else {

                    }
                } else if (data[i].Type == "file") {
                    if (data[i].Description.length > 32) {
                        data[i].Description = (data[i].Description).slice(0, 32) + "...";
                    }

                    if (data[i].FromID != id) {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-received">`;
                        msg += `<div class="d-flex flex-column align-items-start">`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-received mt-2">`;
                        msg += `<span class="item-received__content">Tệp đính kèm:`;
                        msg += `<a class="item-received__link mt-2" target="_blank" href="${data[i].Url}" download>`;
                        msg += `<i class="fa-solid fa-file-arrow-down"></i>`;
                        msg += `<span class="ms-2">${data[i].Description}</span>`;
                        msg += `</a>`;
                        msg += `</span>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    } else {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-sent">`;
                        msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                        msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                        msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-sent mt-2">`;
                        msg += `<span class="item-sent__content">Tệp đính kèm:`;
                        msg += `<a class="item-sent__link mt-2" target="_blank" href="${data[i].Url}" download>`;
                        msg += `<i class="fa-solid fa-file-arrow-down"></i>`;
                        msg += `<span class="ms-2">${data[i].Description}</span>`;
                        msg += `</a>`;
                        msg += `</span>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    }
                }

                if (i > 0) {
                    var time2 = data[i - 1].Time;
                    var dateFormat2 = new Date(Number(time2));
                    var day2 = dateFormat2.getDate();

                    var date = dateFormat2.getDate();
                    if (date < 10) {
                        date = "0" + dateFormat2.getDate();
                    }

                    var hoursDivider = dateFormat2.getHours();
                    if (hoursDivider < 10) {
                        hoursDivider = "0" + dateFormat2.getHours();
                    }

                    var minutesDivider = dateFormat2.getMinutes();
                    if (minutesDivider < 10) {
                        minutesDivider = "0" + dateFormat2.getMinutes();
                    }

                    var dividerDate = hoursDivider +
                        ":" + minutesDivider +
                        " " + date +
                        "/" + (dateFormat2.getMonth() + 1) +
                        "/" + dateFormat2.getFullYear();

                    if (day < day2) {
                        msg += `<li id="divider" style="user-select: none; color: var(--text-color-third);" class="text-center my-4"><span class="divider">${dividerDate}</span></li>`;
                    }
                }
            }

            $(".msg-body-list").append(msg);

            if (pageSizeNew) {
                var container = document.getElementById('messageList');

                container.scrollTop = (((container.scrollHeight) / 100) * 20);
            } else {
                scrollNewMsg();
            }

            $("#totalRecordsMsg").val(rs.paging.TotalRecords);
        } else {
            $("#loader").hide();
            console.log(rs);
            alertError(rs.messVN);
        }
    });
}

/*Search Followers*/
function mainSearch() {
    getFollowers();
}

/*Filter Tag*/
function filterTag() {
    getFollowers();
}

/*Send Messages*/
function sendMessageText(icon) {
    if (icon) {
        var text = document.getElementById('messageValueInput');
        text.value += icon;
    } else {
        var userID = $("#userID").val();
        var messageText = $("#messageValueInput").val();

        if (messageText != null && messageText != "" && messageText != "undefined") {
            if (isValidURL(messageText) == true) {
                /*Message Type Links*/
                var typeMessage = "link";
            } else {
                /*Message Type Text*/
                var typeMessage = "text";
            }

            var message = {
                "url": api_url + "ChatZalo/Intermediary/SendMessages",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify({
                    "followerIDZalo": userID,
                    "typeMessage": typeMessage,
                    "messageContent": messageText
                }),
            };

            /*$("#loader").show();*/

            messageSending();

            $.ajax(message).done(function (rs) {
                if (rs.code == 200) {
                    stopMessageSending();
                    console.log(rs);

                    var msg = "";
                    var data = rs.data;
                    var time = data.time;

                    var timeAfterFormatted = FormatDate(new Date(time), "hh:ss");

                    if (typeMessage == "text") {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-received">`;
                        msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `<img alt="Hình ảnh" class="user-img" src="${data.oaAvatar}" />`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-received mt-2">`;
                        msg += `<span class="item-received__content">${data.messageContent}</span>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    } else {
                        msg += `<li class="msg-body-list__item">`;
                        msg += `<div class="msg-body-list__item-received">`;
                        msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                        msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                        msg += `</div>`;
                        msg += `<img alt="Hình ảnh" class="user-img" src="${data.oaAvatar}" />`;
                        msg += `</div>`;
                        msg += `<div class="msg-body-list__item-received mt-2">`;
                        msg += `<span class="item-received__content">${data.messageContent}`;
                        msg += `<a class="item-received__link mt-2" target="_blank" href="${data.messageContent}">`;
                        msg += `<img alt="Hình ảnh" class="msg-body-list__item-thumb" src="${data.imageURL}" />`;
                        msg += `<span class="ms-2">${data.messageContent}</span>`;
                        msg += `</a>`;
                        msg += `</span>`;
                        msg += `</div>`;
                        msg += `</li>`;
                    }

                    $("#messageList").append(msg);
                    $("#messageValueInput").val("");
                    $("#messageValueInput").focus();
                    getFollowers();
                    scrollNewMsg();
                } else {
                    stopMessageSending();
                    console.log(rs);
                    alertError(rs.messVN);
                }
            });
        } else {
            return;
        }
    }
}

$(document).on('keypress', function (e) {
    if (e.which == 13) {
        sendMessageText();
    }
});

/*Upload Image*/
function uploadImage() {
    var form = new FormData();
    form.append("file", $("#fileImage")[0].files[0]);

    $("#loader").show();

    $.ajax({
        url: api_url + 'ChatZalo/Intermediary/Upload/Image',
        type: 'POST',
        data: form,
        cache: false,
        contentType: false,
        processData: false,
        success: function (rs) {
            if (rs.code == "0") {
                $("#loader").hide();
                console.log(rs);
                var data = rs.data;
                sendImageAfterUploaded(data);
            } else {
                $("#loader").hide();
                console.log(rs);
                alertError(rs.messVN);
            }
        }
    });
}

/*Send Image*/
function sendImageAfterUploaded(attachmentID) {
    var userID = $("#userID").val();

    var message = {
        "url": api_url + "ChatZalo/Intermediary/SendMessages",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify({
            "followerIDZalo": userID,
            "typeMessage": "image",
            "messageContent": attachmentID
        }),
    };

    $("#loader").show();

    $.ajax(message).done(function (rs) {
        if (rs.code == 200) {
            $("#loader").hide();
            console.log(rs);
            $("#fileImage").val("");
            closeUploadImage();
        } else {
            $("#loader").hide();
            console.log(rs);
            alertError(rs.messVN);
        }
    });
}

function uploadFile() {
    var form = new FormData();
    form.append("file", $("#file")[0].files[0]);

    $("#loader").show();

    $.ajax({
        url: api_url + 'ChatZalo/Intermediary/Upload/File',
        type: 'POST',
        data: form,
        cache: false,
        contentType: false,
        processData: false,
        success: function (rs) {
            if (rs.code == "0") {
                $("#loader").hide();
                console.log(rs);
                var data = rs.data;
                sendFileAfterUploaded(data);
            } else {
                $("#loader").hide();
                console.log(rs);
                alertError(rs.messVN);
            }
        }
    });
}

/*Send File*/
function sendFileAfterUploaded(tokenUploaded) {
    var userID = $("#userID").val();
    var message = {
        "url": api_url + "ChatZalo/Intermediary/SendMessages",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify({
            "followerIDZalo": userID,
            "typeMessage": "file",
            "messageContent": tokenUploaded
        }),
    };

    $("#loader").show();

    $.ajax(message).done(function (rs) {
        if (rs.code == 200) {
            $("#loader").hide();
            console.log(rs);
            $("#file").val("");
            closeUploadFile();
        } else {
            $("#loader").hide();
            console.log(rs);
            alertError(rs.messVN);
        }
    });
}

/*Get Message New*/
function getMsgNew(id) {
    var message = {
        "url": api_url + "ChatZalo/GetMsgNew",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify({
            "followerIDZalo": id
        }),
    };

    $.ajax(message).done(function (rs) {
        if (rs.code == 200) {
            var msg = "";
            var data = rs.data;
            var dataLength = data.length;

            if (dataLength > 0) {
                getFollowers();
                console.log(rs);

                for (var i = (dataLength - 1); i >= 0; i--) {
                    var time = data[i].Time;
                    var dateFormat = new Date(Number(time));

                    var minutes = dateFormat.getMinutes();
                    var day = dateFormat.getDate();

                    if (minutes < 10) {
                        minutes = "0" + dateFormat.getMinutes();
                    }

                    var hours = dateFormat.getHours();
                    if (hours < 10) {
                        hours = "0" + dateFormat.getHours();
                    }

                    var timeAfterFormatted = hours +
                        ":" + minutes;

                    if (data[i].Type == "nosupport") {
                        if (data[i].FromID != id) {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-received">`;
                            msg += `<div class="d-flex flex-column align-items-start">`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-received mt-2">`;
                            msg += `<span class="item-received__content">Loại tin nhắn không hỗ trợ</span>`;
                            msg += `</div>`;
                            msg += `</li>`;
                        } else {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-sent">`;
                            msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                            msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                            msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-sent mt-2">`;
                            msg += `<span class="item-sent__content">Loại tin nhắn không hỗ trợ</span>`;
                            msg += `</div>`;
                            msg += `</li>`;
                        }
                    } else if (data[i].Type == "link" || data[i].Type == "links") {
                        if (data[i].FromID != id) {
                            
                        } else {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-sent">`;
                            msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                            msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                            msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-sent mt-2">`;
                            msg += `<span class="item-sent__content">${data[i].Description}`;
                            msg += `<a class="item-sent__link mt-2" target="_blank" href="${data[i].Url}">`;
                            msg += `<img alt="Hình ảnh" class="msg-body-list__item-thumb" src="${data[i].Thumb}" />`;
                            msg += `<span class="ms-2">${data[i].Url}</span>`;
                            msg += `</a>`;
                            msg += `</span>`;
                            msg += `</div>`;
                            msg += `</li>`;
                        }
                    } else if (data[i].Type == "text") {
                        if (data[i].FromID != id) {
                            
                        } else {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-sent">`;
                            msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                            msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                            msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-sent mt-2">`;
                            msg += `<span class="item-sent__content">${data[i].MessageContent}</span>`;
                            msg += `</div>`;
                            msg += `</li>`;
                        }
                    } else if (data[i].Type == "photo" || data[i].Type == "image") {
                        if (data[i].FromID != id) {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-received">`;
                            msg += `<div class="d-flex flex-column align-items-start">`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-received mt-2">`;
                            msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                            msg += `</div>`;
                            msg += `</li>`;
                        } else {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-sent">`;
                            msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                            msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                            msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-sent mt-2">`;
                            msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                            msg += `</div>`;
                            msg += `</li>`;
                        }
                    } else if (data[i].Type == "sticker") {
                        if (data[i].FromID != id) {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-received">`;
                            msg += `<div class="d-flex flex-column align-items-start">`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-received mt-2">`;
                            msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                            msg += `</div>`;
                            msg += `</li>`;
                        } else {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-sent">`;
                            msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                            msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                            msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-sent mt-2">`;
                            msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                            msg += `</div>`;
                            msg += `</li>`;
                        }
                    } else if (data[i].Type == "gif") {
                        if (data[i].FromID != id) {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-received">`;
                            msg += `<div class="d-flex flex-column align-items-start">`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-received mt-2">`;
                            msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                            msg += `</div>`;
                            msg += `</li>`;
                        } else {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-sent">`;
                            msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                            msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                            msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-sent mt-2">`;
                            msg += `<img alt="Hình ảnh" class="msg-body-list__item-img" src="${data[i].Url}" />`;
                            msg += `</div>`;
                            msg += `</li>`;
                        }
                    } else if (data[i].Type == "audio") {
                        if (data[i].FromID != id) {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-received">`;

                            msg += `<div class="d-flex flex-column align-items-start">`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-received mt-2">`;
                            msg += `<audio controls><source src="${data[i].Url}" type="audio/ogg"><source src="${data[i].Url}" type="audio/mpeg"></audio>`;
                            msg += `</div>`;
                            msg += `</li>`;
                        } else {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-sent">`;
                            msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                            msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                            msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-sent mt-2">`;
                            msg += `<audio controls><source src="${data[i].Url}" type="audio/ogg"><source src="${data[i].Url}" type="audio/mpeg"></audio>`;
                            msg += `</div>`;
                            msg += `</li>`;
                        }
                    } else if (data[i].Type == "video") {
                        if (data[i].FromID != id) {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-received">`;
                            msg += `<div class="d-flex flex-column align-items-start">`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-received mt-2">`;
                            msg += `<video id="video" width="320" controls="" style="z-index: 9999;">`;
                            msg += `<source src="${data[i].Url}" type="video/mp4">`;
                            msg += `<source src="${data[i].Url}" type="video/ogg"></video>`;
                            msg += `</div>`;
                            msg += `</li>`;
                        } else {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-sent">`;
                            msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                            msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                            msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-sent mt-2">`;
                            msg += `<video id="video" width="320" controls="" style="z-index: 9999;">`;
                            msg += `<source src="${data[i].Url}" type="video/mp4">`;
                            msg += `<source src="${data[i].Url}" type="video/ogg"></video>`;
                            msg += `</div>`;
                            msg += `</li>`;
                        }
                    } else if (data[i].Type == "location") {
                        if (data[i].FromID != id) {

                        } else {

                        }
                    } else if (data[i].Type == "file") {
                        if (data[i].Description.length > 32) {
                            data[i].Description = (data[i].Description).slice(0, 32) + "...";
                        }

                        if (data[i].FromID != id) {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-received">`;
                            msg += `<div class="d-flex flex-column align-items-start">`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-received mt-2">`;
                            msg += `<span class="item-received__content">Tệp đính kèm:`;
                            msg += `<a class="item-received__link mt-2" target="_blank" href="${data[i].Url}" download>`;
                            msg += `<i class="fa-solid fa-file-arrow-down"></i>`;
                            msg += `<span class="ms-2">${data[i].Description}</span>`;
                            msg += `</a>`;
                            msg += `</span>`;
                            msg += `</div>`;
                            msg += `</li>`;
                        } else {
                            msg += `<li class="msg-body-list__item">`;
                            msg += `<div class="msg-body-list__item-sent">`;
                            msg += `<img alt="Hình ảnh" class="user-img" src="${data[i].FromAvatar}" />`;
                            msg += `<div class="d-flex flex-column align-items-start mx-3">`;
                            msg += `<span class="item-msg__name">${data[i].FromDisplayName}</span>`;
                            msg += `<span class="item-msg__time">${timeAfterFormatted}</span>`;
                            msg += `</div>`;
                            msg += `</div>`;
                            msg += `<div class="msg-body-list__item-sent mt-2">`;
                            msg += `<span class="item-sent__content">Tệp đính kèm:`;
                            msg += `<a class="item-sent__link mt-2" target="_blank" href="${data[i].Url}" download>`;
                            msg += `<i class="fa-solid fa-file-arrow-down"></i>`;
                            msg += `<span class="ms-2">${data[i].Description}</span>`;
                            msg += `</a>`;
                            msg += `</span>`;
                            msg += `</div>`;
                            msg += `</li>`;
                        }
                    }

                    if (i > 0) {
                        var time2 = data[i - 1].Time;
                        var dateFormat2 = new Date(Number(time2));
                        var day2 = dateFormat2.getDate();

                        var date = dateFormat2.getDate();
                        if (date < 10) {
                            date = "0" + dateFormat2.getDate();
                        }

                        var hoursDivider = dateFormat2.getHours();
                        if (hoursDivider < 10) {
                            hoursDivider = "0" + dateFormat2.getHours();
                        }

                        var minutesDivider = dateFormat2.getMinutes();
                        if (minutesDivider < 10) {
                            minutesDivider = "0" + dateFormat2.getMinutes();
                        }

                        var dividerDate = hoursDivider +
                            ":" + minutesDivider +
                            " " + date +
                            "/" + (dateFormat2.getMonth() + 1) +
                            "/" + dateFormat2.getFullYear();

                        if (day < day2) {
                            msg += `<li style="user-select: none;color: var(--text-color-third);" class="text-center my-4"><span class="divider">${dividerDate}</span></li>`;
                        }
                    }
                }

                $("#messageList").append(msg);
                scrollNewMsg();
                updateStatusOfNewMsg(id);
            }
        } else {
            console.log(rs);
        }
    });
}

/*Follower: Update Status Of New Message*/
function updateStatusOfNewMsg(id) {
    var updateMsg = {
        "url": api_url + "ChatZalo/UpdateStatusMessage",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify({
            "followerIDZalo": id
        }),
    };

    $.ajax(updateMsg).done(function (rs) {
        if (rs.code == 200) {
            console.log(rs);
        } else {
            console.log(rs);
        }
    });
}

/*Load More User*/
function loadMoreUser() {
    var objDiv = document.getElementById("convList");

    if (objDiv.scrollTop != 0) {
        if (objDiv.clientHeight == (objDiv.scrollHeight - objDiv.scrollTop)) {
            var pageSize = $("#pageSizeConv").val();
            var totalRecords = $("#totalRecordsConv").val();
            if (parseInt(pageSize) < parseInt(totalRecords)) {
                var newSize = parseInt(pageSize) + 10;
                $("#pageSizeConv").val(newSize);

                var pageSizeNew = $("#pageSizeConv").val();
                getFollowers(pageSizeNew);
            }
        }
    }
}

/*Load More Message*/
function loadMoreMessage() {
    var objDiv = document.getElementById("messageList");

    if (objDiv.scrollTop == 0) {
        var pageSize = $("#pageSizeMsg").val();
        var totalRecords = $("#totalRecordsMsg").val();

        if (parseInt(pageSize) < parseInt(totalRecords)) {
            var newSize = parseInt(pageSize) + 10;
            $("#pageSizeMsg").val(newSize);

            var pageSizeNew = $("#pageSizeMsg").val();
            var userID = $("#userID").val();
            var name = $("#nameOfUser").val();
            var avatar = $("#avatarOfUser").val();
            var isFollower = $("#isFollower").val();

            getMessagesOfFollower(userID, name, avatar, isFollower, pageSizeNew);
        }
    }
}

/*Scroll New Message*/
function scrollNewMsg() {
    var container = document.getElementById('messageList');

    container.scrollTop = container.scrollHeight;
}

/*Check unread messages*/
function checkUnReadMsg() {
    arrFollower = [];

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
                for (var i = 0; i < dataLength; i++) {
                    var obj = {
                        "ID": data[i]
                    };

                    arrFollower.push(obj);
                }

                if (arrFollower.length > 0) {
                    getFollowers();
                }
            }
        }
    });
}

function updateTagDone() {
    var userID = $("#userID").val();

    if (userID != 0) {
        swal({
            title: "Thông báo",
            text: "Bạn muốn hoàn thành hỗ trợ?",
            icon: "warning",
            buttons: true,
            buttons: ["Hủy", "Đồng ý"],
            dangerMode: true,
        })
            .then((doit) => {
                if (doit) {
                    var update = {
                        "url": api_url + "ChatZalo/Intermediary/UpdateTagDone",
                        "method": "POST",
                        "timeout": 0,
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "data": JSON.stringify({
                            "followerIDZalo": userID
                        }),
                    };

                    $("#loader").show();

                    $.ajax(update).done(function (rs) {
                        if (rs.code == 200) {
                            console.log(rs);

                            $("#userID").val("");

                            setTimeout(function () {
                                getFollowers();
                                $(".chat-content__msg").hide();
                                $("#loader").hide();
                                alertSuccess(rs.messVN);
                            }, 3000);
                        } else {
                            console.log(rs);
                            $("#loader").hide();
                            alertSuccess(rs.messVN);
                        }
                    });
                }
            });
    }
}

/*Sending animation*/
function messageSending() {
    var html = "";

    html += `<li class="msg-body-list__item msg-body-list__item--special">`;
    html += `<div class="msg-body-list__item-received mt-2">`;
    html += `<span class="item-received__content item-received__content--special">`;
    html += `<span style="font-size: 0.875rem;" class="me-2">Đang gửi</span>`;
    html += `<div class="writing-animation">`;
    html += `<div class="writing-animation-line"></div>`;
    html += `<div class="writing-animation-line"></div>`;
    html += `<div class="writing-animation-line"></div>`;
    html += `</span>`;
    html += `</div>`;
    html += `</div>`;
    html += `</li>`;

    $("#messageList").append(html);

    scrollNewMsg();
}

function stopMessageSending() {
    $(".msg-body-list__item--special").remove();

    scrollNewMsg();
}

/*Handler Modal*/
function openUploadImage() {
    $("#modalUploadImage").modal("show");
}

function closeUploadImage() {
    $("#modalUploadImage").modal("hide");
}

function openUploadFile() {
    $("#modalUploadFile").modal("show");
}

function closeUploadFile() {
    $("#modalUploadFile").modal("hide");
}

