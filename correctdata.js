require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function correctData() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const collection = client.db("warehouse").collection("orders");
        
        // Find orders with orderList stored as a string
        const orders = await collection.find({ orderList: { $type: "string" } }).toArray();

        for (let order of orders) {
            let correctedOrderList;
            try {
                correctedOrderList = JSON.parse(order.orderList);
            } catch (error) {
                console.error(`Failed to parse orderList for order with id ${order._id}. Skipping...`);
                continue;  // Move to next iteration if parsing fails
            }

            // Update the order in the database
            await collection.updateOne(
                { _id: order._id },
                { $set: { orderList: correctedOrderList } }
            );
            console.log(`Corrected orderList for order with id ${order._id}.`);
        }

        console.log("Data correction completed.");
    } catch (error) {
        console.error("Error during data correction:", error);
    } finally {
        await client.close();
    }
}

correctData();
