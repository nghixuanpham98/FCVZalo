using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FCVZalo.Models.CustomModels
{
    public class ParameterModel
    {
        const int maxPageSize = 100;

        public int pageIndex { get; set; }

        public int _pageSize { get; set; }

        public int pageSize
        {

            get { return _pageSize; }
            set
            {
                _pageSize = value;
            }
        }

        public string keySearch { get; set; }

        public int sortType { get; set; }

        public string nameOfColumnSort { get; set; }

        public int type { get; set; }

        public string typeOfUser { get; set; }

        public Guid id { get; set; }

        public Guid cusID { get; set; }

        public Guid staffID { get; set; }

        public String staffName { get; set; }

        public string msgIDZalo { get; set; }

        public string followerIDZalo { get; set; }

        public string lastMsgZalo { get; set; }

        public string typeLastMsgZalo { get; set; }

        public string code { get; set; }

        public string OrderByColumn { get; set; }

        public string OrderByDirection { get; set; }

        public DateTime? ModifiedOn { get; set; }

        public string accessToken { get; set; }

        public string refreshToken { get; set; }

        public string expiresIn { get; set; }
    }
}