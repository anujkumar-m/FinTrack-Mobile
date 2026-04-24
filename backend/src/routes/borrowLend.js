const express = require('express');
const { body, validationResult } = require('express-validator');
const BorrowLend = require('../models/BorrowLend');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/borrow-lend
router.get('/', auth, async (req, res, next) => {
  try {
    const entries = await BorrowLend.find({ user: req.user.id }).sort({ date: -1 });
    return res.json(entries);
  } catch (err) {
    return next(err);
  }
});

// POST /api/borrow-lend
router.post(
  '/',
  auth,
  [
    body('type').isIn(['borrowed', 'lent']).withMessage('Invalid type'),
    body('personName').notEmpty().withMessage('Person name is required'),
    body('amount').isNumeric().withMessage('Amount is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, personName, amount, purpose, date, status } = req.body;
      const entry = new BorrowLend({
        user: req.user.id,
        type,
        personName,
        amount,
        purpose,
        date,
        status,
      });
      await entry.save();
      return res.status(201).json(entry);
    } catch (err) {
      return next(err);
    }
  }
);

// PUT /api/borrow-lend/:id
router.put('/:id', auth, async (req, res, next) => {
  try {
    const updates = (({ type, personName, amount, purpose, date, status }) => ({
      type,
      personName,
      amount,
      purpose,
      date,
      status,
    }))(req.body);

    const entry = await BorrowLend.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    return res.json(entry);
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/borrow-lend/:id - Partial update (e.g., mark as paid)
router.patch('/:id', auth, async (req, res, next) => {
  try {
    const entry = await BorrowLend.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    return res.json(entry);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

