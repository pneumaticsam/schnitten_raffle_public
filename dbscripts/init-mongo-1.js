
db = db.getSiblingDB('admin')

db.createUser({
    user: 'raffle-admin',
    pwd: 'password',
    roles: [
        {
            role: 'readWrite',
            db: 'raffle-db',
        },
    ],
});

db = new Mongo().getDB("raffle-db");

db.createCollection('users', { capped: false });
db.createCollection('test', { capped: false });

db.test.insert([
    { "item": 1 },
    { "item": 2 },
    { "item": 3 },
    { "item": 4 },
    { "item": 5 }
]);