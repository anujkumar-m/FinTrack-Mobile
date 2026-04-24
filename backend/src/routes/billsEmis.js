const express = require('express');
const { body, validationResult } = require('express-validator');
const Bill = require('../models/Bill');
const EMI = require('../models/EMI');
const auth = require('../middleware/auth');
const { getMonthRange } = require('../utils/dateUtils');

const router = express.Router();

// Bills
router.get('/bills', auth, async (req, res, next) => {
  try {
    const { month } = req.query;
    const filter = { user: req.user.id };
    if (month) {
      filter.month = month;
    }
    const bills = await Bill.find(filter).sort({ dueDate: 1 });
    return res.json(bills);
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/bills',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('amount').isNumeric().withMessage('Amount is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('month').optional().matches(/^\d{4}-\d{2}$/).withMessage('Month must be YYYY-MM'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, amount, category, notes, dueDate, month, isPaid, isRecurring } = req.body;
      const derivedMonth = month || new Date(dueDate).toISOString().slice(0, 7);
      const bill = new Bill({
        user: req.user.id,
        name,
        amount,
        category,
        notes,
        dueDate,
        month: derivedMonth,
        isPaid,
        isRecurring,
      });
      await bill.save();
      return res.status(201).json(bill);
    } catch (err) {
      return next(err);
    }
  }
);

router.put('/bills/:id', auth, async (req, res, next) => {
  try {
    const updates = (({ name, amount, category, notes, dueDate, month, isPaid, isRecurring }) => ({
      name,
      amount,
      category,
      notes,
      dueDate,
      month,
      isPaid,
      isRecurring,
    }))(req.body);

    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    return res.json(bill);
  } catch (err) {
    return next(err);
  }
});

router.delete('/bills/:id', auth, async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    return res.json({ message: 'Bill deleted' });
  } catch (err) {
    return next(err);
  }
});

// EMIs
router.get('/emis', auth, async (req, res, next) => {
  try {
    const { month } = req.query;
    const filter = { user: req.user.id };
    if (month) {
      const { start, end } = getMonthRange(month);
      filter.startDate = { $lte: end };
      filter.endDate = { $gte: start };
    }
    const emis = await EMI.find(filter).sort({ startDate: 1 });
    return res.json(emis);
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/emis',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('amount').isNumeric().withMessage('Amount is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, amount, startDate, endDate, dayOfMonth, isActive } = req.body;
      const emi = new EMI({
        user: req.user.id,
        name,
        amount,
        startDate,
        endDate,
        dayOfMonth,
        isActive,
      });
      await emi.save();
      return res.status(201).json(emi);
    } catch (err) {
      return next(err);
    }
  }
);

// Backward-compatible singular endpoint used by some clients
router.post(
  '/emi',
  auth,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('amount').isNumeric().withMessage('Amount is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, amount, startDate, endDate, dayOfMonth, isActive } = req.body;
      const emi = new EMI({
        user: req.user.id,
        name,
        amount,
        startDate,
        endDate,
        dayOfMonth,
        isActive,
      });
      await emi.save();
      return res.status(201).json(emi);
    } catch (err) {
      return next(err);
    }
  }
);

router.put('/emis/:id', auth, async (req, res, next) => {
  try {
    const updates = (({ name, amount, startDate, endDate, dayOfMonth, isActive }) => ({
      name,
      amount,
      startDate,
      endDate,
      dayOfMonth,
      isActive,
    }))(req.body);

    const emi = await EMI.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true }
    );

    if (!emi) {
      return res.status(404).json({ message: 'EMI not found' });
    }

    return res.json(emi);
  } catch (err) {
    return next(err);
  }
});

router.delete('/emis/:id', auth, async (req, res, next) => {
  try {
    const emi = await EMI.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!emi) {
      return res.status(404).json({ message: 'EMI not found' });
    }
    return res.json({ message: 'EMI deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

