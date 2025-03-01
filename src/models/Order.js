import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }, // Pharmacist placing the order
  medications: [
    {
      medicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 }, // Quantity ordered
    },
  ],
  totalCost: { type: Number, required: true, min: 0 }, // Total cost of order
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending', // Order status
  },
  createdAt: { type: Date, default: Date.now }, // Timestamp when order was created
  updatedAt: { type: Date, default: Date.now }, // Timestamp when order was updated
});

export const Order = mongoose.model('Order', OrderSchema);
