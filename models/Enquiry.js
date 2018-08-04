const mongoose= require("mongoose")
const Schema= mongoose.Schema
let Counter= mongoose.model('counter')

let DealerSchema, Customer, Product, FinanceDetail, FinalEnquiry, AddressSchema

const EnquirySchema= new Schema({
  slno: { type: Number, default: 0 },
  dealer: {
    dealerName: String,
    location: String,
    dealerSalesPerson: String,
    contactNumber: Number,
    dateOfEnquiryGeneration: String
  },
  customer: {
    prospectName: String,
    fatherName: String,
    contactNumber: String,
    village: String,
    taluk: String,
    district: String,
    address: {
      address_1: String,
      address_2: String,
      landmark: String,
      city: String,
      county: String,
      country: String,
      state: String,
      postalCode: String
    }
  },
  product: {
    referencedBy: String,
    influencedBy: String,
    interestedProduct: String,
    exchangeMakeModel: String,
    expectedPriceOnExchange: Number
  },
  financeDetail: {
    projectedPrice: Number,
    marginMoney: Number,
    financeRequired: String,
    paymentMode: String
  },
  finalEnquiry: {
    landInAcres: String,
    climate: String,
    expectedDateOfEnquiryClosure: String,
    enquiryStatus: String,
    remark: String
  }
},{
  timestamps: true
})

EnquirySchema.pre('save',function(next){
  Counter.findByIdAndUpdate({ _id: 'enquirySlNo'},{ $inc: { seq: 1 } })
   .then((counter) => {
     this.slno=counter.seq
     next()
   })
   .catch((error) => {
     return next(error)
   })
})

EnquirySchema.methods.toEnquiryJSON= function() {
  return {
    slno: this.slno,
    id: this._id,
    dealerName: this.dealer.dealerName,
    prospectName: this.customer.prospectName,
    customerContactNumber: this.customer.contactNumber,
    product: this.product.interestedProduct,
    enquiryStatus: this.finalEnquiry.enquiryStatus,
    createdAt: this.createdAt
  }
}

EnquirySchema.methods.toEnquiryDetailJSON = function() {
  return {
    slno: this.slno,
    dealer: this.dealer,
    customer: this.customer,
    product: this.product,
    financeDetail: this.financeDetail,
    finalEnquiry: this.finalEnquiry,
    id: this._id
  }
}

mongoose.model("enquiry",EnquirySchema)
