const mongoose = require('mongoose');
let router = require('express').Router();
const auth = require('../auth');
let Enquiry = mongoose.model('enquiry');

router.get('/list',auth.required, function(req,res,next){
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  Promise.all([
    Enquiry.find({})
    .skip(Number(offset))
    .limit(Number(limit))
    .sort({createdAt: 'desc'}).exec(),
    Enquiry.count({}).exec()
  ]).then((results) => {
      const enquiries = results[0]
      const count= results[1]
      return res.json({
          enquiries: enquiries.map( enquiry => {
            return enquiry.toEnquiryJSON()
          }),
          count
        }
      )
    })
    .catch((error) => {
      console.warn(error);
      next()
    })
})

router.post('/', auth.required, function(req,res,next){
  let enquiry= new Enquiry(req.body)
   enquiry.save()
    .then(() => {
      if(enquiry.isNew) {
        return res.status(404).json({
          message: "Your requesting JSON input may be invalid",
          statu: 400
        })
      } else {
        return res.json(enquiry)
      }
    })
    .catch((error) => {
      console.warn(error);
      next(error)
    })
})

router.put('/', auth.required, function(req, res, next){  
  Enquiry.findById(req.body.id).then(function(enquiry){
    if(!enquiry){       
		return res.status(404).json({
        message: "Enquiry ID not found",
        statu: 404
      })
	}
   // only update fields that were actually passed...
    if(typeof req.body.dealer !== 'undefined'){
      enquiry.dealer = req.body.dealer;
    }
    if(typeof req.body.customer !== 'undefined'){
      enquiry.customer = req.body.customer;
    }
    if(typeof req.body.product !== 'undefined'){
      enquiry.product = req.body.product;
    }
    if(typeof req.body.financeDetail !== 'undefined'){
      enquiry.financeDetail = req.body.financeDetail;
    }
    if(typeof req.body.finalEnquiry !== 'undefined'){
      enquiry.finalEnquiry = req.body.finalEnquiry;
    }	
    return enquiry.save().then(function(){
      return res.json(enquiry.toEnquiryDetailJSON());
    });
  }).catch(next);
});


router.get('/:id', auth.required, function(req,res,next){
    Enquiry.findOne({ _id: req.params.id})
    .then((enquiry) => {
      if(enquiry === null ) {
        return res.status(404).json({
          message: "User ID not found",
          statu: 404
        })
      } else {
        if(typeof req.query.detail !== 'undefined'){
          if(req.query.detail === "true") {
            return res.json(enquiry.toEnquiryDetailJSON())
          } else {
            return res.json(enquiry.toEnquiryJSON())
          }
        } else {
          return res.json(enquiry.toEnquiryJSON())
        }
      }
    })
    .catch((error) => {
      console.warn(error);
      next()
    })
})


module.exports = router;
