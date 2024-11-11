namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_ChatZaloMessages
    {
        [StringLength(50)]
        public string ID { get; set; }

        public int? Src { get; set; }

        [StringLength(50)]
        public string Time { get; set; }

        [StringLength(50)]
        public string Type { get; set; }

        public string MessageContent { get; set; }

        public string Links { get; set; }

        public string Thumb { get; set; }

        public string Url { get; set; }

        public string Description { get; set; }

        [StringLength(50)]
        public string FromID { get; set; }

        [StringLength(250)]
        public string FromDisplayName { get; set; }

        public string FromAvatar { get; set; }

        [StringLength(50)]
        public string ToID { get; set; }

        [StringLength(250)]
        public string ToDisplayName { get; set; }

        public string ToAvatar { get; set; }

        public string Location { get; set; }

        public bool? IsRecent { get; set; }
    }
}
