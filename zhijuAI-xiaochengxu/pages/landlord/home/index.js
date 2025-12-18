Page({
    data: {
        properties: [
            {
                id: '1',
                title: '朝阳区·国贸·阳光明媚的市中心高级公寓',
                price: 8500,
                status: 'RENTED',
                views: 128
            },
            {
                id: '2',
                title: '徐汇区·法租界·温馨静谧的花园洋房',
                price: 12000,
                status: 'VACANT',
                views: 45
            },
            {
                id: '3',
                title: '南山区·科技园·科技园旁拎包入住',
                price: 4500,
                status: 'VACANT',
                views: 260
            }
        ]
    },

    onLoad(options) {
        // In real app, fetch from API with Landlord ID
    }
})
