namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_ChatZaloUsers
    {
        [Key]
        [StringLength(50)]
        public string UserID { get; set; }

        [StringLength(250)]
        public string DisplayName { get; set; }

        public int? UserGender { get; set; }

        [StringLength(50)]
        public string UserIDByApp { get; set; }

        public string AvatarDefaultApp { get; set; }

        public DateTime? BirthDate { get; set; }

        public bool? IsFollower { get; set; }

        public string LastMessage { get; set; }

        [StringLength(50)]
        public string TypeLastMessage { get; set; }

        [StringLength(50)]
        public string LastTimeMessage { get; set; }

        public DateTime? CreatedOn { get; set; }

        public Guid? CreatedBy { get; set; }

        public DateTime? ModifiedOn { get; set; }

        public Guid? ModifiedBy { get; set; }
    }
}
