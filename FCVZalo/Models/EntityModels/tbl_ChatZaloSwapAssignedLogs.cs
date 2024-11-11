namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_ChatZaloSwapAssignedLogs
    {
        [Key]
        public Guid SwapID { get; set; }

        [StringLength(50)]
        public string UserID { get; set; }

        public Guid? StaffSupportPresentID { get; set; }

        public Guid? StaffSupportBeforeID { get; set; }

        public string Note { get; set; }

        public DateTime? CreatedOn { get; set; }

        public Guid? CreatedBy { get; set; }

        public DateTime? ModifiedOn { get; set; }

        public Guid? ModifiedBy { get; set; }
    }
}
