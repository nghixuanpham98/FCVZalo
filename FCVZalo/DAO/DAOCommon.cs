using FCVZalo.Models.EntityModels;
using FCVZalo.Models.CustomModels;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Security.Cryptography;
using System.Text;

namespace FCVZalo.DAO
{
    public class DAOCommon
    {
        public static DataTable ExecSQL(string Query)
        {
            var connectionString = ConfigurationManager.AppSettings["ConnectDB"];

            using (SqlConnection connection = new SqlConnection(connectionString))
            {

                try
                {
                    connection.Open();
                    SqlCommand cmd = new SqlCommand(Query, connection);
                    cmd.CommandType = CommandType.Text;
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    int a = cmd.ExecuteNonQuery();
                    connection.Close();
                    return dt;
                }
                catch (Exception)
                {
                    connection.Close();
                    return null;

                }
            }

        }

        public static async Task<DataTable> ExecSQLSync(string Query)
        {
            var connectionString = ConfigurationManager.AppSettings["ConnectDB"];
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                try
                {
                    if (connection.State.Equals(ConnectionState.Closed))
                        await connection.OpenAsync();
                    SqlCommand cmd = new SqlCommand(Query, connection);
                    cmd.CommandType = CommandType.Text;
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    int a = cmd.ExecuteNonQuery();
                    connection.Close();
                    return dt;
                }
                catch (Exception ex)
                {
                    connection.Close();
                    return null;

                }
            }

        }

        public static bool IsPhoneNumber(string number)
        {
            return Regex.Match(number, @"^(\+[0-9]{9})$").Success;
        }

        public static void PagingStore(string SelectColumn, string TableOrView, string WhereClause, string OrderByColumn, string OrderByDirection, int PageIndex, int PageSize,
                 ref int TotalPages, ref int TotalRecords, ref DataTable DT)
        {
            SqlConnection _connect = new SqlConnection(ConfigurationManager.AppSettings["ConnectDB"]);
            _connect.Open();
            DbDataReader rdr = null;
            try
            {
                using (var command = _connect.CreateCommand())
                {
                    TotalPages = 1;
                    TotalRecords = 0;

                    SqlParameter[] dbParams = new SqlParameter[9];

                    #region Params
                    dbParams[0] = new SqlParameter();
                    dbParams[0].ParameterName = "@TableOrView";
                    dbParams[0].Value = TableOrView;

                    dbParams[1] = new SqlParameter();
                    dbParams[1].ParameterName = "@SelectedPage";
                    dbParams[1].Value = PageIndex;

                    dbParams[2] = new SqlParameter();
                    dbParams[2].ParameterName = "@PageSize";
                    dbParams[2].Value = PageSize;

                    dbParams[3] = new SqlParameter();
                    dbParams[3].ParameterName = "@Columns";
                    dbParams[3].Value = SelectColumn;

                    dbParams[4] = new SqlParameter();
                    dbParams[4].ParameterName = "@OrderByColumn";
                    dbParams[4].Value = OrderByColumn;

                    dbParams[5] = new SqlParameter();
                    dbParams[5].ParameterName = "@OrderByDirection";
                    dbParams[5].Value = OrderByDirection;

                    dbParams[6] = new SqlParameter();
                    dbParams[6].ParameterName = "@WhereClause";
                    dbParams[6].Value = WhereClause;

                    dbParams[7] = new SqlParameter();
                    dbParams[7].ParameterName = "@totalPages";
                    dbParams[7].DbType = DbType.Int32;
                    dbParams[7].Direction = ParameterDirection.Output;

                    dbParams[8] = new SqlParameter();
                    dbParams[8].ParameterName = "@totalRecords";
                    dbParams[8].DbType = DbType.Int32;
                    dbParams[8].Direction = ParameterDirection.Output;

                    #endregion

                    command.CommandText = "pro_IVG_Paging";
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddRange(dbParams);
                    object obj = command.ExecuteScalar();


                    try
                    {
                        TotalPages = Convert.ToInt32(command.Parameters["@totalPages"].Value);
                    }
                    catch (Exception)
                    {
                        TotalPages = 0;

                    }

                    try
                    {
                        TotalRecords = Convert.ToInt32(command.Parameters["@totalRecords"].Value);
                    }
                    catch (Exception)
                    {
                        TotalRecords = 0;
                    }



                    rdr = command.ExecuteReader(CommandBehavior.CloseConnection);
                    var dt = new DataTable();
                    dt.Load(rdr);
                    DT = dt;


                    rdr.Close();
                    _connect.Close();

                }


            }
            catch (Exception)
            {
                if (rdr != null)
                {
                    rdr.Close();
                }
                _connect.Close();

            }

        }

        #region WRITE LOG
        public static void WriteLog(object Message)
        {
            if (!System.IO.Directory.Exists(HttpContext.Current.Server.MapPath("~/Log")))
            {
                System.IO.Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/Log"));
            }

            string path = HttpContext.Current.Server.MapPath("~/Log/" + DateTime.Now.ToString("yyyyMMdd") + ".txt");
            if (!System.IO.File.Exists(path))
            {
                System.IO.File.Create(path).Close();
                TextWriter tw = new StreamWriter(path, true);
                tw.WriteLine($"\n{DateTime.Now.ToString("HH:mm:ss")}\t{Message}");
                tw.Close();
            }
            else if (System.IO.File.Exists(path))
            {
                TextWriter tw = new StreamWriter(path, true);
                tw.WriteLine($"\n{DateTime.Now.ToString("HH:mm:ss")}\t{Message}");
                tw.Close();
            }
        }

        public static void WriteLogWebhook(object Message)
        {
            if (!System.IO.Directory.Exists(HttpContext.Current.Server.MapPath("~/Log/Webhook")))
            {
                System.IO.Directory.CreateDirectory(HttpContext.Current.Server.MapPath("~/Log/Webhook"));
            }

            string path = HttpContext.Current.Server.MapPath("~/Log/Webhook/" + DateTime.Now.ToString("yyyyMMdd") + ".txt");
            if (!System.IO.File.Exists(path))
            {
                System.IO.File.Create(path).Close();
                TextWriter tw = new StreamWriter(path, true);
                tw.WriteLine($"\n{DateTime.Now.ToString("HH:mm:ss")}\t{Message}");
                tw.Close();
            }
            else if (System.IO.File.Exists(path))
            {
                TextWriter tw = new StreamWriter(path, true);
                tw.WriteLine($"\n{DateTime.Now.ToString("HH:mm:ss")}\t{Message}");
                tw.Close();
            }
        }

        public static void WriteLogCatch(string function, Exception ex)
        {
            WriteLog($"CATCH - {function}\nMessage:\t{ex.Message}\nInnerException:\t{ex.InnerException}");
        }

        public static int LineNumber([System.Runtime.CompilerServices.CallerLineNumber] int lineNumber = 0)
        {
            return lineNumber;
        }
        #endregion

        #region Md5Hash
        public class VerifyMD5
        {
            public static string GetMd5Hash(string input)
            {
                MD5 md5Hash = MD5.Create();
                byte[] data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(input));

                StringBuilder sBuilder = new StringBuilder();

                for (int i = 0; i < data.Length; i++)
                {
                    sBuilder.Append(data[i].ToString("x2"));
                }

                return sBuilder.ToString();
            }
            public static bool VerifyMd5Hash(string input, string hash)
            {
                MD5 md5Hash = MD5.Create();
                string hashOfInput = GetMd5Hash(input);

                StringComparer comparer = StringComparer.OrdinalIgnoreCase;

                if (0 == comparer.Compare(hashOfInput, hash))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
        #endregion
    }
}