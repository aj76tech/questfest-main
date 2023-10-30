const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const cors = require('cors');
app.use(express.static('public_html/a'));


app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://Marketing:Whatever123!@soulocalmarketing.jscoejc.mongodb.net/gameDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', (error) => console.error('Connection error:', error));
db.once('open', () => console.log('Connected to MongoDB'));

const phoneNumberSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    couponsWon: {
        type: Number,
        default: 0
    }
});

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

// Endpoint to store phone number
app.post('/storePhoneNumber', async (req, res) => {
    let phoneNumber = new PhoneNumber({
        phoneNumber: req.body.number
    });
    try {
        await phoneNumber.save();
        res.status(201).json(phoneNumber);
    } catch (error) {
        // Check for duplicate key error (phone number already exists)
        if (error.code === 11000) {
            res.status(400).json({ message: "Phone number already exists." });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
});


// Endpoint to check if phone number already played the quiz
app.get('/checkPhoneNumber/:number', async (req, res) => {
    try {
        let number = await PhoneNumber.findOne({ phoneNumber: req.params.number });
        if (number) {
            res.status(200).json({ played: true });
        } else {
            res.status(200).json({ played: false });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/deletePhoneNumber/:number', async (req, res) => {
    try {
        let result = await PhoneNumber.deleteOne({ phoneNumber: req.params.number });
        if (result.deletedCount === 1) {
            res.status(200).json({ message: "Phone number deleted successfully." });
        } else {
            res.status(404).json({ message: "Phone number not found." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/updateCoupons/:number/:couponsWon', async (req, res) => {
    const { number, couponsWon } = req.params;

    try {
        const result = await PhoneNumber.updateOne(
            { phoneNumber: number },
            { $set: { couponsWon: parseInt(couponsWon, 10) } }
        );

        if (result.nModified > 0) {
            res.status(200).json({ message: "Coupons updated successfully." });
        } else {
            res.status(404).json({ message: "Phone number not found." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});