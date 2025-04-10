import mongoose from "mongoose"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

async function fixIndexes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected to MongoDB")

        // Get the collection
        const collection = mongoose.connection.collection("courses")

        // List all indexes
        const indexes = await collection.indexes()
        console.log("Current indexes:", JSON.stringify(indexes, null, 2))

        // Drop the simple code index if it exists
        const codeIndex = indexes.find(
            (index) => index.key && Object.keys(index.key).length === 1 && index.key.code === 1 && index.unique === true,
        )

        if (codeIndex) {
            console.log("Dropping simple code index:", codeIndex.name)
            await collection.dropIndex(codeIndex.name)
            console.log("Simple code index dropped")
        } else {
            console.log("No simple unique code index found")
        }

        // Create the compound index
        console.log("Creating compound index")
        await collection.createIndex(
            { code: 1, lectureType: 1, division: 1, year: 1, branch: 1 },
            { unique: true, background: true },
        )
        console.log("Compound index created")

        // List updated indexes
        const updatedIndexes = await collection.indexes()
        console.log("Updated indexes:", JSON.stringify(updatedIndexes, null, 2))

        console.log("Index fix completed successfully")
    } catch (error) {
        console.error("Error fixing indexes:", error)
    } finally {
        // Close the connection
        await mongoose.connection.close()
        console.log("MongoDB connection closed")
        process.exit(0)
    }
}

// Run the function
fixIndexes()
