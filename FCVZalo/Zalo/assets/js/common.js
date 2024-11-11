
$(document).ready(function () {
    checkUpdateCache();

    try {
        toastr.options.showMethod = "slideDown";
        toastr.options.hideMethod = "slideUp";
        toastr.options.closeMethod = "slideUp";
        toastr.options.progressBar = true;
        toastr.options.rtl = true;
        toastr.options.positionClass = "toast-bottom-right";
    } catch (e) {
        console.log(e);
    }
});

/*Choose Platform For Chat*/
function choosePlatform(m) {
    var rd = Math.random();
    $(".nav-list__item-block").removeClass('nav-list__item-block--active');

    switch (m) {
        case 'zalo-chat':
            $("#zaloChat").addClass('nav-list__item-block--active');
            document.getElementById('ivg-content').src = 'app/zalo-chat/zalo-chat.html?ver=' + rd;
            break;
        default:
            $("#zaloChat").addClass('nav-list__item-block--active');
            var src = 'zalo-chat/zalo-chat.html?ver=' + rd;
            $("#ivg-content").attr("src", src);
    }
}

/*Local Storage : Get item*/
function storageGetItem(itemname) {
    return parent.window.localStorage.getItem(itemname);
}

/*Local Storage : Remove item*/
function storageRemoveItem(itemname) {
    parent.window.localStorage.removeItem(itemname);
}

/*Format*/
function formatNumber(n) {
    try {
        var x = Math.round(n * 100) / 100;

        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    } catch (e) {
        return n;
    }
}

function FormatDate(date, fm) {
    try {
        if (fm == "yyyy-mm-dd") {
            var dateFm = + date.getFullYear() + '-' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()));

            return dateFm;
        }

        if (fm == "yyyy-mm-dd hh:ss") {
            var dateFm = + date.getFullYear() + '-' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + ' ' + (date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes());

            return dateFm;
        }

        if (fm == "mm-dd-yyyy") {
            var dateFm = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '-' + date.getFullYear();
            return dateFm;
        }

        if (fm == "mm-dd-yyyy hh:ss") {
            var dateFm = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '-' + date.getFullYear() + ' ' + (date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes());
            return dateFm;
        }


        if (fm == "dd-mm-yyyy") {
            var dateFm = ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '-' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + date.getFullYear();
            return dateFm;
        }

        if (fm == "dd-mm-yyyy hh:ss") {
            var dateFm = ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '-' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + date.getFullYear() + ' ' + (date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes());
            return dateFm;
        }

        if (fm == "dd-mm") {
            var dateFm = ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '-' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1)));
            return dateFm;
        }

        if (fm == "hh:ss") {
            var dateFm = ((date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()));
            return dateFm;
        }

        return date.toLocaleString();
    } catch (e) {

        return date;
    }
}

function timeSince(seconds) {
    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " năm trước";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " tháng trước";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " ngày trước";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " giờ trước";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " phút trước";
    }
    return Math.floor(seconds) + " giây trước";
}

function timeSinceSpecial(seconds) {
    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " năm";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " tháng";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " ngày";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " giờ";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " phút";
    }
    return "< 1 phút";
}

/*Check String Is a Url*/
function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};

/*Check empty or white space*/
function checkEmptyOrWhiteSpace(str) {
    return (str.match(/^\s*$/) || []).length > 0;
}

/*Cache*/
function checkUpdateCache() {
    try {
        if (window.applicationCache != undefined && window.applicationCache != null) {
            window.applicationCache.addEventListener('updateready', updateApplication);
        }
    } catch (e) {

    }
}

function updateApplication(event) {
    try {
        if (window.applicationCache.status != 4) return;
        window.applicationCache.removeEventListener('updateready', updateApplication);
        window.applicationCache.swapCache();
        window.location.reload();

    } catch (e) {

    }
}

/*Create Guid*/
function generateUUID() {
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function IsEmptyOrWhiteSpace(str) {
    return (str.match(/^\s*$/) || []).length > 0;
}

/*Alert*/
function alertError(message) {
    try {
        toastr.error("", message, { timeOut: 3000 });
    } catch (e) {
        console.log(e);
        alert(message);
    }
}

function alertSuccess(message) {
    try {
        toastr.success("", message, { timeOut: 3000 });
    } catch (e) {
        console.log(e);
        alert(message);
    }
}

function alertSuccessSpecial(message) {
    try {
        toastr.success("", message, { timeOut: 5000 });
    } catch (e) {
        console.log(e);
        alert(message);
    }
}

function alertWarrning(message) {
    try {
        toastr.warning("", message, { timeOut: 3000 });
    } catch (e) {
        console.log(e);
        alert(message);
    }
}