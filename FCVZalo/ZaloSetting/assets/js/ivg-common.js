
 
var api_url = window.location.origin + '/api/';

var common_guid_empty = '00000000-0000-0000-0000-000000000000';

var common_login_url = window.location.origin + '/ZaloSetting/app/login/login.html';
var common_index_url = window.location.origin + '/ZaloSetting';

function SelectAll() {

}

function FormatNumberCommas(value) {
    return value
}



function common_get_login_info() {
    if (localStorage.getItem("currentUser") != null) {
        var Data = JSON.parse(localStorage.getItem("currentUser"));
        console.log('GetUserLogin', Data);
        //$('#lblDisplayName').text(Data.Name);
    }
    else {
        window.location.href = common_login_url;
    }
}



function common_local_get_myid() {
    if (localStorage.getItem("currentUser") != null) {
        var Data = JSON.parse(localStorage.getItem("currentUser"));
        return Data.guid;
    }
    else {
        return common_guid_empty;
    }
}

function common_local_get_myname() {
    if (localStorage.getItem("currentUser") != null) {
        var Data = JSON.parse(localStorage.getItem("currentUser"));
        var firstName = Data.firstName != null ? Data.firstName : '';
        var lastName = Data.lastName != null ? Data.lastName : '';
        var value = firstName + ' ' + lastName;
        $('#lblDisplayName').text(value);
        return value;
    }
    else {
        return '';
    }
}



function common_local_get_myuser() {
    if (localStorage.getItem("currentUser") != null) {
        var Data = JSON.parse(localStorage.getItem("currentUser"));
        return Data.userName;
    }
    else {
        return '';
    }
}
 

function common_required_textbox() {

    var isError = false;
    $('.form-control').each(function () {
        $(this).removeClass('is-invalid');
        if ($(this).prop('required') && $(this).val() == '') {
            $(this).addClass('is-invalid');
            if (!isError) isError = true;
        }
    });

    return isError;
}



function common_check_valid_field(textbox) {
    $('#' + textbox).removeClass('is-invalid')
    $('.' + textbox).removeClass('is-invalid')

    if ($('#' + textbox).val() == '' || $('.' + textbox).val() == '') {
        $('#' + textbox).addClass('is-invalid')
        $('.' + textbox).addClass('is-invalid')
    }
}




function Loading(selector, visible) {
    document.querySelector(selector).style.display = visible ? 'block' : 'none';
}

function ShowLoading() {
    Loading('#loading', true);
}

function HideLoading() {
    Loading('#loading', false);
}




function common_format_date(date, fm) {
    date = new Date(date);
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

        if (fm == "dd-mm-yyyy hh:mm") {
            var dateFm = ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '-' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + date.getFullYear() + ' ' + (date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes());
            return dateFm;
        }

        if (fm == "dd-mm-yyyy hh:mm:ss") {
            var dateFm = ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
                + '-' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1)))
                + '-' + date.getFullYear()
                + ' ' + (date.getHours() > 9 ? date.getHours() : '0' + date.getHours())
                + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes())
                + ':' + (date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds());
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
 


function common_close_modal() {
    $('.btn-close').click();
}
 

function common_select_all(checkbox) {
    $('.ck-row').prop('checked',$(checkbox).prop('checked'))
}