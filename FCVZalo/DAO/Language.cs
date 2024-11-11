using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FCVZalo.DAO
{
    public class Language
    {
        public class VN
        {
            public static string alert_required_uspw = "Tài khoản hoặc mật khẩu bắt buộc";
            public static string alert_invalid_uspw = "Tài khoản hoặc mật khẩu không đúng";
            public static string alert_invalid_us_em = "Sold Code hoặc email không đúng";

            public static string alert_invalid_user = "User không tồn tại";

            public static string alert_rs_pw_success = "Mật khẩu của bạn đã được đặt lại là: 123456";
            public static string alert_required_token = "Token bắt buộc";
            public static string alert_required_param = "Parameters bắt buộc";
            public static string alert_id_does_not_exist = "ID không tồn tại";
            public static string alert_invalid_token = "Token không đúng hoặc đã hết hạn";
            public static string alert_update_success = "Cập nhật thành công";
            public static string alert_create_success = "Tạo mới thành công";
            public static string alert_delete_success = "Xóa dữ liệu thành công";
            public static string alert_notFoundData = "Không tìm thấy dữ liệu";
            public static string alert_notFoundStaff = "Tất cả Nhân viên hỗ trợ hiện đang bận. Quý khách vui lòng để lại thông tin để Nhân viên liên hệ lại!";
            public static string alert_Exception = "Đã có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ quản trị viên.";
            public static string alert_invalid_sc = "Sold Code không tồn tại! Vui lòng kiểm tra lại hoặc liên hệ quản trị viên.";
            public static string alert_al_exists_acc = "Tài khoản đã tồn tại! Vui lòng kiểm tra lại hoặc liên hệ quản trị viên.";
            public static string alert_al_exists_user = "User đã tồn tại! Vui lòng kiểm tra lại hoặc liên hệ quản trị viên.";
            public static string alert_al_exists_msg = "Tin nhắn đã tồn tại! Vui lòng kiểm tra lại hoặc liên hệ quản trị viên.";

            //May.2023
            public static string alert_invalid_sfId = $"Thiếu cột [SalesForceId] hoặc [sfid]";
            public static string alert_invalid_mobilephone = "Cột [mobilephone] bị thiếu hoặc rỗng";
            public static string alert_try_again = "Đã có lỗi xảy ra! Vui lòng thử lại sau.";
        }

        public class EN
        {
            public static string alert_required_token = "Token field are required";

            public static string alert_required_uspw = "Username & Password are required";
            public static string alert_invalid_uspw = "Username & Password is invalid";

            public static string alert_required_param = "Parameters are required";
            public static string alert_id_does_not_exist = "ID does not exist";

            public static string alert_invalid_token = "Token is invalid or has expired";

            public static string alert_update_success = "Update successful";
            public static string alert_create_success = "Create successful";
            public static string alert_delete_success = "Delete successful";
            public static string alert_notFoundData = "Cannot found data";
            public static string alert_Exception = "An error has occurred, please try again later or contact Administrator";
        }
    }
}