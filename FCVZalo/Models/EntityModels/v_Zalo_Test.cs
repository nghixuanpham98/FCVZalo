namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class v_Zalo_Test
    {
        [Key]
        [Column(Order = 0)]
        public Guid CustomerId { get; set; }

        [Key]
        [Column(Order = 1)]
        [StringLength(501)]
        public string FullName { get; set; }

        [Key]
        [Column(Order = 2)]
        [StringLength(50)]
        public string SalesForceId { get; set; }

        [StringLength(51)]
        public string mobilephone { get; set; }

        [StringLength(51)]
        public string phone { get; set; }

        [StringLength(250)]
        public string email { get; set; }

        public DateTime? Birthdate { get; set; }

        [Key]
        [Column(Order = 3)]
        [StringLength(1006)]
        public string Address { get; set; }

        [Key]
        [Column(Order = 4)]
        [StringLength(4000)]
        public string Subject { get; set; }

        [Key]
        [Column(Order = 5)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Priority { get; set; }
    }
}
