const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
    try {
        await client.connect();
        const db = client.db('Shop');
        const collection = db.collection('Shoes');

        if (req.method === 'POST') {
            const { id, contact } = req.body;
            // 原子操作减库存
            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(id), stock: { $gt: 0 } },
                { $inc: { stock: -1 } }
            );
            if (result) {
                // 这里可以扩展发送购物单给你的功能
                return res.status(200).json({ message: "预购成功！我将尽快联系您。" });
            }
            return res.status(400).json({ message: "手慢了，库存不足！" });
        } else {
            const shoes = await collection.find({}).toArray();
            return res.status(200).json(shoes);
        }
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}
