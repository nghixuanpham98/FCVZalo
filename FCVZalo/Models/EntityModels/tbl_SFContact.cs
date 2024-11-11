namespace FCVZalo.Models.EntityModels
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class tbl_SFContact
    {
        public Guid id { get; set; }

        [Key]
        [StringLength(50)]
        public string sfid { get; set; }

        [StringLength(50)]
        public string accountid { get; set; }

        [StringLength(250)]
        public string firstname { get; set; }

        [StringLength(250)]
        public string lastname { get; set; }

        [StringLength(50)]
        public string recordtypeid { get; set; }

        [StringLength(50)]
        public string phone { get; set; }

        [StringLength(50)]
        public string mobilephone { get; set; }

        [StringLength(250)]
        public string email { get; set; }

        [StringLength(250)]
        public string leadsource { get; set; }

        public DateTime? birthdate { get; set; }

        public bool? donotcall { get; set; }

        [StringLength(50)]
        public string ownerid { get; set; }

        public DateTime? createddate { get; set; }

        [StringLength(50)]
        public string createdbyid { get; set; }

        public DateTime? lastmodifieddate { get; set; }

        [StringLength(50)]
        public string lastmodifiedbyid { get; set; }

        public DateTime? systemmodstamp { get; set; }

        [StringLength(250)]
        public string country__c { get; set; }

        [StringLength(250)]
        public string province__c { get; set; }

        [StringLength(250)]
        public string region__c { get; set; }

        [StringLength(250)]
        public string district__c { get; set; }

        [StringLength(50)]
        public string current_product_used__c { get; set; }

        public DateTime? due_date__c { get; set; }

        [StringLength(50)]
        public string gender__c { get; set; }

        [StringLength(50)]
        public string otherphone2__c { get; set; }

        public DateTime? new_dataofmonth__c { get; set; }

        [StringLength(250)]
        public string new_datasource__c { get; set; }

        [StringLength(250)]
        public string new_datatype1__c { get; set; }

        [StringLength(250)]
        public string new_datatype2__c { get; set; }

        [StringLength(250)]
        public string na_code__c { get; set; }

        [StringLength(250)]
        public string facebook_profile_c__c { get; set; }

        [StringLength(250)]
        public string legacy_location__c { get; set; }

        [StringLength(50)]
        public string new_previousproductused__c { get; set; }

        [StringLength(250)]
        public string email__c { get; set; }

        [StringLength(250)]
        public string nutriadvisorno__c { get; set; }

        [StringLength(250)]
        public string status__c { get; set; }

        [StringLength(250)]
        public string contact_status__c { get; set; }

        [StringLength(250)]
        public string et4ae5__mobile_country_code__c { get; set; }

        [StringLength(250)]
        public string order_type__c { get; set; }

        [StringLength(250)]
        public string street__c { get; set; }

        public bool? isdeleted { get; set; }
    }
}
