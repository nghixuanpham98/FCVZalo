
AdvancedFind(1);
function AdvancedFind(pageNo, IsExport) {
    try {
        IsExport = IsExport != undefined ? true : false;
        ShowLoading();
        var data = {
            PageIndex: pageNo,
            PageSize: $('#PageSize').val(),
            Keyword: $('#txtKeyword').val(),

            StartDate: $('#txtStartDate').val(),
            EndDate: $('#txtEndDate').val(),
            OrderByColumn: $('#hdfColName').val(),
            OrderByDirection: $('#hdfOrderBy').val(),
            CallListID: $('#ddlCallList option:selected').val(),
            IsExport: IsExport,
        };
        $.ajax({
            url: api_url + 'Admin/CallListView',
            type: "POST",
            data: data,
            success: function (rs) {
                HideLoading();
                console.log(rs);
                 
                //export excel 
                if (rs.fileName != undefined) {
                    var downloadLink = document.createElement("a");
                    document.body.appendChild(downloadLink);
                    downloadLink.href = rs.fileSrc;
                    downloadLink.download = rs.fileName;
                    downloadLink.click();
                }
                else {
                    if ($('#hdfCallListId').val() != $('#ddlCallList option:selected').val()) {
                        $('#hdfCallListId').val($('#ddlCallList option:selected').val());
                    }

                    $('#ddlCallList').html('');
                    //draw master data 
                    if (rs.CallList != undefined) {

                        $('#ddlCallList').append(`<option value="00000000-0000-0000-0000-000000000000">--Tất cả--</option>`);
                        var currentId = $('#hdfCallListId').val();
                        for (var i = 0; i < rs.CallList.length; i++) {
                            var data = rs.CallList[i];
                            var selected = currentId == data.CallListId ? 'selected' : '';
                            $('#ddlCallList').append(`<option ${selected} value="${data.CallListId}">${data.Subject}</option>`);
                        }
                    }

                    $('#tblHead').html('');
                    $('#tblHead').append('<tr class="text-center">');
                    $('#tblHead').append('<th>Call List</th>');
                    $('#tblHead').append('<th>Priority</th>');
                    $('#tblHead').append('<th>Cust.Salesforce ID</th>');
                    $('#tblHead').append('<th>Cust.Full Name</th>');
                    $('#tblHead').append('<th>Cust.Phone</th>');
                    $('#tblHead').append('<th>Cust.Address</th>');
                    $('#tblHead').append('<th>Cust.Birth Date</th>');
                    $('#tblHead').append('<th>Task Subject</th>');
                    $('#tblHead').append('<th>Call Ring</th>');
                    $('#tblHead').append('<th>Call Connect</th>');
                    $('#tblHead').append('<th>Call End</th>');
                    $('#tblHead').append('<th>Call Last Try</th>');
                    $('#tblHead').append('<th>IVR Disconnected Reason</th>');
                    $('#tblHead').append('</tr>');


                    $('#tblBody').html('');

                    if (rs.Data != undefined) {
                        for (var i = 0; i < rs.Data.length; i++) {
                            var data = rs.Data[i];

                            var html = ``;
                            html += `<tr>`;
                            html += `<td>${data.CallListName != null ? data.CallListName : ''}</td>`;
                            html += `<td>${data.Priority != null ? data.Priority : ''}</td>`;
                            html += `<td>${data.CusSFId != null ? data.CusSFId : ''}</td>`;
                            html += `<td>${data.CusFullName != null ? data.CusFullName : ''}</td>`;
                            html += `<td>${data.CusMobilePhone != null ? data.CusMobilePhone : ''}</td>`;
                            html += `<td>${data.CusAddress != null ? data.CusAddress : ''}</td>`;
                            html += `<td>${data.CusBirthDate != null ? data.CusBirthDate : ''}</td>`;
                            html += `<td>${data.TaskSubject != null ? data.TaskSubject : ''}</td>`;
                            html += `<td>${data.CallRing != null ? data.CallRing : ''}</td>`;
                            html += `<td>${data.CallConnect != null ? data.CallConnect : ''}</td>`;
                            html += `<td>${data.CallEnd != null ? data.CallEnd : ''}</td>`;
                            html += `<td>${data.CallLastTry != null ? data.CallLastTry : ''}</td>`;
                            html += `<td>${data.IVRDisconnectedReason != null ? data.IVRDisconnectedReason : ''}</td>`;
                            html += `</tr>`;

                            $('#tblBody').append(html);
                        }
                    }

                    if (rs.Paging != undefined) {

                        $('#PageIndex').text(rs.Paging.PageIndex)
                        $('#TotalPages').text(rs.Paging.TotalPages > 0 ? rs.Paging.TotalPages : 0)
                        $('#TotalRecords').text(FormatNumberCommas(rs.Paging.TotalRecords))
                    }
                }
            }
        });
    } catch (e) { console.log(e); HideLoading(); }
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
