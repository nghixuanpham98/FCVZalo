
var today = new Date();

AdvancedFind(1);

function AdvancedFind(pageNo) {
    try {

       
        if ($('#txtFrom').val() == '') $('#txtFrom').val(format_date_yyyy_mm_dd(today,1))
        if ($('#txtTo').val() == '') $('#txtTo').val(format_date_yyyy_mm_dd(today))

        var setting = {
            url: api_url + "Admin/RequestQueueList",
            type: "POST",
            data: {
                PageIndex: pageNo,
                PageSize: 25,
                Keyword: $('#txtKeyword').val(),
                From: $('#txtFrom').val(),
                To: $('#txtTo').val(),
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

                    html += `<td>${data.phone != null ? data.phone : ''}</td>`;
                    html += `<td style="word-break: break-all;">${data.output != null ? data.output : ''}</td>`;
                    html += `<td class="text-center">${data.insert_time != null ? format_date_dd_mm_yyyy_hh_mm_ss(data.insert_time) : ''}</td>`;
                    html += `<td class="text-center">${data.done_time != null ? format_date_dd_mm_yyyy_hh_mm_ss(data.done_time) : ''}</td>`;

                    html += `</tr>`;

                }

                var cols = $('#DataContentHeader tr th').length;

                if (rs.Data.length == 0) html = `<tr><td colspan="${cols}">No data to display</td></tr>`;

                $('#DataContent').html(html);


                if (rs.Paging != undefined) {

                    $('#PageIndex').text(rs.Paging.PageIndex)
                    $('#TotalPages').text(rs.Paging.TotalPages > 0 ? rs.Paging.TotalPages : 0)
                    $('#TotalRecords').text(FormatNumberCommas(rs.Paging.TotalRecords))
                }
            }


        });

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


function format_date_yyyy_mm_dd(date, firstDay) {
    if (date == null) return '';
    date = new Date(date);
    firstDay = firstDay != undefined ? true : false;
    var dateFM = '';

    if (firstDay)
        dateFM = date.getFullYear()
            + '-' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-01';
    else
        dateFM = date.getFullYear()
            + '-' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1)))
            + '-' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()));

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
