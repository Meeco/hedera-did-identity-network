db.createView('diddocuments', 'didevents', [
    {
        $sort: { "timestamp": 1 }
    },
    {
        $group: {
            _id: '$did',
            history: {
                $push: {
                    operation: '$operation',
                    timestamp: '$timestamp'
                }
            },
            createdBy: {
                $first: '$signature'
            },
            createdAt: {
                $first: '$timestamp'
            }, updatedBy: {
                $last: '$signature'
            }, updatedAt: {
                $last: '$timestamp'
            }
        }
    },
    {
        $replaceRoot: {
            newRoot: {
                $mergeObjects: [
                    {
                        id: '$_id',
                    },
                    '$didDetails',
                    {
                        history: '$history',
                        createdBy: '$createdBy',
                        createdAt: '$createdAt',
                        updatedBy: '$updatedBy',
                        updatedAt: '$updatedAt'
                    }
                ]
            }
        }
    },
    {
        $project: {
            id: 1,
            history: 1,
            createdBy: 1,
            createdAt: 1,
            updatedBy: 1,
            updatedAt: 1
        }
    }
])