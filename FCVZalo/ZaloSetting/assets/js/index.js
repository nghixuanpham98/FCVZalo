

index_access_page();
function index_access_page(page) {
    var url = '';
    var random = Math.random();
    $('.nav-item').removeClass('active');
    switch (page) {
        case 'promotion':
            url = 'app/promotion/promotion.html';
            $('.nav-item').removeClass('active');
            break;
        case 'cau-hinh':
        case 'tai-khoan':
        case 'webhook':
        case 'call-list':
            url = `app/${page}/${page}.html?ver=${random}`;
            $('.nav-item').removeClass('active');
            page = 'cau-hinh';
            $('.nav-item').removeClass('active');
            break; 
        default:
            page = 'request'
            url = 'app/request/request.html?ver=' + random;
            break;
    }
    $('.' + page).addClass('active');
    $('#frmPage').attr('src', url);
}

onCheckLogin()
function onCheckLogin() {
    if (localStorage.getItem("currentUser") != null) {

        //tuy có session nhưng kiểm tra session này hết hạn login 1 ngày chưa 
        var Data = JSON.parse(localStorage.getItem("currentUser"));
        console.log('GetUserLogin', Data);
        $('#lblDisplayName').text(Data.firstName + ' ' + Data.lastName);

        var today = new Date();
        var d1 = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();


        var last = new Date(Data.lastLoginDate);
        var d2 = last.getFullYear() + '-' + (last.getMonth() + 1) + '-' + last.getDate();

        if (d1 != d2) Logout();

    }
    else {
        window.location.href = common_login_url;
    }
}


function Logout() {
    localStorage.removeItem("currentUser");
    onCheckLogin();

}
























/* ================================================================================================ */
function setVisible(selector, visible) {
    document.querySelector(selector).style.display = visible ? 'block' : 'none';
}

$('.select2').select2();

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();
});
function GridResize() {
    var h = window.innerHeight;
    var w = window.innerWidth;
    document.getElementById('ivgTable').style.maxHeight = h - 120 + 'px';
    document.getElementById('ivgTable').style.overflow = 'auto';
}

function onReady(callback) {
    var intervalId = window.setInterval(function () {
        if (document.getElementsByTagName('body')[0] !== undefined) {
            window.clearInterval(intervalId);
            callback.call(this);
        }
    }, 1000);
}
 
onReady(function () {
    setVisible('#loading', false);
});

function AlertSuccess(msg) {
    $('#msgAlertSuccess').html(msg);
    $('#modalAlertSuccess').modal("show");
    setTimeout(function () {
        $('#modalAlertSuccess').modal("hide");
    }, 3000);
}

function AlertWarning(msg) {
    $('#msgAlertWarning').html(msg);
    $('#modalAlertWarning').modal("show");
    setTimeout(function () {
        $('#modalAlertWarning').modal("hide");
    }, 3000);
}