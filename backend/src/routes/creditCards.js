const express = require('express');
const { body, validationResult } = require('express-validator');
const CreditCard = require('../models/CreditCard');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/credit-cards
router.get('/', auth, async (req, res, next) => {
  try {
    const cards = await CreditCard.find({ user: req.user.id }).sort({ createdAt: 1 });
    return res.json(cards);
  } catch (err) {
    return next(err);
  }
});

// POST /api/credit-cards
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('lastFourDigits').isLength({ min: 4, max: 4 }).withMessage('Last 4 digits required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, lastFourDigits, billAmount, dueDate, isPaid, limit } = req.body;
      const card = new CreditCard({
        user: req.user.id,
        name,
        lastFourDigits,
        billAmount,
        dueDate,
        isPaid,
        limit,
      });
      await card.save();
      return res.status(201).json(card);
    } catch (err) {
      return next(err);
    }
  }
);

// PUT /api/credit-cards/:id
router.put('/:id', auth, async (req, res, next) => {
  try {
    const oldCard = await CreditCard.findOne({ _id: req.params.id, user: req.user.id });
    if (!oldCard) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    const updates = (({ name, lastFourDigits, billAmount, dueDate, isPaid, limit }) => ({
      name,
      lastFourDigits,
      billAmount,
      dueDate,
      isPaid,
      limit,
    }))(req.body);

    const card = await CreditCard.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );

    // Auto-create expense transaction when card bill transitions to paid
    if (!oldCard.isPaid && card.isPaid && card.billAmount > 0) {
      await Transaction.create({
        user: req.user.id,
        type: 'expense',
        amount: card.billAmount,
        description: 'Payment Made',
        category: 'Credit Card',
        date: new Date(),
        paymentMode: 'credit_card',
        creditCard: card._id,
      });
    }


    return res.json(card);
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/credit-cards/:id - Partial update (e.g., mark as paid)
router.patch('/:id', auth, async (req, res, next) => {
  try {
    const oldCard = await CreditCard.findOne({ _id: req.params.id, user: req.user.id });
    if (!oldCard) {
      return res.status(404).json({ message: 'Credit card not found' });
    }

    const card = await CreditCard.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );

    // Auto-create expense transaction when card bill transitions to paid
    if (!oldCard.isPaid && card.isPaid && card.billAmount > 0) {
      await Transaction.create({
        user: req.user.id,
        type: 'expense',
        amount: card.billAmount,
        description: 'Payment Made',
        category: 'Credit Card',
        date: new Date(),
        paymentMode: 'credit_card',
        creditCard: card._id,
      });
    }


    return res.json(card);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/credit-cards/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const card = await CreditCard.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!card) {
      return res.status(404).json({ message: 'Credit card not found' });
    }
    return res.json({ message: 'Credit card deleted' });
  } catch (err) {
    return next(err);
  }
});

// GET /api/credit-cards/:id/transactions
router.get('/:id/transactions', auth, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
      creditCard: req.params.id,
    })
      .populate('category')
      .sort({ date: -1 });

    return res.json(transactions);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

