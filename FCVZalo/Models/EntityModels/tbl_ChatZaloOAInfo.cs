namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_ChatZaloOAInfo
    {
        [StringLength(50)]
        public string ID { get; set; }

        public string DisplayName { get; set; }

        public string Description { get; set; }

        public string Avatar { get; set; }

        public string CoverImage { get; set; }

        public bool? IsVerified { get; set; }

        public DateTime? CreatedOn { get; set; }

        public Guid? CreatedBy { get; set; }

        public DateTime? ModifiedOn { get; set; }

        public Guid? ModifiedBy { get; set; }
    }
}
