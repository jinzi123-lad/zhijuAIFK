Component({
  properties: {
    selected: {
      type: Number,
      value: 0
    }
  },
  data: {
    list: [
      { pagePath: "/pages/landlord/home/index", text: "首页", icon: "home" }, // 0
      { pagePath: "/pages/landlord/discovery/index", text: "发现", icon: "compass" }, // 1
      { type: 'add' }, // 2 (Special Center)
      { pagePath: "/pages/landlord/message/index", text: "消息", icon: "message" }, // 3
      { pagePath: "/pages/landlord/user/index", text: "我的", icon: "user" } // 4
    ]
  },
  methods: {
    switchTab(e) {
      const { index } = e.currentTarget.dataset;
      const url = index === 0 ? "/pages/landlord/home/index" : "/pages/landlord/user/index"; // Mock

      if (index !== this.data.selected) {
        wx.reLaunch({ url })
      }
    },
    onAdd() {
      wx.showActionSheet({
        itemList: ['添加房源', '记录收支', '新建合同'],
        success: (res) => {
          if (res.tapIndex === 0) {
            wx.navigateTo({ url: '/pages/landlord/property/add/index' })
          }
        }
      })
    }
  }
})
