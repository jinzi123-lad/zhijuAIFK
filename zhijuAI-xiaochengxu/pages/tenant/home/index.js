Page({
    data: {
        properties: [
            {
                id: '1',
                title: '阳光明媚的市中心高级公寓',
                imageUrl: '', // Mock
                price: 8500,
                tags: ['近地铁', '精装修', '随时看房'],
                location: '朝阳区·国贸',
                area: 65,
                layout: '1室1厅'
            },
            {
                id: '2',
                title: '温馨静谧的花园洋房',
                imageUrl: '', // Mock
                price: 12000,
                tags: ['绿化好', '大阳台'],
                location: '徐汇区·法租界',
                area: 90,
                layout: '2室2厅'
            },
            {
                id: '3',
                title: '科技园旁拎包入住',
                imageUrl: '', // Mock
                price: 4500,
                tags: ['押一付一', '近公司'],
                location: '南山区·科技园',
                area: 40,
                layout: '1室0厅'
            }
        ]
    },

    onLoad(options) {
        // In real app, fetch from API
    }
})
