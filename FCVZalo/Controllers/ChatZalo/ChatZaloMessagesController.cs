using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using FCVZalo.Models.EntityModels;
using Newtonsoft.Json;
using FCVZalo.Models.CustomModels;
using FCVZalo.DAO;
using System.Web;
using System.IO;

namespace FCVZalo.Controllers.ChatZalo
{
    public class ChatZaloMessagesController : ApiController
    {
        DBContext db = new DBContext();

        #region Get all Message from Zalo and save in db
        [HttpPost]
        [Route("api/ChatZalo/GetAllMsgFromZalo")]

        public IHttpActionResult getAllMsgFromZalo(tbl_ChatZaloMessages entity)
        {
            try
            {
                var item = new tbl_ChatZaloMessages();
                var itemDetails = new tbl_ChatZaloMessageDetails();

                var message = db.tbl_ChatZaloMessages.FirstOrDefault(x => x.ID == entity.ID);

                if (message == null)
                {
                    item.ID = entity.ID;
                    item.Src = entity.Src;
                    item.Time = entity.Time;
                    item.Type = entity.Type;
                    item.MessageContent = entity.MessageContent;
                    item.Links = entity.Links;
                    item.Thumb = entity.Thumb;
                    item.Url = entity.Url;
                    item.Description = entity.Description;
                    item.FromID = entity.FromID;
                    item.FromDisplayName = entity.FromDisplayName;
                    item.FromAvatar = entity.FromAvatar;
                    item.ToID = entity.ToID;
                    item.ToDisplayName = entity.ToDisplayName;
                    item.ToAvatar = entity.ToAvatar;
                    item.Location = entity.Location;
                    item.IsRecent = entity.IsRecent;

                    db.tbl_ChatZaloMessages.Add(item);
                    db.SaveChanges();


                    var checkMsgDetails = db.tbl_ChatZaloMessageDetails
                        .FirstOrDefault(x => x.MessageID == entity.ID);

                    var entityFormat = JsonConvert.SerializeObject(entity);
                    if (checkMsgDetails != null)
                    {
                        checkMsgDetails.Response = entityFormat;

                        db.SaveChanges();
                    }
                    else {
                        itemDetails.ID = Guid.NewGuid();
                        itemDetails.MessageID = entity.ID;
                        itemDetails.UserID = null;
                        itemDetails.Request = null;
                        itemDetails.Response = entityFormat;
                        itemDetails.CreatedOn = DateTime.Now;
                        itemDetails.CreatedBy = Guid.Empty;
                        itemDetails.ModifiedOn = DateTime.Now;
                        itemDetails.ModifiedBy = Guid.Empty;

                        db.tbl_ChatZaloMessageDetails.Add(itemDetails);
                        db.SaveChanges();
                    }

                    var rs = new
                    {
                        code = CodeMess.Code.Success,
                        messVN = Language.VN.alert_create_success
                    };

                    return Json(rs);
                }
                else
                {
                    var rs = new
                    {
                        code = CodeMess.Code.Invalid_ID,
                        messVN = Language.VN.alert_al_exists_msg
                    };
                    return Json(rs);
                }
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region Create new Messages
        [HttpPost]
        [Route("api/ChatZalo/CreateMessages")]

        public IHttpActionResult createMessages(Messages entity)
        {
            try
            {
                var item = new tbl_ChatZaloMessages();
                var itemDetails = new tbl_ChatZaloMessageDetails();

                var checkMessage = db.tbl_ChatZaloMessages
                    .OrderByDescending(x => x.Time)
                    .FirstOrDefault(x => (x.FromID == entity.FollowerID) || x.ToID == entity.FollowerID);

                if (Convert.ToDouble(entity.Time) > Convert.ToDouble(checkMessage.Time))
                {
                    item.ID = entity.ID;
                    item.Src = entity.Src;
                    item.Time = entity.Time;
                    item.Type = entity.Type;
                    item.MessageContent = entity.MessageContent;
                    item.Links = entity.Links;
                    item.Thumb = entity.Thumb;
                    item.Url = entity.Url;
                    item.Description = entity.Description;
                    item.FromID = entity.FromID;
                    item.FromDisplayName = entity.FromDisplayName;
                    item.FromAvatar = entity.FromAvatar;
                    item.ToID = entity.ToID;
                    item.ToDisplayName = entity.ToDisplayName;
                    item.ToAvatar = entity.ToAvatar;
                    item.Location = entity.Location;
                    item.IsRecent = entity.IsRecent;

                    db.tbl_ChatZaloMessages.Add(item);
                    db.SaveChanges();

                    var checkMsgDetails = db.tbl_ChatZaloMessageDetails
                        .FirstOrDefault(x => x.MessageID == entity.ID);

                    var entityFormat = JsonConvert.SerializeObject(entity);
                    if (checkMsgDetails != null)
                    {
                        checkMsgDetails.Response = entityFormat;

                        db.SaveChanges();
                    }
                    else
                    {
                        itemDetails.ID = Guid.NewGuid();
                        itemDetails.MessageID = entity.ID;
                        itemDetails.UserID = null;
                        itemDetails.Request = null;
                        itemDetails.Response = entityFormat;
                        itemDetails.CreatedOn = DateTime.Now;
                        itemDetails.CreatedBy = Guid.Empty;
                        itemDetails.ModifiedOn = DateTime.Now;
                        itemDetails.ModifiedBy = Guid.Empty;

                        db.tbl_ChatZaloMessageDetails.Add(itemDetails);
                        db.SaveChanges();
                    }

                    var rs = new
                    {
                        code = CodeMess.Code.Success,
                        messVN = Language.VN.alert_create_success
                    };

                    return Json(rs);
                }
                else
                {
                    var rs = new
                    {
                        code = CodeMess.Code.Invalid_ID,
                        messVN = Language.VN.alert_al_exists_msg
                    };
                    return Json(rs);
                }
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region Get All Message By FollowerID
        [HttpPost]
        [Route("api/ChatZalo/GetAllMsgByFollower")]

        public IHttpActionResult getAllMsgByFollower(ParameterModel parameters)
        {
            try
            {
                var messages = db.tbl_ChatZaloMessages
                    .Where(x => (x.FromID == parameters.followerIDZalo)
                    || (x.ToID == parameters.followerIDZalo))
                    .OrderByDescending(x => x.Time)
                    .ToList();

                if (messages.Count > 0 && messages != null)
                {
                    var count = messages.Count();
                    int TotalCount = count;
                    int CurrentPage = parameters.pageIndex;
                    int PageSize = parameters.pageSize;
                    int TotalPages = (int)Math.Ceiling(count / (double)PageSize);
                    var items = messages.Skip((CurrentPage - 1) * PageSize).Take(PageSize).ToList();

                    var rs = new
                    {
                        data = items,
                        paging = new
                        {
                            PageIndex = CurrentPage,
                            PageSize = PageSize,
                            TotalRecords = TotalCount,
                            TotalPages = TotalPages,
                        },
                        code = CodeMess.Code.Success
                    };
                    return Json(rs);
                }
                else
                {
                    var rs = new
                    {
                        code = CodeMess.Code.Invalid_Data,
                        messVN = Language.VN.alert_notFoundData
                    };
                    return Json(rs);
                }
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region Check msg list recent from zalo
        [HttpPost]
        [Route("api/ChatZalo/CheckMsgListRecent")]

        public IHttpActionResult checkMsgListRecent(tbl_ChatZaloMessages entity)
        {
            try
            {
                var checkFollower = db.vw_ChatZaloUsers
                    .FirstOrDefault(x => ((x.UserID == entity.FromID) 
                    || (x.UserID == entity.ToID))
                    && (x.IsFollower == true));

                if (checkFollower != null)
                {
                    var rs = new
                    {
                        user = "Follower",
                        data = checkFollower.UserID,
                        code = CodeMess.Code.Success
                    };
                    return Json(rs);
                }
                else
                {
                    var checkOA = db.tbl_ChatZaloOAInfo
                    .FirstOrDefault(x => x.ID == entity.FromID);

                    if (checkOA != null)
                    {
                        var rs = new
                        {
                            user = "OA",
                            data = entity.ToID,
                            code = CodeMess.Code.Success
                        };
                        return Json(rs);
                    }
                    else
                    {
                        var rs = new
                        {
                            user = "Anonymous",
                            data = entity.FromID,
                            code = CodeMess.Code.Success
                        };
                        return Json(rs);
                    }
                }

            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region Get Message New
        [HttpPost]
        [Route("api/ChatZalo/GetMsgNew")]

        public IHttpActionResult getMsgNew(ParameterModel entity)
        {
            try
            {
                var msg = db.tbl_ChatZaloMessages
                    .Where(x => ((x.FromID == entity.followerIDZalo) || (x.ToID == entity.followerIDZalo))
                    && (x.IsRecent == true))
                    .OrderByDescending(x => x.Time)
                    .ToList();

                if (msg != null)
                {
                    var rs = new
                    {
                        data = msg,
                        code = CodeMess.Code.Success
                    };
                    return Json(rs);
                }
                else
                {
                    var rs = new
                    {
                        code = CodeMess.Code.Invalid_Data,
                        messVN = Language.VN.alert_notFoundData
                    };
                    return Json(rs);
                }

            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region Update Status of Message New
        [HttpPost]
        [Route("api/ChatZalo/UpdateStatusMessage")]

        public IHttpActionResult updateStatusMessage(ParameterModel entity)
        {
            try
            {
                var msg = db.tbl_ChatZaloMessages
                    .Where(x => ((x.FromID == entity.followerIDZalo) || (x.ToID == entity.followerIDZalo))
                    && (x.IsRecent == true))
                    .ToList();

                if (msg != null && msg.Count() > 0)
                {
                    foreach (var item in msg)
                    {
                        item.IsRecent = false;
                        db.SaveChanges();
                    }

                    var rs = new
                    {
                        code = CodeMess.Code.Success,
                        messVN = Language.VN.alert_update_success
                    };
                    return Json(rs);
                }
                else
                {
                    var rs = new
                    {
                        code = CodeMess.Code.Invalid_Data,
                        messVN = Language.VN.alert_notFoundData
                    };
                    return Json(rs);
                }
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        #region Check unread messages
        [HttpGet]
        [Route("api/ChatZalo/CheckUnReadMessages")]

        public IHttpActionResult checkUnReadMessages()
        {
            try
            {
                var checkUserList = db.vw_ChatZaloCheckUnReadMessages
                    .OrderByDescending(x => x.Time)
                    .Select(x => x.UserID)
                    .ToList();

                if (checkUserList != null && checkUserList.Count() > 0)
                {
                    var rs = new
                    {
                        data = checkUserList,
                        code = CodeMess.Code.Success
                    };
                    return Json(rs);
                }
                else {
                    var rs = new
                    {
                        code = CodeMess.Code.Invalid_Data,
                        messVN = Language.VN.alert_notFoundData
                    };
                    return Json(rs);
                }
            }
            catch (Exception ex)
            {
                var rs = new
                {
                    err = ex.Message,
                    code = CodeMess.Code.Exception,
                    messVN = Language.VN.alert_Exception
                };
                return Json(rs);
            }
        }
        #endregion

        public class Messages
        {
            public string FollowerID { get; set; }

            public string ID { get; set; }

            public int? Src { get; set; }

            public string Time { get; set; }

            public string Type { get; set; }

            public string MessageContent { get; set; }

            public string Links { get; set; }

            public string Thumb { get; set; }

            public string Url { get; set; }

            public string Description { get; set; }

            public string FromID { get; set; }

            public string FromDisplayName { get; set; }

            public string FromAvatar { get; set; }

            public string ToID { get; set; }

            public string ToDisplayName { get; set; }

            public string ToAvatar { get; set; }

            public string Location { get; set; }

            public bool? IsRecent { get; set; }

        }
    }
}