// test/sleep.test.js

import { should } from 'chai';
import request from 'supertest';
import app from '../src/app.mjs';
import  sleepDataMap from '../src/models/sleepDataMap.mjs';
import recordMap from '../src/models/recordMap.mjs';


should();



describe('Sleep API', () => {
    beforeEach(() => {
        sleepDataMap.clear(); // Clear the in-memory database before each test
    });

    it('should create a new sleep record', (done) => {
        request(app)
            .post('/api/sleep')
            .send({ userId: 'user1', hours: 8, timestamp: '2024-05-18T08:00:00Z' })
            .expect(201)
            .expect((res) => {
                res.body.should.have.property('id');
                res.body.userId.should.equal('user1');
                res.body.data.length.should.equal(1);
                res.body.data[0].hours.should.equal(8);
                res.body.data[0].timestamp.should.equal('2024-05-18T08:00:00Z');
            })
            .end(done);
    });

    it('should retrieve sleep records for a user', (done) => {
        const record = { id: '1', userId: 'user1', data : [{ recordId : '123', hours: 8, timestamp: '2024-05-18T08:00:00Z' }]};
        sleepDataMap.set(record.userId,record);
        recordMap.set(record.data[0].recordId,record.userId);

        request(app)
        .get('/api/sleep/user1')
        .expect(200)
        .expect((res) => {
            res.body.data.should.be.an('array').that.has.lengthOf(1);
            res.body.should.deep.equal(record);
        })
        .end(done);
    });

    it('should delete a sleep record', (done) => {
        const record = { id: '1', userId: 'user1', data : [{ recordId : '123', hours: 8, timestamp: '2024-05-18T08:00:00Z' }]};
        sleepDataMap.set(record.userId,record);
        recordMap.set(record.data[0].recordId,record.userId);

        request(app)
            .delete('/api/sleep/123')
            .expect(204)
            .end((err) => {
                if (err) return done(err);
                sleepDataMap.get('user1').data.length.should.equal(0);
                done();
            });
    });

    it('should return 404 for deleting a non-existing record', (done) => {
        request(app)
            .delete('/api/sleep/nonexistent')
            .expect(404, done);
    });

    it('should return 400 for invalid fields(timestamp) in POST /sleep', (done) => {
        request(app)
            .post('/api/sleep')
            .send({ userId: 'user1', hours: 8, timestamp: '2025-05-18T08:00:00Z' })
            .expect(400, done);
    });
    it('should return 400 for missing fields in POST /sleep', (done) => {
        request(app)
            .post('/api/sleep')
            .send({ userId: 'user1', hours: 8 })
            .expect(400, done);
    });

});
