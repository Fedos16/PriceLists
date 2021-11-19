const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
	{
	    Name: String,
		Date: Date,
        Data: Object
	},
  	{
    	timestamps: true
  	}
);

schema.set('toJSON', {
  	virtuals: true
});

module.exports = mongoose.model('PriceList', schema);