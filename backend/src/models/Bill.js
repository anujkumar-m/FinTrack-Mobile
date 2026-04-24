const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Store category as a simple string label to match current UI
    category: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    month: {
      type: String, // e.g. "2025-01"
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attachment',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', BillSchema);

