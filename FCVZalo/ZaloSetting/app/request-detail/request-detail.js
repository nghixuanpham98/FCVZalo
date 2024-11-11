
AdvancedFind(1);

function AdvancedFind(pageNo, RequestID) {
    try {
        ShowLoading();

        var queryString = window.location.search;
        var urlParams = new URLSearchParams(queryString);

        RequestID = RequestID != undefined ? RequestID : ($('#hdfID').val() == '' ? urlParams.get('RequestID') : $('#hdfID').val());


        var data = {
            ID: RequestID,
            PageIndex: pageNo,
            PageSize: $('#PageSize').val(),
            Keyword: $('#txtKeyword').val(),

            StartDate: $('#txtStartDate').val(),
            EndDate: $('#txtEndDate').val(),
            OrderByColumn: $('#hdfColName').val(),
            OrderByDirection: $('#hdfOrderBy').val(),
        };
        $.ajax({
            url: api_url + 'Admin/CampaignDetailByRequestID',
            type: "POST",
            data: data,
            success: function (rs) {
                $('#hdfID').val(RequestID);

                HideLoading();
                console.log(`CampaignDetailByRequestID`, rs);

                $('#tbl_Data').html('');

                if (rs.Data != undefined) {

                    for (var i = 0; i < rs.Data.length; i++) {
                        var data = rs.Data[i];
                        var html = ``;
                        html += `<tr>`;

                        //html += `<td>${data.SFID != null ? data.SFID : ''}</td>`;
                        html += `<td class="text-center">${data.MobilePhone != null ? data.MobilePhone : ''}</td>`;
                        //html += `<td>${data.Phone != null ? data.Phone : ''}</td>`;
                        //html += `<td>${data.ZCC_Zalo_ID__c != null ? data.ZCC_Zalo_ID__c : ''}</td>`;

                        html += `<td class="text-center">${data.IsApproved == true ? '<i class="far fa-check-circle text-success"></i>' : ''}</td>`;
                        html += `<td class="text-center">${data.ExpiredOn != null ? common_format_date(data.ExpiredOn, 'dd-mm-yyyy hh:mm:ss') : ''}</td>`;

                        html += `<td>${data.LastSendCode != null ? data.LastSendCode : ''} - ${data.LastSendMsg != null ? data.LastSendMsg : ''}</td>`;
                        html += `<td class="text-center">${data.LastSendOn != null ? common_format_date(data.LastSendOn, 'dd-mm-yyyy hh:mm:ss') : ''}</td>`;

                        html += `<td>${data.LastCheckCode != null ? data.LastCheckCode : ''} - ${data.LastCheckMsg != null ? data.LastCheckMsg : ''}</td>`;
                        html += `<td class="text-center">${data.LastCheckOn != null ? common_format_date(data.LastCheckOn, 'dd-mm-yyyy hh:mm:ss') : ''}</td>`;

                        html += `</tr>`;

                        $('#tbl_Data').append(html);

                    }
                }


                if (rs.Paging != undefined) {

                    $('#PageIndex').text(rs.Paging.PageIndex)
                    $('#TotalPages').text(rs.Paging.TotalPages > 0 ? rs.Paging.TotalPages : 0)
                    $('#TotalRecords').text(FormatNumberCommas(rs.Paging.TotalRecords))
                }


                if (rs.requestInfo != undefined) {
                    var req = rs.requestInfo;
                    $('#lblRequestName').text(req.Name);
                }

                //if (rs.ThongKeTrangThai != undefined) {
                //    var summary = rs.ThongKeTrangThai;
                //    $('#TotalRecords').text(summary.Total);
                //    $('#TotalSent').text(summary.Sent);
                //    $('#TotalApproved').text(summary.Approved);
                //    $('#TotalReject').text(summary.Reject);
                //    $('#TotalOther').text(summary.Other);
                //}

                LoadSummary(rs.liCheck,1)
                LoadSummary(rs.liSend)

                $('#ddlCampaign').html('');
                $('#ddlCampaign').append(`<option value="00000000-0000-0000-0000-000000000000">--Tất cả--</option>`);
                if (rs.liRequest != undefined) {
                    for (var i = 0; i < rs.liRequest.length; i++) {
                        var data = rs.liRequest[i];

                        $('#ddlCampaign').append(`<option value="${data.ID}">${data.Name}</option>`);
                    }

                    if (RequestID != null && RequestID != undefined) {
                        $('#ddlCampaign').val(RequestID);
                    }
                }
                $('#ddlCampaign').select2();
                $('#ddlCampaign').css('width','100%');
                
            }
        });
    } catch (e) {
        console.log(e); HideLoading();
        $('#DataTable').scrollTop(0);

    }
}

function LoadSummary(data, isCheck) {
    isCheck = isCheck != undefined ? true : false;
    if (isCheck)
        $('#tbl_SummaryCheck').html('');
    else $('#tbl_SummarySend').html('');

    if (data != undefined && data.length > 0) {
        for (var i = 0; i < data.length; i++) {

            var html = ``;
            html += `<tr>`;
            html += `<td>${data[i].Code != null ? data[i].Code : ''}</td>`;
            html += `<td>${data[i].Msg != null ? data[i].Msg : ''}</td>`;
            html += `<td>${data[i].Total != null ? data[i].Total : ''}</td>`;
            html += `</tr>`;

            if (isCheck) {
                $('#tbl_SummaryCheck').append(html);
            }
            else {
                $('#tbl_SummarySend').append(html);

            }
        }
    }
}

 
function LoadSummaryDetail(data) {

    $('#tbl_SummaryDetail').html('');

    if (data != undefined && data.length > 0) {
        for (var i = 0; i < data.length; i++) {

            var html = ``;
            html += `<tr>`;
            html += `<td>${data[i].Code != null ? data[i].Code : ''}</td>`;
            html += `<td>${data[i].Msg != null ? data[i].Msg : ''}</td>`;
            html += `<td>${data[i].Total != null ? data[i].Total : ''}</td>`;
            html += `</tr>`;
            $('#tbl_SummaryDetail').append(html);
        }
    }
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




function send_manual() {
    try {

        ShowLoading();

        var RequestID = $('#hdfID').val();

        $.ajax({
            url: api_url + 'CRM/gui_yeu_cau_goi',
            type: "POST",
            data: { ID: RequestID },
            success: function (rs) {

                HideLoading(); 
                AdvancedFind(1);

            }
        });
    } catch (e) { console.log(e); HideLoading(); }

}



function check_manual() {
    try {

        ShowLoading();

        var RequestID = $('#hdfID').val();

        $.ajax({
            url: api_url + 'CRM/kiem_tra_yeu_cau_goi',
            type: "POST",
            data: { ID: RequestID },
            success: function (rs) {

                HideLoading();
                AdvancedFind(1);

            }
        });
    } catch (e) { console.log(e); HideLoading(); }

}

