
AdvancedFind(1);

function AdvancedFind(pageNo) {
    try {

        var setting = {
            url: api_url + "Admin/OASettingList",
            type: "POST",
            data: {
                PageIndex: pageNo,
                PageSize: 25,
                Keyword: $('#txtKeyword').val(),
            }
        };

        $.ajax(setting).done(function (rs) {

            console.log(rs);

            $('#DataContent').html('');

            if (rs != undefined && rs.Data != undefined) {
                var html = ``;

                for (var i = 0; i < rs.Data.length; i++) {

                    var data = rs.Data[i];

                    html += `<tr>`;

                    html += `<td><input class="form-control form-control-sm txtid" disabled value="${data.id != null ? data.id : ''}" spellcheck="false" autocomplete="off" /></td>`;

                    html += `<td><input class="form-control form-control-sm txttext" disabled value="${data.text != null ? data.text : ''}" spellcheck="false" autocomplete="off" /></td>`;

                    html += `<td>`;
                    //html += `<div class="input-group">`;
                    html += `<input class="form-control form-control-sm txtvalue" value="${data.value != null ? data.value : ''}" spellcheck="false" autocomplete="off" />`;
                    //html += `<button onclick="copy_text(this,'${data.value}')" class="btn btn-icon btn-outline-light"><i class="fas fa-copy"></i></button>`;
                    //html += `</div>`;

                    html += `</td>`;

                    html += `</tr>`;

                }
                var cols = $('#DataContentHeader tr th').length;

                if (rs.Data.length == 0) html = `<tr><td colspan="${cols}">No data to display</td></tr>`;

                $('#DataContent').html(html);

                $('#TotalRecords').text(rs.Paging.TotalRecords)
            }


        });

    } catch (e) {

    }

}

function Save() {
    try {

        var btn = $('.btn-save').html();
        var btn_loading = $('.btn-loading').html();
        $('.btn-save').html(btn_loading);

        var list_oa_setting = [];

        $('#DataContent tr').each(function () {

            list_oa_setting.push({
                id: $(this).find('.txtid').val(),
                value: $(this).find('.txtvalue').val(),
            });

        });

        var setting = {
            url: api_url + "Admin/OASettingUpdate",
            type: "POST",
            data: { list_oa_setting: list_oa_setting }
        };
        $.ajax(setting).done(function (rs) {
            if (rs.Error != undefined) {
                AlertError(rs.Error);
            }
            if (rs.Success != undefined) {
                AlertSuccess(rs.Success);
            }
            $('.btn-save').html(btn);
            on_load_page_default();
        });

    } catch (e) {

    }
}

function on_load_page_default() {

    try { 
        $('#DataContentAdd').html('');
        $('#txtKeyword').val('');
        $('.ck-row').prop('checked', false);
        $('.ck-all').prop('checked', false);
        $('#ckApprovedAll').prop('checked', true);
        $('.btn-close').click();
        AdvancedFind(1);

    } catch (e) {

    }
}
 
function format_date_dd_mm_yyyy_hh_mm_ss(date) {
    if (date == null) return '';
    date = new Date(date);

    var dateFM = ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
        + '-' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1)))
        + '-' + date.getFullYear()
        + ' ' + (date.getHours() > 9 ? date.getHours() : '0' + date.getHours())
        + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes())
        + ':' + (date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds());

    return dateFM;
}


function copy_text(button, text) {
     


    var copyText = document.getElementById("hdfCopyText");
    copyText.value = text;
    copyText.select();
    copyText.setSelectionRange(0, 9999999); 

    document.execCommand("copy");

    var btnHTML = $(button).html();
    var btnOK = $('.btn-ok').html();

    $(button).html(btnOK)

    setTimeout(function () { $(button).html(btnHTML); }, 1000);

}




function FirstPage() {
    AdvancedFind(1);
}
function PreviousPage() {

    var pageNo = parseInt($('#PageIndex').text());
    pageNo = pageNo - 1;
    AdvancedFind(pageNo);
}
function NextPage() {
    var pageNo = parseInt($('#PageIndex').text());
    pageNo = pageNo + 1;
    AdvancedFind(pageNo);
}
function LastPage() {

    var totalPages = parseInt($('#TotalPages').text());
    AdvancedFind(totalPages);
}
