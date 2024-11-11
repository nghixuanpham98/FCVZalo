namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_ChatZaloSharedInfo
    {
        public Guid ID { get; set; }

        [StringLength(50)]
        public string UserID { get; set; }

        [StringLength(250)]
        public string Name { get; set; }

        [StringLength(50)]
        public string PhoneNumber { get; set; }

        [StringLength(250)]
        public string Ward { get; set; }

        [StringLength(250)]
        public string District { get; set; }

        [StringLength(250)]
        public string City { get; set; }

        public string Address { get; set; }
    }
}
