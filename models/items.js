var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    owner: {
        type: String
    },
    code: {
        type: Number
    },
    ownerEmail: {
        type: String
    }
});

module.exports = mongoose.model('item', itemSchema);