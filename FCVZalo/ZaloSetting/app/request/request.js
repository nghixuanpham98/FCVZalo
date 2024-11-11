
AdvancedFind(1);
function AdvancedFind(pageNo) {
    try {
        ShowLoading();
        var data = {
            PageIndex: pageNo,
            PageSize: $('#PageSize').val(),
            Keyword: $('#txtKeyword').val(),

            StartDate: $('#txtStartDate').val(),
            EndDate: $('#txtEndDate').val(),
            OrderByColumn: $('#hdfColName').val(),
            OrderByDirection: $('#hdfOrderBy').val(),
        };
        $.ajax({
            url: api_url + 'Admin/CampaignRequest',
            type: "POST",
            data: data,
            success: function (rs) {
                HideLoading();
                console.log(rs);

                $('#tbl_Data').html('');

                if (rs.Data != undefined) {

                    for (var i = 0; i < rs.Data.length; i++) {
                        var data = rs.Data[i];
                        var btnEdit = `<button class="btn btn-sm btn-outline-secondary" onclick="Detail('${data.ID}')"><i class="fas fa-pen"></i></button>`;
                        var btnList = `<button class="btn btn-sm btn-outline-secondary" onclick="ListDetailByID('${data.ID}')"><i class="fas fa-users"></i></button>`;

                        var   iconActive = `<i class="far fa-square fa-2x text-secondary" onclick="ActiveRequest('${data.ID}',1)"></i>`;
                        if (data.IsActive == true)
                            iconActive = `<i class="far fa-check-square fa-2x text-success" onclick="ActiveRequest('${data.ID}')"></i>`;

                        var html = ``;
                        html += `<tr>`;
                        html += `<td class="text-center"><input type="checkbox" data-id="${data.ID}" class="ck-row" /></td>`;
                        html += `<td>${btnEdit} ${data.Name != null ? data.Name : ''}</td>`;
                        html += `<td>${data.SendOn != null ? common_format_date(data.SendOn, 'dd-mm-yyyy') : ''}</td>`;
                        //html += `<td>${data.LastSendOn != null ? data.LastSendOn : ''}</td>`;
                        //html += `<td>${data.LastLoadData != null ? data.LastLoadData : ''}</td>`;
                        html += `<td class="text-center">${iconActive}</td>`;
                        html += `<td>${data.ModifiedOn != null ? common_format_date(data.ModifiedOn, 'dd-mm-yyyy hh:mm:ss') : ''}</td>`;
                        html += `<td>${data.TotalRequest != null ? data.TotalRequest : ''}</td>`;

                        html += `<td class="text-center">${btnList}</td>`;
                        html += `</tr>`;

                        $('#tbl_Data').append(html);


                    }

                }


                if (rs.Paging != undefined) {

                    $('#PageIndex').text(rs.Paging.PageIndex)
                    $('#TotalPages').text(rs.Paging.TotalPages > 0 ? rs.Paging.TotalPages : 0)
                    $('#TotalRecords').text(FormatNumberCommas(rs.Paging.TotalRecords))
                }
            }
        });
    } catch (e) { console.log(e); HideLoading(); }
}


function ListDetailByID(ID) {
    var rnd = Math.random();

    var src = window.location.origin + `/ZaloSetting/app/request-detail/request-detail.html?RequestID=${ID}&ver=${rnd}`;

    $('#frmPage', parent.document).attr('src', src);
}


function ActiveRequest(ID, isActive) {

    try {

        isActive = isActive != undefined ? true : false;

        if (isActive) {
            var cf = confirm('Kích hoạt yêu cầu gửi?');
            if (cf) {

                ShowLoading();

                $.ajax({
                    url: api_url + 'Admin/CampaignRequestActive',
                    type: "POST",
                    data: { ID: ID, IsActive: true },
                    success: function (rs) {

                        HideLoading();
                        if (rs.Success != undefined) {
                            AlertSuccess(rs.Success);
                            AdvancedFind(1);
                        }
                        else if (rs.Error != undefined) {
                            $('#lblError').text(rs.Error);
                        }
                    }

                });

            }
        }
        else {
            var cf = confirm('HỦY Kích hoạt yêu cầu gửi?');
            if (cf) {
                ShowLoading();

                $.ajax({
                    url: api_url + 'Admin/CampaignRequestActive',
                    type: "POST",
                    data: { ID: ID, IsActive: false },
                    success: function (rs) {

                        HideLoading();
                        if (rs.Success != undefined) {
                            AlertSuccess(rs.Success);
                            AdvancedFind(1);
                        }
                        else if (rs.Error != undefined) {
                            $('#lblError').text(rs.Error);
                        }
                    }

                });
            }
        }

    } catch (e) {

    }

}

function Detail(ID) {
    try {
        ShowLoading();
        $.ajax({
            url: api_url + 'Admin/CampaignRequestByID',
            type: "POST",
            data: { ID: ID },
            success: function (rs) {
                HideLoading();
                ResetForm();

                if (rs.Data != undefined) {
                    var data = rs.Data;

                    $('#lblTitleDetail').text(`Cập nhật [${data.Name}]`);

                    $('#hdfID').val(data.ID);
                    $('#txtName').val(data.Name);
                    $('#txtViewName').val(data.ViewName);
                    $('#txtSQLQuery').val(data.SqlQuery);

                    $('#txtDescription').val(data.Description);
                    $('#txtSendOn').val(data.SendOn != null ? common_format_date(data.SendOn, 'yyyy-mm-dd') : '');
                    $('#txtLastSendOn').val();
                    $('#txtLastLoadData').val();

                    $('#lblExecResult').text();
                    $('#ckActive').prop('checked', data.IsActive == true ? true : false);
                    $('#btnModalDetail').click();
                }
                else if (rs.Error != undefined) {
                    AlertError(rs.Error);
                }

            }

        });


    } catch (e) {

    }
}

function ResetForm() {
    try {

        $('#hdfID').val('');
        $('#txtName').val('');
        $('#txtViewName').val('');
        $('#txtSQLQuery').val('');

        $('#txtDescription').val('');
        $('#txtSendOn').val('');
        $('#txtLastSendOn').val('');
        $('#txtLastLoadData').val('');

        $('#lblExecResult').text('');
        $('#ckActive').prop('checked', false);


    } catch (e) {

    }
}

function New() {

    try {
        ResetForm();

        $('#lblTitleDetail').text(`Thêm mới thông tin`);

        $('#btnModalDetail').click();

    } catch (e) {

    }
}

function Save() {
    try {
        if (!common_required_textbox()) {

            ShowLoading();

            var data = {

                myId: common_local_get_myid(),
                request: {

                    ID: $('#hdfID').val(),
                    Name: $('#txtName').val(),
                    ViewName: $('#txtViewName').val(),
                    SqlQuery: $('#txtSQLQuery').val(),

                    Description: $('#txtDescription').val(),
                    SendOn: $('#txtSendOn').val(),
                    LastSendOn: $('#txtLastSendOn').val(),
                    LastLoadData: $('#txtLastLoadData').val(),

                    IsActive: $('#ckActive').prop('checked')
                }
            }

            $.ajax({
                url: api_url + 'Admin/CampaignRequestUpdate',
                type: "POST",
                data: data,
                success: function (rs) {
                    HideLoading();
                    if (rs.Success != undefined) {
                        AlertSuccess(rs.Success);
                        common_close_modal();
                        AdvancedFind(1);
                    }
                    else if (rs.Error != undefined) {
                        $('#lblError').text(rs.Error);
                    }
                }
            });
        }
    } catch (e) { }
}

function Delete(isConfirm) {
    try {

        isConfirm = isConfirm != undefined ? true : false;

        if (!isConfirm) {
            $('#btnModalConfirm').click();
        }
        else {

            ShowLoading();

            var data = [];

            $('.ck-row').each(function () {
                if ($(this).prop('checked')) {
                    data.push($(this).attr('data-id'));
                }
            });
            console.log(data)
            $.ajax({
                url: api_url + 'Admin/CampaignRequestDelete',
                type: "POST",
                data: { ListGuid: data },
                success: function (rs) {
                    HideLoading();
                    if (rs.Success != undefined) {
                        AlertSuccess(rs.Success)
                    }
                    else if (rs.Error != undefined) {
                        AlertError(rs.Error)
                    }
                    common_close_modal();
                    AdvancedFind(1);
                }

            });
        }

    } catch (e) {

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
