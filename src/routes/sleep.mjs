import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import sleepDataMap from '../models/sleepDataMap.mjs';
import recordMap from '../models/recordMap.mjs';
const router = express.Router();

function deleteIndex(record, recordId) {
    const arr = record.data;
    let i, count = 0;
    //console.log(recordMap);
    for(i = 0; i < arr.length; i++){
        if (arr[i].recordId === recordId){
            arr.splice(i,1);
            recordMap.delete(recordId);
            return;
        }
    }    
}

// POST /sleep
router.post('/sleep', (req, res) => {
    const { userId, hours, timestamp } = req.body;
    
    if (new Date(timestamp) > new Date()) {
        return res.status(400).json({ error: 'invalid timestamp' });
    }
    if (!userId || !hours || !timestamp) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newRecord = {
        recordId : uuidv4(),
        hours,
        timestamp
    };

    let record = sleepDataMap.get(userId);

    if(record == null){ 
        const newUser = {id : uuidv4(),userId,data : []};
        sleepDataMap.set(userId,newUser);
    }
    recordMap.set(newRecord.recordId,userId);
    sleepDataMap.get(userId).data.push(newRecord);
    res.status(201).json(sleepDataMap.get(userId));

});

// GET /sleep/:userId
router.get('/sleep/:userId', (req, res) => {
    const { userId } = req.params;
    const userSleepData = sleepDataMap.get(userId);

    if (userSleepData == undefined || userSleepData.data.length == 0) {
        return res.status(404).json({ error: 'No records found for this user' });
    }

    userSleepData.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    res.json(userSleepData);
});

// DELETE /sleep/:recordId
router.delete('/sleep/:recordId', (req, res) => {
    const { recordId } = req.params;
    const userId = recordMap.get(recordId);

    if (userId == undefined) {
        return res.status(404).json({ error: 'Record not found' });
    }

    deleteIndex(sleepDataMap.get(userId),recordId);

    res.status(204).send();
});

export default router;
