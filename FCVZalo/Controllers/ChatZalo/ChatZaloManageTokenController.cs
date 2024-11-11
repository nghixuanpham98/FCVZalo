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
    public class ChatZaloManageTokenController : ApiController
    {
        DBContext db = new DBContext();

        #region Update Token
        [HttpPost]
        [Route("api/ChatZalo/Token/Update")]

        public IHttpActionResult updateToken(ParameterModel parameters)
        {
            try
            {
                var item = new tbl_ChatZaloSettings();

                var accessToken = db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "access_token");
                var refreshToken = db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "refresh_token");

                accessToken.value = parameters.accessToken;
                accessToken.expires_in = parameters.expiresIn;
                accessToken.modified_on = DateTime.Now;

                refreshToken.value = parameters.refreshToken;
                refreshToken.modified_on = DateTime.Now;

                db.SaveChanges();

                var rs = new
                {
                    code = CodeMess.Code.Success,
                    messVN = Language.VN.alert_update_success
                };

                return Json(rs);
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

        #region Get Config App
        [HttpGet]
        [Route("api/ChatZalo/GetConfigApp")]

        public IHttpActionResult getConfigApp()
        {
            try
            {
                var accessToken = db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "access_token");

                var refreshToken = db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "refresh_token");

                var appName = db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "app_name");

                var appID = db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "app_id");

                var secretKey = db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "secret_key");

                var url = db.tbl_ChatZaloSettings.FirstOrDefault(x => x.text == "url");

                var rs = new
                {
                    app = new
                    {
                        appName = appName.value,
                        appID = appID.value,
                        secretKey = secretKey.value,
                        url = url.value
                    },
                    token = new
                    {
                        accessToken = accessToken.value,
                        refreshToken = refreshToken.value
                    },
                    code = CodeMess.Code.Success
                };
                return Json(rs);
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
    }
}
