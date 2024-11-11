using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.ServiceProcess;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Timers;

namespace FCVZaloService
{
    public partial class Service1 : ServiceBase
    {
        #region -- Configuration --

        #region -- Timer --

        Timer timerResetToken = new Timer();
        Timer timerScanOA = new Timer();
        Timer timerScanFollowers = new Timer();
        Timer timerScanMessages = new Timer();
        //Timer timerScanRequestConsent = new Timer();
        //Timer timerScanWebhook = new Timer();
        //Timer timerScanCheckConsent = new Timer();

        #endregion

        public Service1()
        {
            InitializeComponent();
        }

        #region -- On Start --

        protected override void OnStart(string[] args)
        {
            WriteToFile("Service is started at " + DateTime.Now);
            Zalo.Init();
            GetAccessTokenFromRefreshToken(0);

            // Reset Refresh Token every 3000000 miliseconds
            timerResetToken.Elapsed += new ElapsedEventHandler(OnElapsedTimeResetToken);
            timerResetToken.Interval = Settings1.Default.scheduleTimeResetToken; //number in miliseconds  
            timerResetToken.Enabled = true;

            // Get Followers every 180000 miliseconds
            timerScanFollowers.Elapsed += new ElapsedEventHandler(OnElapsedTimeScanFollowers);
            timerScanFollowers.Interval = Settings1.Default.scheduleTimeScanUsers; //number in miliseconds  
            timerScanFollowers.Enabled = true;

            // Scan OA
            timerScanOA.Elapsed += new ElapsedEventHandler(OnElapsedTimeScanOA);
            timerScanOA.Interval = Settings1.Default.scheduleTimeScanOA; //number in miliseconds  
            timerScanOA.Enabled = true;

            //// Scan Check Consent every 300000 miliseconds
            //timerScanCheckConsent.Elapsed += new ElapsedEventHandler(OnElapsedTimeCheckConsent);
            //timerScanCheckConsent.Interval = Settings1.Default.scheduleTimeScanCheckConsent; //number in miliseconds  
            //timerScanCheckConsent.Enabled = true;

            //// Scan Request Consent every 300000 miliseconds
            //timerScanRequestConsent.Elapsed += new ElapsedEventHandler(OnElapsedTimeRequestConsent);
            //timerScanRequestConsent.Interval = Settings1.Default.scheduleTimeScanRequestConsent;
            ////timerScanRequestConsent.Enabled = Settings1.Default.turnOnRequestConsent;
            //timerScanRequestConsent.Enabled =true;
        }

        #endregion

        #region -- On Stop --

        protected override void OnStop()
        {
            WriteToFile("Service is stopped at " + DateTime.Now);
        }

        #endregion

        #region -- Class --

        public class Zalo
        {

            public static string CodeVerifier;

            public static string CodeChallenge;

            public static string apiUrl = Settings1.Default.apiUrl;

            public static string ivgUrl = Settings1.Default.ivgUrl;

            public static string followerID = "";

            public static double timeScanConvRecent = 0;

            public static void Init()
            {
                CodeVerifier = GenerateNonce();
                CodeChallenge = GenerateCodeChallenge(CodeVerifier);
            }

            private static string GenerateNonce()
            {
                const string chars = "abcdefghijklmnopqrstuvwxyz123456789";
                var random = new Random();
                var nonce = new char[128];
                for (int i = 0; i < nonce.Length; i++)
                {
                    nonce[i] = chars[random.Next(chars.Length)];
                }

                return new string(nonce);
            }

            private static string GenerateCodeChallenge(string codeVerifier)
            {
                var sha256 = SHA256.Create();
                var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(codeVerifier));
                var b64Hash = Convert.ToBase64String(hash);
                var code = Regex.Replace(b64Hash, "\\+", "-");
                code = Regex.Replace(code, "\\/", "_");
                code = Regex.Replace(code, "=+$", "");
                return code;
            }


            public static List<int> IsApprovedCode = new List<int> { 0, 1 };

            public static DateTime ConvertNumberToDateTime(long input)
            {

                try
                {
                    long beginTicks = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).Ticks;

                    return new DateTime(beginTicks + input * 10000, DateTimeKind.Utc);
                }
                catch { return new DateTime(); }
            }

            public static void update_expired_consent(List<string> list_phone_approved, string request_id)
            {
                try
                {
                    string output = "", error = "";

                    for (int i = 0; i < list_phone_approved.Count; i++)
                    {
                        var phone = list_phone_approved[i].Trim();
                        var phone_org = phone;
                        var input = new { phone = phone.StartsWith("0") ? "84" + phone.Remove(0, 1) : phone };

                        var zalo = new ZaloParams()
                        {
                            access_token = OA_Info.access_token(),
                            content_type = "application/json",

                            method = "GET",
                            url = ZaloUrl.url_checkconsent + JsonConvert.SerializeObject(input),
                        };

                        output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);




                        if (string.IsNullOrEmpty(error))
                        {
                            var outputJS = JsonConvert.DeserializeObject<output_msg>(output);

                            if (outputJS.data != null && outputJS.data.expired_time.HasValue)
                            {
                                outputJS.data.expired_time_dt = ConvertNumberToDateTime(outputJS.data.expired_time.Value);
                            }

                            var today = DateTime.Now;

                            string connectionString = Settings1.Default.connectionString;
                            SqlConnection connection = new SqlConnection(@connectionString);

                            String query = "UPDATE TOP (1) dbo.tbl_ChatZaloRequestDetails" +
                            " SET IsApproved = @IsApproved, ExpiredOn = @ExpiredOn" +
                            " WHERE RequestID = @RequestID AND MobilePhone = @MobilePhone";

                            SqlCommand command = new SqlCommand(query, connection);

                            command.Parameters.AddWithValue("@IsApproved", outputJS.data != null && outputJS.data.expired_time_dt.HasValue ? true : false);
                            command.Parameters.AddWithValue("@ExpiredOn", outputJS.data != null ? outputJS.data.expired_time_dt : null);
                            command.Parameters.AddWithValue("@RequestID", request_id);
                            command.Parameters.AddWithValue("@MobilePhone", phone);

                            try
                            {
                                connection.Open();
                                command.ExecuteNonQuery();
                            }
                            catch (SqlException e)
                            {
                                //WriteToFile("Error Generated. Details: " + e.ToString());
                            }
                            finally
                            {
                                connection.Close();
                            }
                        }
                    }
                }
                catch
                {

                }
            }

        }

        public class output_data
        {
            public long? expired_time { get; set; }
            public DateTime? expired_time_dt { get; set; }
        }

        public class output_msg
        {
            public output_data data { get; set; }
            public int? error { get; set; }
            public string message { get; set; }
        }

        public class OA_Info
        {
            public static DataTable ConnectDB(string Query)
            {
                var connectionString = Settings1.Default.connectionString;
                SqlConnection connection = new SqlConnection(connectionString);
                connection.Open();

                try
                {
                    SqlCommand cmd = new SqlCommand(Query, connection);
                    cmd.CommandType = CommandType.Text;
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    if (connection != null && connection.State == ConnectionState.Open)
                        connection.Close();
                    return dt;
                }
                catch (Exception ex)
                {
                    connection.Close();
                    return null;
                }
            }

            public static string access_token()
            {
                var output = "";
                try
                {
                    var data = ConnectDB("SELECT [value] FROM [tbl_ChatZaloSettings] WHERE text = 'access_token'");
                    output = data != null && data.Rows.Count == 1 ? data.Rows[0][0].ToString() : "";
                }
                catch { }
                return output;
            }

            public static string refresh_token()
            {
                var output = "";
                try
                {
                    var data = ConnectDB("SELECT [value] FROM [tbl_ChatZaloSettings] WHERE text = 'refresh_token'");
                    output = data != null && data.Rows.Count == 1 ? data.Rows[0][0].ToString() : "";
                }
                catch { }
                return output;
            }

            public static string app_id()
            {
                var output = "";
                try
                {
                    var data = ConnectDB("SELECT [value] FROM [tbl_ChatZaloSettings] WHERE text = 'app_id'");
                    output = data != null && data.Rows.Count == 1 ? data.Rows[0][0].ToString() : "";
                }
                catch { }
                return output;
            }

            public static string secret_key()
            {
                var output = "";
                try
                {
                    var data = ConnectDB("SELECT [value] FROM [tbl_ChatZaloSettings] WHERE text = 'secret_key'");
                    output = data != null && data.Rows.Count == 1 ? data.Rows[0][0].ToString() : "";
                }
                catch { }
                return output;
            }
        }

        public class ZaloParams
        {
            public string secret_key { get; set; }
            public string refresh_token { get; set; }
            public string app_id { get; set; }
            public string access_token { get; set; }
            public string url { get; set; }
            public string method { get; set; }
            public string content_type { get; set; }
            public string input { get; set; }
            public string output { get; set; }
            public string error { get; set; }
            public string file_base { get; set; }
            public string file_type { get; set; }
            public string file_name { get; set; }
            public bool? isImage { get; set; }
            public bool? isAttach { get; set; }
            public bool? isAccess { get; set; }
        }

        public class ZaloIntermadiary
        {
            public static string API_Intermadiary(ZaloParams zalo, ref string error)
            {
                string output = "";
                try
                {
                    var IVGZaloApiUrl = Zalo.ivgUrl;

                    if (zalo.isAttach == true)
                        IVGZaloApiUrl = IVGZaloApiUrl + "ZaloFile";

                    else if (zalo.isAccess == true)
                        IVGZaloApiUrl = IVGZaloApiUrl + "ZaloAccess";

                    else IVGZaloApiUrl = IVGZaloApiUrl + "Zalo";


                    var req = (HttpWebRequest)WebRequest.Create(IVGZaloApiUrl);
                    req.Method = "POST";
                    req.ContentType = "application/json";

                    using (var streamWriter = new StreamWriter(req.GetRequestStream()))
                    {
                        string json = JsonConvert.SerializeObject(zalo);
                        streamWriter.Write(json);
                    }

                    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                                     | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                    ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                    using (var req1 = req.GetResponse())
                    {
                        using (var reader = new StreamReader(req1.GetResponseStream()))
                        {
                            output = reader.ReadToEnd();
                        }
                    }

                    output = !string.IsNullOrEmpty(output) ? JsonConvert.DeserializeObject<string>(output) : output;
                }
                catch (Exception ex)
                {
                    error = ex.Message;
                    output = "";
                }
                return output;
            }
        }

        public class ZaloUrl
        {
            public static string getInfoOA = "https://openapi.zalo.me/v2.0/oa/getoa";

            public static string url_request_consent = "https://openapi.zalo.me/v2.0/oa/call/requestconsent";

            public static string url_checkconsent = "https://openapi.zalo.me/v2.0/oa/call/checkconsent?data=";
        }

        #endregion

        #region -- Write Log --

        public void WriteToFile(string Message)
        {
            string path = AppDomain.CurrentDomain.BaseDirectory + "\\Logs";
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            string filepath = AppDomain.CurrentDomain.BaseDirectory + "\\Logs\\ServiceLog_" + DateTime.Now.Date.ToShortDateString().Replace('/', '_') + ".txt";
            if (!File.Exists(filepath))
            {
                // Create a file to write to.   
                using (StreamWriter sw = File.CreateText(filepath))
                {
                    sw.WriteLine(Message);
                }
            }
            else
            {
                using (StreamWriter sw = File.AppendText(filepath))
                {
                    sw.WriteLine(Message);
                }
            }
        }

        #endregion

        #endregion

        #region -- Functions --

        #region -- Schedule --

        // Reset Refresh Token every 3000000 miliseconds
        private void OnElapsedTimeResetToken(object source, ElapsedEventArgs e)
        {
            GetAccessTokenFromRefreshToken(1);
        }

        // Get Followers every 180000 miliseconds
        private void OnElapsedTimeScanFollowers(object source, ElapsedEventArgs e)
        {
            GetOAInformation();
            ScanFollowersFromZalo(0, 50);
        }

        // Get Messages every 60000 miliseconds
        private void OnElapsedTimeScanMessages(object source, ElapsedEventArgs e)
        {
            ScanConversationRecent(0, 10);
        }

        // Scan and Handle Webhook every 1000 miliseconds
        //private void OnElapsedTimeScanWebhook(object source, ElapsedEventArgs e)
        //{
        //    ScanWebhook();
        //}

        // Scan Check Consent every 300000 miliseconds
        //private void OnElapsedTimeCheckConsent(object source, ElapsedEventArgs e)
        //{
        //    CheckConsent();
        //}

        // Scan Request Consent every 300000 miliseconds
        private void OnElapsedTimeRequestConsent(object source, ElapsedEventArgs e)
        {
            if (Settings1.Default.turnOnRequestConsent)
            {
                RequestConsent();
            }
        }

        private void OnElapsedTimeScanOA(object source, ElapsedEventArgs e)
        {
            GetOAInformation();
        }

        #endregion

        #region -- Get Access Token From Refresh Token --

        public void GetAccessTokenFromRefreshToken(int checkAccessTokenExist)
        {
            string output = "";
            string error = "";
            try
            {
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                      | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                // Skip validation of SSL/TLS certificate
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                var client = new RestClient(Zalo.apiUrl + "test");
                client.Timeout = -1;
                var request = new RestRequest(Method.GET);
                request.AddHeader("Content-Type", "application/json");
                IRestResponse response = client.Execute(request);

                WriteToFile("here: " + response.Content);

                var zalo = new ZaloParams()
                {
                    isAccess = true,
                    app_id = OA_Info.app_id(),
                    refresh_token = OA_Info.refresh_token(),
                    secret_key = OA_Info.secret_key(),
                };

                output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);

                if (!string.IsNullOrEmpty(error))
                {
                    WriteToFile(DateTime.Now + " - GetAccessTokenFromRefreshToken Error: " + error);
                }

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var expiresIn = jsonConvert["expires_in"].Value<string>();
                    var access_token = jsonConvert["access_token"].Value<string>();
                    var refresh_token = jsonConvert["refresh_token"].Value<string>();

                    WriteToFile(DateTime.Now + " - AccessToken: " + access_token);
                    WriteToFile(DateTime.Now + " - RefreshToken: " + refresh_token);

                    UpdateAccessToken(access_token, expiresIn);

                    UpdateRefreshToken(refresh_token);

                    if (checkAccessTokenExist == 0)
                    {
                        GetOAInformation();
                        GetFollowersFromZalo(0, 50);
                        GetConversationRecent(0, 10);

                        timerScanMessages.Elapsed += new ElapsedEventHandler(OnElapsedTimeScanMessages);
                        timerScanMessages.Interval = Settings1.Default.scheduleTimeScanMessages; //number in miliseconds  
                        timerScanMessages.Enabled = true;

                        //timerScanWebhook.Elapsed += new ElapsedEventHandler(OnElapsedTimeScanWebhook);
                        //timerScanWebhook.Interval = Settings1.Default.scheduleTimeScanWebhook; //number in miliseconds  
                        //timerScanWebhook.Enabled = true;
                    }
                    else
                    {
                        WriteToFile(DateTime.Now + " - Not the first time run!");
                    }
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - GetAccessTokenFromRefreshToken Error: " + ex.Message);
            }
        }

        #endregion

        #region -- Update Access Token From Refresh Token --

        public void UpdateAccessToken(string accessToken, string expiresIn)
        {
            try
            {
                string connectionString = Settings1.Default.connectionString;
                SqlConnection connection = new SqlConnection(@connectionString);

                String query = "UPDATE dbo.tbl_ChatZaloSettings" +
                    " SET value = @value, expires_in = @expires_in, modified_on = @modified_on" +
                    " WHERE text = 'access_token'";

                SqlCommand command = new SqlCommand(query, connection);

                command.Parameters.AddWithValue("@value", accessToken);
                command.Parameters.AddWithValue("@expires_in", expiresIn);
                command.Parameters.AddWithValue("@modified_on", DateTime.Now);

                try
                {
                    connection.Open();
                    command.ExecuteNonQuery();
                }
                catch (SqlException e)
                {
                    WriteToFile("Error Generated. Details: " + e.ToString());
                }
                finally
                {
                    connection.Close();
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - UpdateAccessToken Error: " + ex.Message);
            }
        }

        public void UpdateRefreshToken(string refreshToken)
        {
            try
            {
                string connectionString = Settings1.Default.connectionString;
                SqlConnection connection = new SqlConnection(@connectionString);

                String query = "UPDATE dbo.tbl_ChatZaloSettings" +
                    " SET value = @value, modified_on = @modified_on" +
                    " WHERE text = 'refresh_token'";

                SqlCommand command = new SqlCommand(query, connection);

                command.Parameters.AddWithValue("@value", refreshToken);
                command.Parameters.AddWithValue("@modified_on", DateTime.Now);

                try
                {
                    connection.Open();
                    command.ExecuteNonQuery();
                }
                catch (SqlException e)
                {
                    WriteToFile("Error Generated. Details: " + e.ToString());
                }
                finally
                {
                    connection.Close();
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - UpdateRefreshToken Error: " + ex.Message);
            }
        }

        #endregion

        #region -- The first time run this service --

        #region -- Get OA Information --

        public void GetOAInformation()
        {
            string output = "";
            string error = "";
            try
            {
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                      | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                // Skip validation of SSL/TLS certificate
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                var zalo = new ZaloParams()
                {
                    access_token = OA_Info.access_token(),
                    content_type = "application/json",
                    method = "GET",
                    url = ZaloUrl.getInfoOA,
                };

                output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);

                if (!string.IsNullOrEmpty(error))
                {
                    WriteToFile(DateTime.Now + " - GetOAInformation Error: " + error);
                }

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var oaID = jsonConvert["data"]["oa_id"].Value<string>();
                    var displayName = jsonConvert["data"]["name"].Value<string>();
                    var description = jsonConvert["data"]["description"].Value<string>();
                    var avatar = jsonConvert["data"]["avatar"].Value<string>();
                    var coverImage = jsonConvert["data"]["cover"].Value<string>();
                    var isVerified = jsonConvert["data"]["is_verified"].Value<string>();

                    var client = new RestClient(Zalo.apiUrl + "ChatZalo/OA/Create");
                    client.Timeout = -1;
                    var requestOA = new RestRequest(Method.POST);
                    requestOA.AddHeader("Content-Type", "application/json");

                    requestOA.AddParameter("ID", oaID);
                    requestOA.AddParameter("DisplayName", displayName);
                    requestOA.AddParameter("Description", description);
                    requestOA.AddParameter("Avatar", avatar);
                    requestOA.AddParameter("CoverImage", coverImage);
                    requestOA.AddParameter("IsVerified", isVerified);

                    IRestResponse response = client.Execute(requestOA);
                    WriteToFile(DateTime.Now + " - Get OA Success" + ": " + response.Content);
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + "- GetOAInformation Error: " + ex.Message);
            }
        }

        #endregion

        #region -- Get Followers --

        public void GetFollowersFromZalo(int offset, int count)
        {
            string output = "";
            string error = "";
            try
            {
                var checkTotal = 0;

                var url = "https://openapi.zalo.me/v2.0/oa/getfollowers?data={offset:" + offset
                    + ",count:" + count + "}";

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                      | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                // Skip validation of SSL/TLS certificate
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                var zalo = new ZaloParams()
                {
                    access_token = OA_Info.access_token(),
                    method = "GET",
                    url = url,
                };

                output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);

                if (!string.IsNullOrEmpty(error))
                {
                    WriteToFile(DateTime.Now + " - GetFollowersFromZalo Error: " + error);
                }

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var total = Int32.Parse(jsonConvert["data"]["total"].Value<string>());

                    checkTotal = total;

                    for (var i = 0; i < count; i++)
                    {
                        var follower = jsonConvert["data"]["followers"][i]["user_id"].Value<string>();
                        WriteToFile(DateTime.Now + " - followerID: " + follower);
                        GetFollowerDetails(follower);
                        //GetMessagesByFollowerID(0, 10, follower);
                    }

                    if (checkTotal > offset)
                    {
                        offset += count;
                        GetFollowersFromZalo(offset, 50);
                    }
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - GetFollowersFromZalo Error: " + ex.Message);
            }
        }

        public void GetFollowerDetails(string followerID)
        {
            string output = "";
            string error = "";
            try
            {
                var url = "https://openapi.zalo.me/v2.0/oa/getprofile?data={user_id:" + followerID + "}";

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                     | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                // Skip validation of SSL/TLS certificate
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                var zalo = new ZaloParams()
                {
                    access_token = OA_Info.access_token(),
                    method = "GET",
                    url = url,
                };

                output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);

                if (!string.IsNullOrEmpty(error))
                {
                    WriteToFile(DateTime.Now + " - GetFollowerDetails Error: " + error);
                }

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var countNotes = jsonConvert["data"]["tags_and_notes_info"]["notes"].Count();
                    var notes = "";
                    if (countNotes > 0)
                    {
                        notes = jsonConvert["data"]["tags_and_notes_info"]["notes"][0].Value<string>();
                    }

                    var countTagsName = jsonConvert["data"]["tags_and_notes_info"]["tag_names"].Count();
                    var tagsName = "";
                    if (countTagsName > 0)
                    {
                        tagsName = jsonConvert["data"]["tags_and_notes_info"]["tag_names"][0].Value<string>();
                    }

                    var userID = jsonConvert["data"]["user_id"].Value<string>();
                    var displayName = jsonConvert["data"]["display_name"].Value<string>();
                    var userGender = jsonConvert["data"]["user_gender"].Value<string>();
                    var userIDByApp = jsonConvert["data"]["user_id_by_app"].Value<string>();
                    var avatar = jsonConvert["data"]["avatar"].Value<string>();
                    var birthdate = jsonConvert["data"]["birth_date"].Value<string>();

                    var countRowData = jsonConvert["data"].Count();

                    if (countRowData > 8)
                    {
                        var name = jsonConvert["data"]["shared_info"]["name"].Value<string>();
                        var phoneNumber = jsonConvert["data"]["shared_info"]["phone"].Value<string>();
                        var ward = jsonConvert["data"]["shared_info"]["ward"].Value<string>();
                        var district = jsonConvert["data"]["shared_info"]["district"].Value<string>();
                        var city = jsonConvert["data"]["shared_info"]["city"].Value<string>();
                        var address = jsonConvert["data"]["shared_info"]["address"].Value<string>();

                        CreateFollowersHasSharedInfo(userID, displayName, userGender, userIDByApp,
                            avatar, birthdate, tagsName, notes, name, phoneNumber, ward, district,
                            city, address);
                    }
                    else
                    {
                        CreateFollowersHasNoSharedInfo(userID, displayName, userGender, userIDByApp,
                            avatar, birthdate, tagsName, notes);
                    }
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - GetFollowerDetails Error: " + ex.Message);
            }
        }

        public void CreateFollowersHasNoSharedInfo(string id, string displayName, string gender, string idApp,
            string avatar, string birthDate, string tagName, string note)
        {
            try
            {
                var client = new RestClient(Zalo.apiUrl + "ChatZalo/User/Create");
                client.Timeout = -1;
                var request = new RestRequest(Method.POST);
                request.AddHeader("Content-Type", "application/json");
                request.AddParameter("UserID", id);
                request.AddParameter("DisplayName", displayName);
                request.AddParameter("UserGender", gender);
                request.AddParameter("UserIDByApp", idApp);
                request.AddParameter("AvatarDefaultApp", avatar);
                request.AddParameter("BirthDate", birthDate);
                request.AddParameter("IsFollower", true);
                request.AddParameter("TagsName", tagName);
                request.AddParameter("Notes", note);
                IRestResponse response = client.Execute(request);
                WriteToFile(DateTime.Now + ": " + response.Content);
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - CreateFollowersHasNoSharedInfo Error: " + ex.Message);
            }
        }

        public void CreateFollowersHasSharedInfo(string id, string displayName, string gender, string idApp,
            string avatar, string birthDate, string tagName, string note, string name, string phone,
            string ward, string district, string city, string address)
        {
            try
            {
                var client = new RestClient(Zalo.apiUrl + "ChatZalo/User/Create");
                client.Timeout = -1;
                var request = new RestRequest(Method.POST);
                request.AddHeader("Content-Type", "application/json");
                request.AddParameter("UserID", id);
                request.AddParameter("DisplayName", displayName);
                request.AddParameter("UserGender", gender);
                request.AddParameter("UserIDByApp", idApp);
                request.AddParameter("AvatarDefaultApp", avatar);
                request.AddParameter("BirthDate", birthDate);
                request.AddParameter("IsFollower", true);
                request.AddParameter("Name", name);
                request.AddParameter("PhoneNumber", phone);
                request.AddParameter("Ward", ward);
                request.AddParameter("District", district);
                request.AddParameter("City", city);
                request.AddParameter("Address", address);
                request.AddParameter("TagsName", tagName);
                request.AddParameter("Notes", note);
                IRestResponse response = client.Execute(request);
                WriteToFile(DateTime.Now + ": " + response.Content);
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - CreateFollowersHasSharedInfo Error: " + ex.Message);
            }
        }

        #endregion

        #region -- Get Messages --

        public void GetMessagesByFollowerID(int offset, int count, string id)
        {
            string output = "";
            string error = "";
            try
            {
                var checkTotal = 0;
                var url = "https://openapi.zalo.me/v2.0/oa/conversation?data={offset:" + offset
                    + ",user_id:" + id + ",count:" + count + "}";

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                      | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                // Skip validation of SSL/TLS certificate
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                var zalo = new ZaloParams()
                {
                    access_token = OA_Info.access_token(),
                    method = "GET",
                    url = url,
                };

                output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);

                if (!string.IsNullOrEmpty(error))
                {
                    WriteToFile(DateTime.Now + " - GetMessagesByFollowerID Error: " + error);
                }

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);
                    var countRowData = jsonConvert["data"].Count();

                    checkTotal = countRowData;

                    if (countRowData > 0)
                    {
                        for (var i = 0; i < countRowData; i++)
                        {
                            var msgID = jsonConvert["data"][i]["message_id"].Value<string>();
                            var time = jsonConvert["data"][i]["time"].Value<string>();

                            var typeMsg = jsonConvert["data"][i]["type"].Value<string>();
                            var src = jsonConvert["data"][i]["src"].Value<string>();

                            var fromID = jsonConvert["data"][i]["from_id"].Value<string>();
                            var fromDisplayName = jsonConvert["data"][i]["from_display_name"].Value<string>();
                            var fromAvatar = jsonConvert["data"][i]["from_avatar"].Value<string>();

                            var toID = jsonConvert["data"][i]["to_id"].Value<string>();
                            var toDisplayName = jsonConvert["data"][i]["to_display_name"].Value<string>();
                            var toAvatar = jsonConvert["data"][i]["to_avatar"].Value<string>();

                            var client = new RestClient(Zalo.apiUrl + "ChatZalo/GetAllMsgFromZalo");
                            client.Timeout = -1;
                            var requestMsg = new RestRequest(Method.POST);
                            requestMsg.AddHeader("Content-Type", "application/json");

                            requestMsg.AddParameter("ID", msgID);
                            requestMsg.AddParameter("Src", src);
                            requestMsg.AddParameter("Time", time);
                            requestMsg.AddParameter("Type", typeMsg);

                            requestMsg.AddParameter("FromID", fromID);
                            requestMsg.AddParameter("FromDisplayName", fromDisplayName);
                            requestMsg.AddParameter("FromAvatar", fromAvatar);

                            requestMsg.AddParameter("ToID", toID);
                            requestMsg.AddParameter("ToDisplayName", toDisplayName);
                            requestMsg.AddParameter("ToAvatar", toAvatar);
                            requestMsg.AddParameter("IsRecent", false);

                            switch (typeMsg)
                            {
                                case "text":
                                    var msgContentText = jsonConvert["data"][i]["message"].Value<string>();
                                    requestMsg.AddParameter("MessageContent", msgContentText);

                                    IRestResponse responseText = client.Execute(requestMsg);
                                    WriteToFile(responseText.Content);
                                    break;

                                case "photo":
                                case "image":
                                    var thumbImage = jsonConvert["data"][i]["thumb"].Value<string>();
                                    var urlImage = jsonConvert["data"][i]["url"].Value<string>();
                                    var descriptionImage = jsonConvert["data"][i]["description"].Value<string>();

                                    requestMsg.AddParameter("Thumb", thumbImage);
                                    requestMsg.AddParameter("Url", urlImage);
                                    requestMsg.AddParameter("Description", descriptionImage);

                                    IRestResponse responseImage = client.Execute(requestMsg);
                                    WriteToFile(responseImage.Content);
                                    break;

                                case "sticker":
                                    var urlSticker = jsonConvert["data"][i]["url"].Value<string>();

                                    requestMsg.AddParameter("Url", urlSticker);

                                    IRestResponse responseSticker = client.Execute(requestMsg);
                                    WriteToFile(responseSticker.Content);
                                    break;

                                case "link":
                                case "links":
                                    var title = jsonConvert["data"][i]["links"][0]["title"].Value<string>();
                                    var thumbLink = jsonConvert["data"][i]["links"][0]["thumb"].Value<string>();
                                    var urlLink = jsonConvert["data"][i]["links"][0]["url"].Value<string>();
                                    var descriptionLink = jsonConvert["data"][i]["links"][0]["description"].Value<string>();

                                    requestMsg.AddParameter("Links", title);
                                    requestMsg.AddParameter("Thumb", thumbLink);
                                    requestMsg.AddParameter("Url", urlLink);
                                    requestMsg.AddParameter("Description", descriptionLink);

                                    IRestResponse responseLink = client.Execute(requestMsg);
                                    WriteToFile(responseLink.Content);
                                    break;

                                case "gif":
                                    var thumbGif = jsonConvert["data"][i]["thumb"].Value<string>();
                                    var urlGif = jsonConvert["data"][i]["url"].Value<string>();

                                    requestMsg.AddParameter("Thumb", thumbGif);
                                    requestMsg.AddParameter("Url", urlGif);

                                    IRestResponse responseGif = client.Execute(requestMsg);
                                    WriteToFile(responseGif.Content);
                                    break;

                                case "audio":
                                    var urlAudio = jsonConvert["data"][i]["url"].Value<string>();
                                    requestMsg.AddParameter("Url", urlAudio);

                                    IRestResponse responseAudio = client.Execute(requestMsg);
                                    WriteToFile(responseAudio.Content);
                                    break;

                                case "video":
                                    var thumbVideo = jsonConvert["data"][i]["thumb"].Value<string>();
                                    var urlVideo = jsonConvert["data"][i]["url"].Value<string>();
                                    var descriptionVideo = jsonConvert["data"][i]["description"].Value<string>();

                                    requestMsg.AddParameter("Thumb", thumbVideo);
                                    requestMsg.AddParameter("Url", urlVideo);
                                    requestMsg.AddParameter("Description", descriptionVideo);

                                    IRestResponse responseVideo = client.Execute(requestMsg);
                                    WriteToFile(responseVideo.Content);
                                    break;

                                case "location":
                                    var location = jsonConvert["data"][i]["location"].Value<string>();

                                    requestMsg.AddParameter("Location", location);

                                    IRestResponse responseLocation = client.Execute(requestMsg);
                                    WriteToFile(responseLocation.Content);
                                    break;

                                case "nosupport":
                                    IRestResponse responseNoSP = client.Execute(requestMsg);
                                    WriteToFile(responseNoSP.Content);
                                    break;

                                case "file":
                                    var urlFile = jsonConvert["data"]["attachments"][0]["payload"]["url"].Value<string>();
                                    var sizeFile = jsonConvert["data"]["attachments"][0]["payload"]["size"].Value<string>();
                                    var nameFile = jsonConvert["data"]["attachments"][0]["payload"]["name"].Value<string>();
                                    var checksumFile = jsonConvert["data"]["attachments"][0]["payload"]["checksum"].Value<string>();
                                    var typeFile = jsonConvert["data"]["attachments"][0]["payload"]["type"].Value<string>();

                                    requestMsg.AddParameter("Url", urlFile);
                                    requestMsg.AddParameter("Description", nameFile);

                                    IRestResponse responseFile = client.Execute(requestMsg);
                                    WriteToFile(responseFile.Content);
                                    break;

                                case "template":
                                    IRestResponse responseTemplate = client.Execute(requestMsg);
                                    WriteToFile(responseTemplate.Content);
                                    break;

                                default:
                                    IRestResponse responseDefault = client.Execute(requestMsg);
                                    WriteToFile(responseDefault.Content);
                                    break;
                            };
                        }
                    }

                    if (checkTotal > 0 && checkTotal == count)
                    {
                        offset += count;
                        GetMessagesByFollowerID(offset, 10, id);
                    }
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - GetMessagesByFollowerID Error: " + ex.Message);
            }
        }

        #endregion

        #endregion

        #region -- Scan Followers --

        public void ScanFollowersFromZalo(int offset, int count)
        {
            string output = "";
            string error = "";
            try
            {
                var checkTotal = 0;

                var url = "https://openapi.zalo.me/v2.0/oa/getfollowers?data={offset:" + offset
                    + ",count:" + count + "}";

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                      | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                // Skip validation of SSL/TLS certificate
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                var zalo = new ZaloParams()
                {
                    access_token = OA_Info.access_token(),
                    method = "GET",
                    url = url,
                };

                output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);

                if (!string.IsNullOrEmpty(error))
                {
                    WriteToFile(DateTime.Now + " - ScanFollowersFromZalo Error: " + error);
                }

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var total = Int32.Parse(jsonConvert["data"]["total"].Value<string>());

                    checkTotal = total;

                    for (var i = 0; i < count; i++)
                    {
                        var follower = jsonConvert["data"]["followers"][i]["user_id"].Value<string>();
                        WriteToFile(DateTime.Now + " - followerID: " + follower);
                        ScanFollowerDetails(follower);
                    }

                    if (checkTotal > count)
                    {
                        offset += count;
                        ScanFollowersFromZalo(offset, 50);
                    }
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - ScanFollowersFromZalo Error: " + ex.Message);
            }
        }

        public void ScanFollowerDetails(string followerID)
        {
            string output = "";
            string error = "";
            try
            {
                var url = "https://openapi.zalo.me/v2.0/oa/getprofile?data={user_id:" + followerID + "}";

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                     | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                // Skip validation of SSL/TLS certificate
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                var zalo = new ZaloParams()
                {
                    access_token = OA_Info.access_token(),
                    method = "GET",
                    url = url,
                };

                output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);

                if (!string.IsNullOrEmpty(error))
                {
                    WriteToFile(DateTime.Now + " - ScanFollowerDetails Error: " + error);
                }

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var countNotes = jsonConvert["data"]["tags_and_notes_info"]["notes"].Count();
                    var notes = "";
                    if (countNotes > 0)
                    {
                        notes = jsonConvert["data"]["tags_and_notes_info"]["notes"][0].Value<string>();
                    }

                    var countTagsName = jsonConvert["data"]["tags_and_notes_info"]["tag_names"].Count();
                    var tagsName = "";
                    if (countTagsName > 0)
                    {
                        tagsName = jsonConvert["data"]["tags_and_notes_info"]["tag_names"][0].Value<string>();
                    }

                    var userID = jsonConvert["data"]["user_id"].Value<string>();
                    var displayName = jsonConvert["data"]["display_name"].Value<string>();
                    var userGender = jsonConvert["data"]["user_gender"].Value<string>();
                    var userIDByApp = jsonConvert["data"]["user_id_by_app"].Value<string>();
                    var avatar = jsonConvert["data"]["avatar"].Value<string>();
                    var birthdate = jsonConvert["data"]["birth_date"].Value<string>();

                    var countRowData = jsonConvert["data"].Count();

                    if (countRowData > 8)
                    {
                        var name = jsonConvert["data"]["shared_info"]["name"].Value<string>();
                        var phoneNumber = jsonConvert["data"]["shared_info"]["phone"].Value<string>();
                        var ward = jsonConvert["data"]["shared_info"]["ward"].Value<string>();
                        var district = jsonConvert["data"]["shared_info"]["district"].Value<string>();
                        var city = jsonConvert["data"]["shared_info"]["city"].Value<string>();
                        var address = jsonConvert["data"]["shared_info"]["address"].Value<string>();

                        ScanFollowersHasSharedInfo(userID, displayName, userGender, userIDByApp,
                            avatar, birthdate, tagsName, notes, name, phoneNumber, ward, district,
                            city, address);
                    }
                    else
                    {
                        ScanFollowersHasNoSharedInfo(userID, displayName, userGender, userIDByApp,
                            avatar, birthdate, tagsName, notes);
                    }
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - ScanFollowerDetails Error: " + ex.Message);
            }
        }

        public void ScanFollowersHasNoSharedInfo(string id, string displayName, string gender, string idApp,
            string avatar, string birthDate, string tagName, string note)
        {
            try
            {
                var client = new RestClient(Zalo.apiUrl + "ChatZalo/User/Create");
                client.Timeout = -1;
                var request = new RestRequest(Method.POST);
                request.AddHeader("Content-Type", "application/json");
                request.AddParameter("UserID", id);
                request.AddParameter("DisplayName", displayName);
                request.AddParameter("UserGender", gender);
                request.AddParameter("UserIDByApp", idApp);
                request.AddParameter("AvatarDefaultApp", avatar);
                request.AddParameter("BirthDate", birthDate);
                request.AddParameter("IsFollower", true);
                request.AddParameter("TagsName", tagName);
                request.AddParameter("Notes", note);
                IRestResponse response = client.Execute(request);
                WriteToFile(DateTime.Now + ": " + response.Content);
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - ScanFollowersHasNoSharedInfo Error: " + ex.Message);
            }
        }

        public void ScanFollowersHasSharedInfo(string id, string displayName, string gender, string idApp,
            string avatar, string birthDate, string tagName, string note, string name, string phone,
            string ward, string district, string city, string address)
        {
            try
            {
                var client = new RestClient(Zalo.apiUrl + "ChatZalo/User/Create");
                client.Timeout = -1;
                var request = new RestRequest(Method.POST);
                request.AddHeader("Content-Type", "application/json");
                request.AddParameter("UserID", id);
                request.AddParameter("DisplayName", displayName);
                request.AddParameter("UserGender", gender);
                request.AddParameter("UserIDByApp", idApp);
                request.AddParameter("AvatarDefaultApp", avatar);
                request.AddParameter("BirthDate", birthDate);
                request.AddParameter("IsFollower", true);
                request.AddParameter("Name", name);
                request.AddParameter("PhoneNumber", phone);
                request.AddParameter("Ward", ward);
                request.AddParameter("District", district);
                request.AddParameter("City", city);
                request.AddParameter("Address", address);
                request.AddParameter("TagsName", tagName);
                request.AddParameter("Notes", note);
                IRestResponse response = client.Execute(request);
                WriteToFile(DateTime.Now + ": " + response.Content);
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - ScanFollowersHasSharedInfo Error: " + ex.Message);
            }
        }

        #endregion

        #region -- Scan Messages --

        public void GetConversationRecent(int offset, int count)
        {
            string output = "";
            string error = "";
            try
            {
                var checkTotal = 0;

                var url = "https://openapi.zalo.me/v2.0/oa/listrecentchat?data={offset:" + offset
                    + ",count:" + count + "}";

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                      | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                // Skip validation of SSL/TLS certificate
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                var zalo = new ZaloParams()
                {
                    access_token = OA_Info.access_token(),
                    method = "GET",
                    url = url,
                };

                output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);

                if (!string.IsNullOrEmpty(error))
                {
                    WriteToFile(DateTime.Now + " - GetConversationRecent Error: " + error);
                }

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var countRowData = jsonConvert["data"].Count();

                    checkTotal = countRowData;

                    for (var i = 0; i < countRowData; i++)
                    {
                        var fromID = jsonConvert["data"][i]["from_id"].Value<string>();
                        var toID = jsonConvert["data"][i]["to_id"].Value<string>();
                        var fromName = jsonConvert["data"][i]["from_display_name"].Value<string>();
                        var toName = jsonConvert["data"][i]["to_display_name"].Value<string>();
                        var fromAvatar = jsonConvert["data"][i]["from_avatar"].Value<string>();
                        var toAvatar = jsonConvert["data"][i]["to_avatar"].Value<string>();
                        var time = jsonConvert["data"][i]["time"].Value<double>();

                        var client = new RestClient(Zalo.apiUrl + "ChatZalo/CheckMsgListRecent");
                        client.Timeout = -1;
                        var requestCheck = new RestRequest(Method.POST);
                        requestCheck.AddHeader("Content-Type", "application/json");

                        requestCheck.AddParameter("FromID", fromID);
                        requestCheck.AddParameter("ToID", toID);

                        IRestResponse response = client.Execute(requestCheck);
                        var responseConvert = (JObject)JsonConvert.DeserializeObject(response.Content);

                        var codeRS = responseConvert["code"].Value<string>();
                        var userRS = responseConvert["user"].Value<string>();

                        if (codeRS == "200")
                        {
                            var dataRS = responseConvert["data"].Value<string>();
                            if (userRS == "Follower")
                            {
                                //ScanMessagesByFollowerID(0, 2, dataRS, 0);
                                WriteToFile(DateTime.Now + " - Follower: " + dataRS);
                            }
                            else if (userRS == "Anonymous")
                            {
                                CreateAnonymousUser(dataRS, fromName, fromAvatar);
                                WriteToFile(DateTime.Now + " - Anonymous: " + dataRS + "-" + fromName);
                            }
                            else
                            {
                                CreateAnonymousUser(dataRS, toName, toAvatar);
                                WriteToFile(DateTime.Now + " - OA to Anonymous: " + dataRS + "-" + toName);
                            }
                        }

                        if (i == 0)
                        {
                            Zalo.timeScanConvRecent = time;
                        }
                    }

                    if (checkTotal > 0 && checkTotal == count)
                    {
                        offset += count;
                        GetConversationRecent(offset, 10);
                    }
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - GetConversationRecent Error: " + ex.Message);
            }
        }

        public void ScanConversationRecent(int offset, int count)
        {
            string output = "";
            string error = "";
            try
            {
                var checkTotal = 0;

                var url = "https://openapi.zalo.me/v2.0/oa/listrecentchat?data={offset:" + offset
                    + ",count:" + count + "}";

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                      | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                // Skip validation of SSL/TLS certificate
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                var zalo = new ZaloParams()
                {
                    access_token = OA_Info.access_token(),
                    method = "GET",
                    url = url,
                };

                output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);

                if (!string.IsNullOrEmpty(error))
                {
                    WriteToFile(DateTime.Now + " - ScanConversationRecent Error: " + error);
                }

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var countRowData = jsonConvert["data"].Count();

                    for (var i = (countRowData - 1); i >= 0; i--)
                    {
                        var fromID = jsonConvert["data"][i]["from_id"].Value<string>();
                        var toID = jsonConvert["data"][i]["to_id"].Value<string>();
                        var fromName = jsonConvert["data"][i]["from_display_name"].Value<string>();
                        var fromAvatar = jsonConvert["data"][i]["from_avatar"].Value<string>();
                        var toAvatar = jsonConvert["data"][i]["to_avatar"].Value<string>();
                        var toName = jsonConvert["data"][i]["to_display_name"].Value<string>();
                        var time = jsonConvert["data"][i]["time"].Value<Double>();

                        if (time > Zalo.timeScanConvRecent)
                        {
                            Zalo.timeScanConvRecent = time;

                            checkTotal = i;

                            WriteToFile(fromName + "/" + toName + "/" + i);

                            WriteToFile(time + "/" + Zalo.timeScanConvRecent);

                            var client = new RestClient(Zalo.apiUrl + "ChatZalo/CheckMsgListRecent");
                            client.Timeout = -1;
                            var requestCheck = new RestRequest(Method.POST);
                            requestCheck.AddHeader("Content-Type", "application/json");

                            requestCheck.AddParameter("FromID", fromID);
                            requestCheck.AddParameter("ToID", toID);

                            IRestResponse response = client.Execute(requestCheck);
                            var responseConvert = (JObject)JsonConvert.DeserializeObject(response.Content);

                            var codeRS = responseConvert["code"].Value<string>();
                            var userRS = responseConvert["user"].Value<string>();

                            if (codeRS == "200")
                            {
                                var dataRS = responseConvert["data"].Value<string>();
                                if (userRS == "Follower")
                                {
                                    //ScanMessagesByFollowerID(0, 2, dataRS, 0);
                                    WriteToFile(DateTime.Now + " - New Message From Follower!");
                                    WriteToFile(DateTime.Now + " - Follower: " + dataRS);
                                }
                                else if (userRS == "Anonymous")
                                {
                                    CreateAnonymousUser(dataRS, fromName, fromAvatar);
                                    WriteToFile(DateTime.Now + " - New Message From Anonymous!");
                                    WriteToFile(DateTime.Now + " - Anonymous: " + dataRS + "-" + fromName);
                                }
                                else
                                {
                                    CreateAnonymousUser(dataRS, toName, toAvatar);
                                    WriteToFile(DateTime.Now + " - New Message From Anonymous!");
                                    WriteToFile(DateTime.Now + " - OA to Anonymous: " + dataRS + "-" + toName);
                                }
                            }
                        }
                    }

                    if (checkTotal > 0 && checkTotal == count)
                    {
                        offset += count;
                        ScanConversationRecent(offset, 10);
                        WriteToFile(DateTime.Now + " - LOOP");
                    }
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - ScanConversationRecent Error: " + ex.Message);
            }
        }

        public void ScanMessagesByFollowerID(int offset, int count, string id, int number)
        {
            string output = "";
            string error = "";
            try
            {
                WriteToFile(DateTime.Now + " - Scan this Follower id: " + id);

                var codeRS = "";

                var url = "https://openapi.zalo.me/v2.0/oa/conversation?data={offset:" + offset
                    + ",user_id:" + id + ",count:" + count + "}";

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                      | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                // Skip validation of SSL/TLS certificate
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                var zalo = new ZaloParams()
                {
                    access_token = OA_Info.access_token(),
                    method = "GET",
                    url = url,
                };

                output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);

                if (!string.IsNullOrEmpty(error))
                {
                    WriteToFile(DateTime.Now + " - ScanMessagesByFollowerID Error: " + error);
                }

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var countRowData = jsonConvert["data"].Count();

                    if (countRowData > 0)
                    {
                        for (var i = 0; i < countRowData; i++)
                        {
                            var msgID = jsonConvert["data"][i]["message_id"].Value<string>();
                            var time = jsonConvert["data"][i]["time"].Value<string>();

                            var typeMsg = jsonConvert["data"][i]["type"].Value<string>();
                            var src = jsonConvert["data"][i]["src"].Value<string>();

                            var fromID = jsonConvert["data"][i]["from_id"].Value<string>();
                            var fromDisplayName = jsonConvert["data"][i]["from_display_name"].Value<string>();
                            var fromAvatar = jsonConvert["data"][i]["from_avatar"].Value<string>();

                            var toID = jsonConvert["data"][i]["to_id"].Value<string>();
                            var toDisplayName = jsonConvert["data"][i]["to_display_name"].Value<string>();
                            var toAvatar = jsonConvert["data"][i]["to_avatar"].Value<string>();

                            var client = new RestClient(Zalo.apiUrl + "ChatZalo/CreateMessages");
                            client.Timeout = -1;
                            var requestMsg = new RestRequest(Method.POST);
                            requestMsg.AddHeader("Content-Type", "application/json");

                            requestMsg.AddParameter("FollowerID", id);
                            requestMsg.AddParameter("ID", msgID);
                            requestMsg.AddParameter("Src", src);
                            requestMsg.AddParameter("Time", time);
                            requestMsg.AddParameter("Type", typeMsg);
                            requestMsg.AddParameter("FromID", fromID);
                            requestMsg.AddParameter("FromDisplayName", fromDisplayName);
                            requestMsg.AddParameter("FromAvatar", fromAvatar);
                            requestMsg.AddParameter("ToID", toID);
                            requestMsg.AddParameter("ToDisplayName", toDisplayName);
                            requestMsg.AddParameter("ToAvatar", toAvatar);
                            requestMsg.AddParameter("IsRecent", true);

                            switch (typeMsg)
                            {
                                case "text":
                                    var msgContentText = jsonConvert["data"][i]["message"].Value<string>();
                                    requestMsg.AddParameter("MessageContent", msgContentText);

                                    IRestResponse responseText = client.Execute(requestMsg);
                                    var msgRSText = (JObject)JsonConvert.DeserializeObject(responseText.Content);
                                    codeRS = msgRSText["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, msgContentText, typeMsg, time);
                                    }

                                    break;
                                case "photo":
                                case "image":
                                    var thumbImage = jsonConvert["data"][i]["thumb"].Value<string>();
                                    var urlImage = jsonConvert["data"][i]["url"].Value<string>();
                                    var descriptionImage = jsonConvert["data"][i]["description"].Value<string>();

                                    requestMsg.AddParameter("Thumb", thumbImage);
                                    requestMsg.AddParameter("Url", urlImage);
                                    requestMsg.AddParameter("Description", descriptionImage);

                                    IRestResponse responseImage = client.Execute(requestMsg);
                                    var msgRSImage = (JObject)JsonConvert.DeserializeObject(responseImage.Content);
                                    codeRS = msgRSImage["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "sticker":
                                    var urlSticker = jsonConvert["data"][i]["url"].Value<string>();

                                    requestMsg.AddParameter("Url", urlSticker);

                                    IRestResponse responseSticker = client.Execute(requestMsg);
                                    var msgRSSticker = (JObject)JsonConvert.DeserializeObject(responseSticker.Content);
                                    codeRS = msgRSSticker["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "link":
                                case "links":
                                    var title = jsonConvert["data"][i]["links"][0]["title"].Value<string>();
                                    var thumbLink = jsonConvert["data"][i]["links"][0]["thumb"].Value<string>();
                                    var urlLink = jsonConvert["data"][i]["links"][0]["url"].Value<string>();
                                    var descriptionLink = jsonConvert["data"][i]["links"][0]["description"].Value<string>();

                                    requestMsg.AddParameter("Links", title);
                                    requestMsg.AddParameter("Thumb", thumbLink);
                                    requestMsg.AddParameter("Url", urlLink);
                                    requestMsg.AddParameter("Description", descriptionLink);

                                    IRestResponse responseLink = client.Execute(requestMsg);
                                    var msgRSLink = (JObject)JsonConvert.DeserializeObject(responseLink.Content);
                                    codeRS = msgRSLink["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "gif":
                                    var thumbGif = jsonConvert["data"][i]["thumb"].Value<string>();
                                    var urlGif = jsonConvert["data"][i]["url"].Value<string>();

                                    requestMsg.AddParameter("Thumb", thumbGif);
                                    requestMsg.AddParameter("Url", urlGif);

                                    IRestResponse responseGif = client.Execute(requestMsg);
                                    var msgRSGif = (JObject)JsonConvert.DeserializeObject(responseGif.Content);
                                    codeRS = msgRSGif["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "audio":
                                    var urlAudio = jsonConvert["data"][i]["url"].Value<string>();
                                    requestMsg.AddParameter("Url", urlAudio);

                                    IRestResponse responseAudio = client.Execute(requestMsg);
                                    var msgRSAudio = (JObject)JsonConvert.DeserializeObject(responseAudio.Content);
                                    codeRS = msgRSAudio["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "video":
                                    var thumbVideo = jsonConvert["data"][i]["thumb"].Value<string>();
                                    var urlVideo = jsonConvert["data"][i]["url"].Value<string>();
                                    var descriptionVideo = jsonConvert["data"][i]["description"].Value<string>();

                                    requestMsg.AddParameter("Thumb", thumbVideo);
                                    requestMsg.AddParameter("Url", urlVideo);
                                    requestMsg.AddParameter("Description", descriptionVideo);

                                    IRestResponse responseVideo = client.Execute(requestMsg);
                                    var msgRSVideo = (JObject)JsonConvert.DeserializeObject(responseVideo.Content);
                                    codeRS = msgRSVideo["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "location":
                                    var location = jsonConvert["data"][i]["location"].Value<string>();

                                    requestMsg.AddParameter("Location", location);

                                    IRestResponse responseLocation = client.Execute(requestMsg);
                                    var msgRSLocation = (JObject)JsonConvert.DeserializeObject(responseLocation.Content);
                                    codeRS = msgRSLocation["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "nosupport":
                                    IRestResponse responseNoSP = client.Execute(requestMsg);
                                    var msgRSNoSP = (JObject)JsonConvert.DeserializeObject(responseNoSP.Content);
                                    codeRS = msgRSNoSP["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "file":
                                    var urlFile = jsonConvert["data"]["attachments"][0]["payload"]["url"].Value<string>();
                                    var sizeFile = jsonConvert["data"]["attachments"][0]["payload"]["size"].Value<string>();
                                    var nameFile = jsonConvert["data"]["attachments"][0]["payload"]["name"].Value<string>();
                                    var checksumFile = jsonConvert["data"]["attachments"][0]["payload"]["checksum"].Value<string>();
                                    var typeFile = jsonConvert["data"]["attachments"][0]["payload"]["type"].Value<string>();

                                    requestMsg.AddParameter("Url", urlFile);
                                    requestMsg.AddParameter("Description", nameFile);

                                    IRestResponse responseFile = client.Execute(requestMsg);
                                    var msgRSFile = (JObject)JsonConvert.DeserializeObject(responseFile.Content);
                                    codeRS = msgRSFile["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "template":
                                    IRestResponse responseTemplate = client.Execute(requestMsg);
                                    var msgRSTemplate = (JObject)JsonConvert.DeserializeObject(responseTemplate.Content);
                                    codeRS = msgRSTemplate["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                default:
                                    IRestResponse responseDefault = client.Execute(requestMsg);
                                    var msgRSDefault = (JObject)JsonConvert.DeserializeObject(responseDefault.Content);
                                    codeRS = msgRSDefault["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByFollowerID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;
                            };
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - ScanMessagesByFollowerID Error: " + ex.Message);
            }
        }

        public void ScanMessagesByAnonymousID(int offset, int count, string id, int number)
        {
            string output = "";
            string error = "";
            try
            {
                WriteToFile(DateTime.Now + " - Scan this Anonymous id: " + id);
                var codeRS = "";

                var url = "https://openapi.zalo.me/v2.0/oa/conversation?data={offset:" + offset
                    + ",user_id:" + id + ",count:" + count + "}";

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11
                                      | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

                // Skip validation of SSL/TLS certificate
                ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

                var zalo = new ZaloParams()
                {
                    access_token = OA_Info.access_token(),
                    method = "GET",
                    url = url,
                };

                output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);

                if (!string.IsNullOrEmpty(error))
                {
                    WriteToFile(DateTime.Now + " - ScanMessagesByAnonymousID Error: " + error);
                }

                if (output != "" && output != null)
                {
                    var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                    var countRowData = jsonConvert["data"].Count();

                    if (countRowData > 0)
                    {
                        for (var i = 0; i < countRowData; i++)
                        {
                            var msgID = jsonConvert["data"][i]["message_id"].Value<string>();
                            var time = jsonConvert["data"][i]["time"].Value<string>();

                            var typeMsg = jsonConvert["data"][i]["type"].Value<string>();
                            var src = jsonConvert["data"][i]["src"].Value<string>();

                            var fromID = jsonConvert["data"][i]["from_id"].Value<string>();
                            var fromDisplayName = jsonConvert["data"][i]["from_display_name"].Value<string>();
                            var fromAvatar = jsonConvert["data"][i]["from_avatar"].Value<string>();

                            var toID = jsonConvert["data"][i]["to_id"].Value<string>();
                            var toDisplayName = jsonConvert["data"][i]["to_display_name"].Value<string>();
                            var toAvatar = jsonConvert["data"][i]["to_avatar"].Value<string>();

                            var client = new RestClient(Zalo.apiUrl + "ChatZalo/GetAllMsgFromZalo");
                            client.Timeout = -1;
                            var requestMsg = new RestRequest(Method.POST);
                            requestMsg.AddHeader("Content-Type", "application/json");

                            requestMsg.AddParameter("ID", msgID);
                            requestMsg.AddParameter("Src", src);
                            requestMsg.AddParameter("Time", time);
                            requestMsg.AddParameter("Type", typeMsg);
                            requestMsg.AddParameter("FromID", fromID);
                            requestMsg.AddParameter("FromDisplayName", fromDisplayName);
                            requestMsg.AddParameter("FromAvatar", fromAvatar);
                            requestMsg.AddParameter("ToID", toID);
                            requestMsg.AddParameter("ToDisplayName", toDisplayName);
                            requestMsg.AddParameter("ToAvatar", toAvatar);
                            requestMsg.AddParameter("IsRecent", true);

                            switch (typeMsg)
                            {
                                case "text":
                                    var msgContentText = jsonConvert["data"][i]["message"].Value<string>();
                                    requestMsg.AddParameter("MessageContent", msgContentText);

                                    IRestResponse responseText = client.Execute(requestMsg);
                                    var msgRSText = (JObject)JsonConvert.DeserializeObject(responseText.Content);
                                    codeRS = msgRSText["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Loop here: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, msgContentText, typeMsg, time);
                                        WriteToFile(DateTime.Now + " - Update status here!");
                                    }
                                    else
                                    {
                                        WriteToFile(DateTime.Now + " - number: " + number);
                                    }
                                    break;
                                case "photo":
                                case "image":
                                    var thumbImage = jsonConvert["data"][i]["thumb"].Value<string>();
                                    var urlImage = jsonConvert["data"][i]["url"].Value<string>();
                                    var descriptionImage = jsonConvert["data"][i]["description"].Value<string>();

                                    requestMsg.AddParameter("Thumb", thumbImage);
                                    requestMsg.AddParameter("Url", urlImage);
                                    requestMsg.AddParameter("Description", descriptionImage);

                                    IRestResponse responseImage = client.Execute(requestMsg);
                                    var msgRSImage = (JObject)JsonConvert.DeserializeObject(responseImage.Content);
                                    codeRS = msgRSImage["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "sticker":
                                    var urlSticker = jsonConvert["data"][i]["url"].Value<string>();

                                    requestMsg.AddParameter("Url", urlSticker);

                                    IRestResponse responseSticker = client.Execute(requestMsg);
                                    var msgRSSticker = (JObject)JsonConvert.DeserializeObject(responseSticker.Content);
                                    codeRS = msgRSSticker["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "link":
                                case "links":
                                    var title = jsonConvert["data"][i]["links"][0]["title"].Value<string>();
                                    var thumbLink = jsonConvert["data"][i]["links"][0]["thumb"].Value<string>();
                                    var urlLink = jsonConvert["data"][i]["links"][0]["url"].Value<string>();
                                    var descriptionLink = jsonConvert["data"][i]["links"][0]["description"].Value<string>();

                                    requestMsg.AddParameter("Links", title);
                                    requestMsg.AddParameter("Thumb", thumbLink);
                                    requestMsg.AddParameter("Url", urlLink);
                                    requestMsg.AddParameter("Description", descriptionLink);

                                    IRestResponse responseLink = client.Execute(requestMsg);
                                    var msgRSLink = (JObject)JsonConvert.DeserializeObject(responseLink.Content);
                                    codeRS = msgRSLink["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "gif":
                                    var thumbGif = jsonConvert["data"][i]["thumb"].Value<string>();
                                    var urlGif = jsonConvert["data"][i]["url"].Value<string>();

                                    requestMsg.AddParameter("Thumb", thumbGif);
                                    requestMsg.AddParameter("Url", urlGif);

                                    IRestResponse responseGif = client.Execute(requestMsg);
                                    var msgRSGif = (JObject)JsonConvert.DeserializeObject(responseGif.Content);
                                    codeRS = msgRSGif["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "audio":
                                    var urlAudio = jsonConvert["data"][i]["url"].Value<string>();
                                    requestMsg.AddParameter("Url", urlAudio);

                                    IRestResponse responseAudio = client.Execute(requestMsg);
                                    var msgRSAudio = (JObject)JsonConvert.DeserializeObject(responseAudio.Content);
                                    codeRS = msgRSAudio["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "video":
                                    var thumbVideo = jsonConvert["data"][i]["thumb"].Value<string>();
                                    var urlVideo = jsonConvert["data"][i]["url"].Value<string>();
                                    var descriptionVideo = jsonConvert["data"][i]["description"].Value<string>();

                                    requestMsg.AddParameter("Thumb", thumbVideo);
                                    requestMsg.AddParameter("Url", urlVideo);
                                    requestMsg.AddParameter("Description", descriptionVideo);

                                    IRestResponse responseVideo = client.Execute(requestMsg);
                                    var msgRSVideo = (JObject)JsonConvert.DeserializeObject(responseVideo.Content);
                                    codeRS = msgRSVideo["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "location":
                                    var location = jsonConvert["data"][i]["location"].Value<string>();

                                    requestMsg.AddParameter("Location", location);

                                    IRestResponse responseLocation = client.Execute(requestMsg);
                                    var msgRSLocation = (JObject)JsonConvert.DeserializeObject(responseLocation.Content);
                                    codeRS = msgRSLocation["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "nosupport":
                                    IRestResponse responseNoSP = client.Execute(requestMsg);
                                    var msgRSNoSP = (JObject)JsonConvert.DeserializeObject(responseNoSP.Content);
                                    codeRS = msgRSNoSP["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "file":
                                    var urlFile = jsonConvert["data"]["attachments"][0]["payload"]["url"].Value<string>();
                                    var sizeFile = jsonConvert["data"]["attachments"][0]["payload"]["size"].Value<string>();
                                    var nameFile = jsonConvert["data"]["attachments"][0]["payload"]["name"].Value<string>();
                                    var checksumFile = jsonConvert["data"]["attachments"][0]["payload"]["checksum"].Value<string>();
                                    var typeFile = jsonConvert["data"]["attachments"][0]["payload"]["type"].Value<string>();

                                    requestMsg.AddParameter("Url", urlFile);
                                    requestMsg.AddParameter("Description", nameFile);

                                    IRestResponse responseFile = client.Execute(requestMsg);
                                    var msgRSFile = (JObject)JsonConvert.DeserializeObject(responseFile.Content);
                                    codeRS = msgRSFile["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                case "template":
                                    IRestResponse responseTemplate = client.Execute(requestMsg);
                                    var msgRSTemplate = (JObject)JsonConvert.DeserializeObject(responseTemplate.Content);
                                    codeRS = msgRSTemplate["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;

                                default:
                                    IRestResponse responseDefault = client.Execute(requestMsg);
                                    var msgRSDefault = (JObject)JsonConvert.DeserializeObject(responseDefault.Content);
                                    codeRS = msgRSDefault["code"].Value<string>();

                                    if ((i == (countRowData - 1)) && (codeRS == "200"))
                                    {
                                        offset += count;
                                        ScanMessagesByAnonymousID(offset, 2, id, 1);

                                        WriteToFile(DateTime.Now + " - Success: " + time);
                                    }

                                    if (i == 0 && number == 0)
                                    {
                                        UpdateStatusOfLastMsg(id, "", typeMsg, time);
                                    }
                                    break;
                            };
                        }
                    }
                }


            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - ScanMessagesByAnonymousID Error: " + ex.Message);
            }
        }

        #endregion

        #region -- Create anonymous user --

        public void CreateAnonymousUser(string id, string displayName, string avatar)
        {
            try
            {
                var client = new RestClient(Zalo.apiUrl + "ChatZalo/User/Create");
                client.Timeout = -1;
                var request = new RestRequest(Method.POST);
                request.AddHeader("Content-Type", "application/json");
                request.AddParameter("UserID", id);
                request.AddParameter("DisplayName", displayName);
                request.AddParameter("AvatarDefaultApp", avatar);
                request.AddParameter("IsFollower", false);
                IRestResponse response = client.Execute(request);
                WriteToFile(DateTime.Now + ": " + response.Content);

                //ScanMessagesByAnonymousID(0, 2, id, 0);
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - CreateAnonymousUser Error: " + ex.Message);
            }
        }

        #endregion

        #region -- Update Status of User --

        public void UpdateStatusOfLastMsg(string id, string lastMsg, string typeLastMsg, string lastTimeMsg)
        {
            try
            {
                var client = new RestClient(Zalo.apiUrl + "ChatZalo/User/UpdateStatusOfLastMsg");
                client.Timeout = -1;
                var request = new RestRequest(Method.POST);
                request.AddHeader("Content-Type", "application/json");
                request.AddParameter("UserID", id);
                request.AddParameter("LastMessage", lastMsg);
                request.AddParameter("TypeLastMessage", typeLastMsg);
                request.AddParameter("LastTimeMessage", lastTimeMsg);
                IRestResponse response = client.Execute(request);
                WriteToFile(DateTime.Now + ": " + response.Content);
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - UpdateStatusOfLastMsg Error: " + ex.Message);
            }
        }

        #endregion

        #region -- Scan and Handle Webhook --

        public void ScanWebhook()
        {
            try
            {
                var client = new RestClient(Zalo.apiUrl + "ChatZalo/Webhook/Handle");
                client.Timeout = -1;
                var request = new RestRequest(Method.POST);
                request.AddHeader("Content-Type", "application/json");
                IRestResponse response = client.Execute(request);
                var responseConvert = (JObject)JsonConvert.DeserializeObject(response.Content);

                var codeRS = responseConvert["code"].Value<string>();

                if (codeRS == "200")
                {
                    var isHandle = responseConvert["isHandle"].Value<string>();
                    if (isHandle == "True")
                    {
                        var id = responseConvert["data"]["ID"].Value<string>();
                        var msg = responseConvert["data"]["Message"].Value<string>();
                        var type = responseConvert["data"]["TypeMessage"].Value<string>();
                        var time = responseConvert["data"]["Time"].Value<string>();

                        //UpdateStatusOfLastMsg(id, msg, type, time);
                        WriteToFile(DateTime.Now + " - Data Update here: " + responseConvert);
                    }
                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - ScanWebhook Error: " + ex.Message);
            }
        }

        #endregion

        #region -- Call: Request Consent --

        public void RequestConsent()
        {
            string output = "", error = "";
            try
            {
                var data = OA_Info.ConnectDB("SELECT * FROM [vw_ChatZaloRequestSend]");
                if (data != null && data.Rows.Count > 0)
                {
                    var list_phone_approved = new List<string>();
                    var access_token = OA_Info.access_token();

                    for (int i = 0; i < data.Rows.Count; i++)
                    {
                        var rowData = data.Rows[i];
                        var MobilePhone = rowData["MobilePhone"].ToString();
                        var RequestID = rowData["RequestID"].ToString();

                        var phone_org = MobilePhone;

                        string replacement = "84";
                        string result = replacement + MobilePhone.Substring(1);

                        var input = new
                        {
                            phone = result,
                            call_type = "audio",
                            reason_code = 101
                        };

                        var zalo = new ZaloParams()
                        {
                            access_token = OA_Info.access_token(),
                            content_type = "application/json",

                            method = "POST",
                            url = ZaloUrl.url_request_consent,
                            input = JsonConvert.SerializeObject(input),
                        };

                        output = ZaloIntermadiary.API_Intermadiary(zalo, ref error);



                        //check consent > vì gửi request ko return về expired 

                        var input2 = new { phone = result };

                        var zalo2 = new ZaloParams()
                        {
                            access_token = OA_Info.access_token(),
                            content_type = "application/json",

                            method = "GET",
                            url = ZaloUrl.url_checkconsent + JsonConvert.SerializeObject(input2),
                        };

                        var output2 = ZaloIntermadiary.API_Intermadiary(zalo2, ref error);


                        //quy về bảng queue để xử lý theo stored định kỳ
                        SqlConnection connection = new SqlConnection(Settings1.Default.connectionString);

                        //type: 1-check / 2-send
                        string query = $"INSERT INTO [tbl_ChatZaloRequestQueue](random_id,  phone, output) VALUES(newid(), '{phone_org}', N'{output}')";
                        string query2 = $"INSERT INTO [tbl_ChatZaloRequestQueue](random_id,  phone, output) VALUES(newid(), '{phone_org}', N'{output2}')";

                        SqlCommand cmd = new SqlCommand(query, connection);
                        SqlCommand cmd2 = new SqlCommand(query2, connection);

                        try
                        {
                            connection.Open();
                            cmd.ExecuteNonQuery();
                            cmd2.ExecuteNonQuery();
                        }
                        catch (SqlException e)
                        {
                            //WriteToFile("Error Generated. Details: " + e.ToString());
                        }
                        finally
                        {
                            connection.Close();
                        }

                        #region tạm thời bỏ


                        //var jsonConvert = (JObject)JsonConvert.DeserializeObject(output);

                        //var errorNew = jsonConvert["error"].Value<int>();
                        //var msg = jsonConvert["message"].Value<string>();

                        //string connectionString = Settings1.Default.connectionString;
                        //SqlConnection connection = new SqlConnection(@connectionString);

                        //String query = "UPDATE TOP (1) dbo.tbl_ChatZaloRequestDetails" +
                        //    " SET LastSendOn = @LastSendOn, LastSendCode = @LastSendCode, LastSendMsg = @LastSendMsg" +
                        //    " WHERE RequestID = @RequestID AND MobilePhone = @MobilePhone";

                        //SqlCommand command = new SqlCommand(query, connection);

                        //command.Parameters.AddWithValue("@LastSendOn", DateTime.Now);
                        //command.Parameters.AddWithValue("@LastSendCode", errorNew);
                        //command.Parameters.AddWithValue("@LastSendMsg", msg);
                        //command.Parameters.AddWithValue("@RequestID", RequestID);
                        //command.Parameters.AddWithValue("@MobilePhone", MobilePhone);

                        //try
                        //{
                        //    connection.Open();
                        //    command.ExecuteNonQuery();
                        //}
                        //catch (SqlException e)
                        //{
                        //    WriteToFile("Error Generated. Details: " + e.ToString());
                        //}
                        //finally
                        //{
                        //    connection.Close();
                        //}

                        ////nếu những sđt này có chấp nhận thì gửi check xem bao giờ hết hạn
                        //if (Zalo.IsApprovedCode.Contains(errorNew))
                        //{
                        //    list_phone_approved = new List<string> { result };
                        //    Zalo.update_expired_consent(list_phone_approved, RequestID);
                        //}
                        #endregion


                    }

                }
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - RequestConsent Error: " + ex.Message);
            }
        }

        #endregion

        #region -- Call: Check Consent --

        public void CheckConsent()
        {
            try
            {
                var client = new RestClient(Zalo.apiUrl + "ChatZalo/User/GetListUserForCheckConsent");
                client.Timeout = -1;
                var request = new RestRequest(Method.GET);

                IRestResponse response = client.Execute(request);
                var responseConvert = (JObject)JsonConvert.DeserializeObject(response.Content);

                WriteToFile(DateTime.Now + ": " + response.Content);
            }
            catch (Exception ex)
            {
                WriteToFile(DateTime.Now + " - CheckConsent Error: " + ex.Message);
            }
        }

        #endregion

        #endregion
    }
}