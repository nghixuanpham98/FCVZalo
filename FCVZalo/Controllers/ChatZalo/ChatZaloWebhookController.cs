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
using Newtonsoft.Json.Linq;
using System.Data.SqlClient;
using System.Configuration;
using System.Reflection;

namespace FCVZalo.Controllers.ChatZalo
{
    public class ChatZaloWebhookController : ApiController
    {
        DBContext db = new DBContext();

        public static DateTime ConvertNumberToDateTime(long input)
        {

            try
            {
                long beginTicks = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).Ticks;

                return new DateTime(beginTicks + input * 10000, DateTimeKind.Utc);
            }
            catch { return new DateTime(); }
        }

        #region Get webhook
        [HttpPost]
        [Route("api/ChatZalo/Webhook")]

        public IHttpActionResult webhook()
        {
            try
            {
                var bodyStream = new StreamReader(HttpContext.Current.Request.InputStream);
                bodyStream.BaseStream.Seek(0, SeekOrigin.Begin);
                var bodyText = bodyStream.ReadToEnd();
                var jsonConvert = (JObject)JsonConvert.DeserializeObject(bodyText);

                var eventName = jsonConvert["event_name"].Value<string>();
                var timeStamp = jsonConvert["timestamp"].Value<string>();

                string connectionString = ConfigurationManager.ConnectionStrings["DBContext"].ConnectionString;
                SqlConnection connection = new SqlConnection(@connectionString);
                String query = "INSERT INTO dbo.tbl_ChatZaloWebhook" +
                    " (ID,EventName,TimeReceived,ResponseContent,eventtime,status)" +
                    " VALUES (@ID,@EventName,@TimeReceived,@ResponseContent,@eventtime,@status)";
                SqlCommand command = new SqlCommand(query, connection);

                command.Parameters.AddWithValue("@ID", Guid.NewGuid());
                command.Parameters.AddWithValue("@EventName", eventName);
                command.Parameters.AddWithValue("@TimeReceived", timeStamp);
                command.Parameters.AddWithValue("@ResponseContent", JsonConvert.SerializeObject(jsonConvert));
                command.Parameters.AddWithValue("@eventtime", DateTime.Now);
                command.Parameters.AddWithValue("@status", 0);

                try
                {
                    connection.Open();
                    command.ExecuteNonQuery();
                    DAO.DAOCommon.WriteLogWebhook(JsonConvert.SerializeObject(jsonConvert));
                }
                catch (SqlException e)
                {
                    DAO.DAOCommon.WriteLogWebhook("Error Generated. Details: " + e.ToString());
                }
                finally
                {
                    connection.Close();
                }

                var rs = new
                {
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
