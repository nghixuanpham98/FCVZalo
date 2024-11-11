namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_ChatZaloRequests
    {
        public Guid ID { get; set; }

        [StringLength(500)]
        public string Name { get; set; }

        public string Description { get; set; }

        public DateTime? SendOn { get; set; }

        public DateTime? LastSendOn { get; set; }

        public string ViewName { get; set; }

        public string SqlQuery { get; set; }

        public DateTime? LastLoadData { get; set; }

        public bool? IsActive { get; set; }

        public DateTime? CreatedOn { get; set; }

        public Guid? CreatedBy { get; set; }

        public DateTime? ModifiedOn { get; set; }

        public Guid? ModifiedBy { get; set; }
    }
}
