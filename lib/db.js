import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function dbConnect() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        const uri = process.env.MONGODB_URI;
        cached.promise = mongoose.connect(uri, {
            dbName: 'bd_voter_auth',
            bufferCommands: false,
        }).then((m) => m);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
