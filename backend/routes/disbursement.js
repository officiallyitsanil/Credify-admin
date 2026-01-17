const express = require('express');
const router = express.Router();
const Disbursement = require('../models/Disbursement');
const Loan = require('../models/Loan');
const { verifyAdmin } = require('../middleware/auth');

// Get all disbursements
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const { status, paymentMethod, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;
        if (paymentMethod) query.paymentMethod = paymentMethod;

        const disbursements = await Disbursement.find(query)
            .populate('loanId', 'loanAmount loanType')
            .populate({
                path: 'loanId',
                populate: { path: 'userId', select: 'fullName phoneNumber email' }
            })
            .populate('processedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Disbursement.countDocuments(query);

        res.json({
            disbursements,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get disbursement by loan ID
router.get('/loan/:loanId', async (req, res) => {
    try {
        const disbursement = await Disbursement.findOne({ loanId: req.params.loanId })
            .populate('loanId', 'loanAmount loanType')
            .populate('processedBy', 'name email');

        if (!disbursement) {
            return res.status(404).json({ message: 'Disbursement not found' });
        }

        res.json(disbursement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create disbursement
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const disbursement = new Disbursement(req.body);
        await disbursement.save();

        // Update loan status
        await Loan.findByIdAndUpdate(req.body.loanId, {
            status: 'disbursed',
            disbursementId: disbursement._id
        });

        res.status(201).json(disbursement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update disbursement status
router.patch('/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const disbursement = await Disbursement.findByIdAndUpdate(
            req.params.id,
            {
                status,
                remarks,
                disbursedAt: status === 'completed' ? new Date() : null
            },
            { new: true }
        ).populate('loanId');

        if (!disbursement) {
            return res.status(404).json({ message: 'Disbursement not found' });
        }

        res.json(disbursement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete disbursement
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const disbursement = await Disbursement.findByIdAndDelete(req.params.id);
        if (!disbursement) {
            return res.status(404).json({ message: 'Disbursement not found' });
        }
        res.json({ message: 'Disbursement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
