namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_ChatZaloRequestQueue
    {
        [Key]
        public Guid random_id { get; set; }

        [StringLength(50)]
        public string phone { get; set; }

        public string output { get; set; }

        public int? type { get; set; }

        public DateTime? insert_time { get; set; }

        public DateTime? done_time { get; set; }
    }
}
