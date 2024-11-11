namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_ChatZaloSettings
    {
        public int id { get; set; }

        public string text { get; set; }

        public string value { get; set; }

        public string expires_in { get; set; }

        public DateTime? modified_on { get; set; }
    }
}
