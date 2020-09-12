var mongoose = require('mongoose');

var purchaseSchema = new mongoose.Schema({
    buyer: {
        type: String
    },
    seller: {
        type: String
    },
    quantity: {
        type: Number,
        required: true
    },
    buyerEmail: {
        type: String
    },
    sellerEmail: {
        type: String
    },
    purchaseDate: {
        type: String
    }
});

module.exports = mongoose.model('Purchase', purchaseSchema);