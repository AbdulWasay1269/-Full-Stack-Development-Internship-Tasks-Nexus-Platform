const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000 // Add a timeout so it doesn't hang forever
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        console.warn("WARNING: Backend is running without a database connection! API calls needing DB will fail.");
        // We removed process.exit(1) so the server stays alive to report the error to the React frontend
    }
};

module.exports = connectDB;
