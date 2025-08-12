const mongoose = require('mongoose');

const batchHistorySchema = new mongoose.Schema({
  from: String,
  to: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  action: {
    type: String,
    enum: ['CREATED', 'CERTIFIED', 'REJECTED', 'PURCHASED']
  }
});

const batchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  cropName: {
    type: String,
    required: true
  },
  cropVariety: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  harvestDate: {
    type: Date,
    required: true
  },
  farmer: {
    type: String,  // Ethereum address
    required: true
  },
  certifier: String,  // Ethereum address
  retailer: String,   // Ethereum address
  status: {
    type: String,
    enum: ['CREATED', 'CERTIFIED', 'REJECTED', 'PURCHASED'],
    default: 'CREATED'
  },
  cropHealth: String,
  expiry: Date,
  labResults: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  },
  certifiedAt: Date,
  purchasedAt: Date,
  price: {
    type: Number,
    required: true
  },
  history: [batchHistorySchema]
});

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;