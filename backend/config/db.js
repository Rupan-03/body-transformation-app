const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // The deprecated options have been removed from this line
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;